import {
  BLOOD_COLORS,
  CANONICAL_LOOP_ORDER,
  CAPILLARY_BRANCHES,
  PATH_SEGMENTS,
  isValveOpen,
  sampleCubicPathPoints,
} from '../assets/circulationPaths.js';

export const CARDIAC_CYCLE_DURATION_MS = 1800;

export const CARDIAC_PHASE_BOUNDS = {
  atrial_systole: { start: 0.0, end: 0.22 },
  ventricular_systole: { start: 0.22, end: 0.58 },
  diastole: { start: 0.58, end: 1.0 },
};

export const PULMONARY_LOOP_IDS = new Set([
  'right_ventricle',
  'pulmonary_valve',
  'pulmonary_artery',
  'pulmonary_capillaries',
  'pulmonary_vein',
  'left_atrium',
]);

export const SYSTEMIC_LOOP_IDS = new Set([
  'left_ventricle',
  'aortic_valve',
  'aorta',
  'systemic_capillaries',
  'vena_cava',
  'right_atrium',
]);

export const AV_VALVE_IDS = new Set(['tricuspid_valve', 'bicuspid_valve']);
export const SEMILUNAR_VALVE_IDS = new Set(['pulmonary_valve', 'aortic_valve']);

const BASE_FLOW_SPEED = 148; // canonical px/sec at 1.0x
const DEFAULT_PARTICLE_COUNT = 128;

/**
 * Parse a #RRGGBB hex string into integer RGB channels.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
export function parseHexRgb(hex) {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

/**
 * Linearly interpolate between two #RRGGBB colors.
 * @param {string} hexA
 * @param {string} hexB
 * @param {number} t - Progress clamped to [0, 1].
 * @returns {{ r: number, g: number, b: number, css: string }}
 */
export function lerpRgbColor(hexA, hexB, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const a = parseHexRgb(hexA);
  const b = parseHexRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * clamped);
  const g = Math.round(a.g + (b.g - a.g) * clamped);
  const bl = Math.round(a.b + (b.b - a.b) * clamped);
  return {
    r,
    g,
    b: bl,
    css: `rgb(${r}, ${g}, ${bl})`,
  };
}

/**
 * Build an arc-length parameterized polyline from an SVG cubic path string.
 * Ensures particles move at uniform physical speed along Bezier curves.
 * @param {string} d
 * @param {number} [stepsPerCurve=40]
 * @returns {{ points: Array<{x:number,y:number,angle:number}>, cumLen: number[], totalLength: number }}
 */
function buildArcLengthPolyline(d, stepsPerCurve = 40) {
  const points = sampleCubicPathPoints(d, stepsPerCurve);
  if (points.length === 0) {
    return { points: [{ x: 0, y: 0, angle: 0 }], cumLen: [0], totalLength: 1 };
  }

  const cumLen = [0];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.hypot(dx, dy);
    cumLen.push(totalLength);
  }

  return {
    points,
    cumLen,
    totalLength: Math.max(totalLength, 1),
  };
}

/**
 * Sample `{ x, y, angle }` along a precomputed polyline at arc-length distance `dist`.
 * @param {{ points: Array<{x:number,y:number,angle:number}>, cumLen: number[], totalLength: number }} polyline
 * @param {number} dist
 * @returns {{ x: number, y: number, angle: number }}
 */
function samplePolylineAtDistance(polyline, dist) {
  const { points, cumLen, totalLength } = polyline;
  const target = Math.max(0, Math.min(totalLength, dist));

  let low = 0;
  let high = cumLen.length - 1;
  while (low < high - 1) {
    const mid = (low + high) >> 1;
    if (cumLen[mid] <= target) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const lenA = cumLen[low];
  const lenB = cumLen[high];
  const span = lenB - lenA;
  const ratio = span > 1e-6 ? (target - lenA) / span : 0;

  const pA = points[low];
  const pB = points[high];

  // Interpolate angle along shortest circular arc
  let angleDiff = pB.angle - pA.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  return {
    x: pA.x + (pB.x - pA.x) * ratio,
    y: pA.y + (pB.y - pA.y) * ratio,
    angle: pA.angle + angleDiff * ratio,
  };
}

/**
 * Resolve cardiac phase name and normalized [0, 1] progress within that phase.
 * @param {number} cycleProgress - Normalized [0, 1) cardiac cycle progress.
 * @returns {{ cardiacPhase: 'atrial_systole' | 'ventricular_systole' | 'diastole', phaseProgress: number }}
 */
export function resolveCardiacPhase(cycleProgress) {
  const p = ((cycleProgress % 1) + 1) % 1;
  if (p < CARDIAC_PHASE_BOUNDS.atrial_systole.end) {
    const { start, end } = CARDIAC_PHASE_BOUNDS.atrial_systole;
    return {
      cardiacPhase: 'atrial_systole',
      phaseProgress: (p - start) / (end - start),
    };
  }
  if (p < CARDIAC_PHASE_BOUNDS.ventricular_systole.end) {
    const { start, end } = CARDIAC_PHASE_BOUNDS.ventricular_systole;
    return {
      cardiacPhase: 'ventricular_systole',
      phaseProgress: (p - start) / (end - start),
    };
  }
  const { start, end } = CARDIAC_PHASE_BOUNDS.diastole;
  return {
    cardiacPhase: 'diastole',
    phaseProgress: (p - start) / (end - start),
  };
}

/**
 * Compute unidirectional forward velocity multiplier for a particle in a given segment.
 * Strictly >= 0 so particles NEVER move backward.
 *
 * @param {object} segment - Segment definition from PATH_SEGMENTS.
 * @param {number} localU - Normalized progress [0, 1] inside the segment.
 * @param {'atrial_systole'|'ventricular_systole'|'diastole'} cardiacPhase
 * @param {number} phaseProgress - Normalized [0, 1] progress inside current phase.
 * @returns {number} Non-negative velocity factor.
 */
export function computePulsatileVelocityFactor(segment, localU, cardiacPhase, phaseProgress) {
  const id = segment.id;
  const sinPulse = Math.sin(Math.max(0, Math.min(1, phaseProgress)) * Math.PI);
  const avOpen = isValveOpen('tricuspid_valve', cardiacPhase) && isValveOpen('bicuspid_valve', cardiacPhase);
  const semilunarOpen = isValveOpen('pulmonary_valve', cardiacPhase) && isValveOpen('aortic_valve', cardiacPhase);

  if (cardiacPhase === 'atrial_systole') {
    // Atria contract -> push blood through open AV valves into ventricles
    if (id === 'right_atrium' || id === 'left_atrium') {
      return 1.05 + 1.15 * sinPulse;
    }
    if (id === 'tricuspid_valve' || id === 'bicuspid_valve') {
      return 1.2 + 1.25 * sinPulse;
    }
    if (id === 'right_ventricle' || id === 'left_ventricle') {
      // Semilunar valves are CLOSED: blood fills the ventricle and waits near outlet
      if (!semilunarOpen && localU > 0.84) {
        return 0;
      }
      return 0.72 + 0.35 * sinPulse;
    }
    if (id === 'pulmonary_valve' || id === 'aortic_valve') {
      // Clear any particle already mid-valve strictly forward
      return 0.55;
    }
    if (id === 'pulmonary_artery' || id === 'aorta') {
      return 0.54;
    }
    if (id === 'pulmonary_capillaries' || id === 'systemic_capillaries') {
      return 0.92;
    }
    return 0.78;
  }

  if (cardiacPhase === 'ventricular_systole') {
    const ejectPulse = Math.pow(sinPulse, 0.75);
    // Ventricles contract powerfully -> open semilunar valves, surge into arteries
    if (id === 'right_ventricle' || id === 'left_ventricle') {
      return 1.2 + 1.55 * ejectPulse;
    }
    if (id === 'pulmonary_valve' || id === 'aortic_valve') {
      return 1.35 + 1.6 * ejectPulse;
    }
    if (id === 'pulmonary_artery' || id === 'aorta') {
      // Traveling systolic wave along the artery
      const wave = 0.65 + 0.35 * Math.max(0, Math.sin((phaseProgress - localU * 0.35) * Math.PI));
      return 0.92 + 1.68 * ejectPulse * wave;
    }
    if (id === 'right_atrium' || id === 'left_atrium') {
      // AV valves are CLOSED during ventricular systole: prevent premature exit
      if (!avOpen && localU > 0.78) {
        return 0;
      }
      return 0.52;
    }
    if (id === 'tricuspid_valve' || id === 'bicuspid_valve') {
      return 0.65;
    }
    if (id === 'pulmonary_capillaries' || id === 'systemic_capillaries') {
      return 1.04;
    }
    return 0.85;
  }

  // diastole: Semilunar valves CLOSED (prevent backflow), AV valves OPEN (passive filling)
  if (id === 'vena_cava' || id === 'pulmonary_vein') {
    return 1.02 + 0.32 * sinPulse;
  }
  if (id === 'right_atrium' || id === 'left_atrium') {
    return 0.9 + 0.28 * (1 - phaseProgress);
  }
  if (id === 'tricuspid_valve' || id === 'bicuspid_valve') {
    return 0.92 + 0.25 * (1 - phaseProgress);
  }
  if (id === 'right_ventricle' || id === 'left_ventricle') {
    // Semilunar valves are CLOSED: fill chamber passively, queue gently before closed valve
    if (!semilunarOpen && localU > 0.84) {
      return 0;
    }
    return 0.76 * (1 - 0.35 * phaseProgress);
  }
  if (id === 'pulmonary_valve' || id === 'aortic_valve') {
    return 0.5;
  }
  if (id === 'pulmonary_artery' || id === 'aorta') {
    // Elastic recoil keeps arterial flow strictly forward during diastole
    return 0.5 + 0.14 * (1 - phaseProgress);
  }
  return 0.94;
}

/**
 * CirculationEngine manages RBC particle state, cardiac-cycle pulsatile physics,
 * real-time RGB color interpolation, mode visibility, and 60fps Canvas rendering.
 */
export class CirculationEngine {
  constructor(options = {}) {
    this.speed = options.speed ?? 1;
    this.mode = options.mode ?? 'all';
    this.selectedNodeId = options.selectedNodeId ?? null;
    this.particleCount = options.particleCount ?? DEFAULT_PARTICLE_COUNT;

    this.cycleElapsedMs = 0;
    this.cardiacPhase = 'atrial_systole';
    this.cardiacProgress = 0;
    this.phaseProgress = 0;
    this.selectionPulseTime = 0;

    this.segments = this._buildSegments();
    this.segmentIndexById = Object.fromEntries(
      this.segments.map((seg, index) => [seg.id, index])
    );
    this.particles = this._createParticles(this.particleCount);
  }

  /**
   * Precompute arc-length lookup tables for all 14 main segments and capillary branches.
   * @private
   */
  _buildSegments() {
    let cumulativeStart = 0;
    return PATH_SEGMENTS.map((seg) => {
      const mainPolyline = buildArcLengthPolyline(seg.d, 44);
      const branchDefs = CAPILLARY_BRANCHES[seg.id];
      const branches = branchDefs
        ? branchDefs.map((branchD) => buildArcLengthPolyline(branchD, 44))
        : [mainPolyline];

      const built = {
        ...seg,
        polyline: mainPolyline,
        branches,
        totalLength: mainPolyline.totalLength,
        loopStartOffset: cumulativeStart,
      };
      cumulativeStart += mainPolyline.totalLength;
      return built;
    });
  }

  /**
   * Spawn RBC particles evenly distributed around the closed circulation loop.
   * @private
   */
  _createParticles(count) {
    const totalLength = this.segments.reduce((acc, s) => acc + s.totalLength, 0);
    const particles = [];

    for (let i = 0; i < count; i++) {
      // Deterministic even spacing with slight organic jitter
      const frac = (i + 0.35 + ((i * 37) % 11) * 0.04) / count;
      const targetDist = (frac % 1) * totalLength;

      let segIdx = 0;
      let localDist = 0;
      let acc = 0;
      for (let s = 0; s < this.segments.length; s++) {
        const segLen = this.segments[s].totalLength;
        if (targetDist <= acc + segLen || s === this.segments.length - 1) {
          segIdx = s;
          localDist = Math.max(0, Math.min(segLen, targetDist - acc));
          break;
        }
        acc += segLen;
      }

      const laneSign = i % 2 === 0 ? 1 : -1;
      const laneMag = ((i * 19) % 7) / 6; // 0..1

      particles.push({
        id: i,
        segmentIndex: segIdx,
        localDist,
        branchIndex: i % 4,
        lateralOffset: laneSign * (0.8 + laneMag * 3.2),
        wobblePhase: (i * 1.37) % (Math.PI * 2),
        wobbleFreq: 2.1 + ((i * 7) % 5) * 0.35,
        sizeScale: 0.92 + ((i * 13) % 5) * 0.04,
      });
    }

    return particles;
  }

  reset() {
    this.cycleElapsedMs = 0;
    this.cardiacPhase = 'atrial_systole';
    this.cardiacProgress = 0;
    this.phaseProgress = 0;
    this.particles = this._createParticles(this.particleCount);
  }

  setSpeed(speed) {
    if (typeof speed === 'number' && speed > 0) {
      this.speed = speed;
    }
  }

  setMode(mode) {
    this.mode = mode || 'all';
  }

  setSelectedNodeId(nodeId) {
    if (this.selectedNodeId !== nodeId) {
      this.selectionPulseTime = 0;
    }
    this.selectedNodeId = nodeId ?? null;
  }

  getCardiacState() {
    return {
      cardiacPhase: this.cardiacPhase,
      cardiacProgress: this.cardiacProgress,
      phaseProgress: this.phaseProgress,
      cycleDurationMs: CARDIAC_CYCLE_DURATION_MS / this.speed,
    };
  }

  /**
   * Advance the simulation by `dtMs` milliseconds (clamped for stability).
   * Strictly unidirectional: particle distances can only increase.
   *
   * @param {number} dtMs
   * @returns {{ cardiacPhase: string, cardiacProgress: number, phaseProgress: number, phaseChanged: boolean }}
   */
  step(dtMs) {
    const safeDtMs = Math.max(0, Math.min(50, dtMs));
    const effectiveDtMs = safeDtMs * this.speed;
    const dtSec = effectiveDtMs / 1000;

    this.selectionPulseTime += safeDtMs / 1000;

    const prevPhase = this.cardiacPhase;
    this.cycleElapsedMs = (this.cycleElapsedMs + effectiveDtMs) % CARDIAC_CYCLE_DURATION_MS;
    this.cardiacProgress = this.cycleElapsedMs / CARDIAC_CYCLE_DURATION_MS;

    const resolved = resolveCardiacPhase(this.cardiacProgress);
    this.cardiacPhase = resolved.cardiacPhase;
    this.phaseProgress = resolved.phaseProgress;

    const segCount = this.segments.length;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.wobblePhase += dtSec * p.wobbleFreq;

      const segment = this.segments[p.segmentIndex];
      const activePoly = segment.branches[p.branchIndex % segment.branches.length];
      const segLength = activePoly.totalLength;
      const localU = segLength > 0 ? p.localDist / segLength : 0;

      const pulsatileFactor = computePulsatileVelocityFactor(
        segment,
        localU,
        this.cardiacPhase,
        this.phaseProgress
      );

      // Strictly non-negative displacement
      const deltaDist = Math.max(
        0,
        BASE_FLOW_SPEED * segment.speedMultiplier * pulsatileFactor * dtSec
      );

      p.localDist += deltaDist;

      while (p.localDist >= this.segments[p.segmentIndex].branches[p.branchIndex % this.segments[p.segmentIndex].branches.length].totalLength) {
        const currentPoly = this.segments[p.segmentIndex].branches[p.branchIndex % this.segments[p.segmentIndex].branches.length];
        p.localDist -= currentPoly.totalLength;
        p.segmentIndex = (p.segmentIndex + 1) % segCount;
      }
    }

    return {
      cardiacPhase: this.cardiacPhase,
      cardiacProgress: this.cardiacProgress,
      phaseProgress: this.phaseProgress,
      phaseChanged: prevPhase !== this.cardiacPhase,
    };
  }

  /**
   * Compute opacity for a particle in a segment given the active display mode.
   * @private
   */
  _getSegmentAlpha(segment) {
    if (this.mode === 'pulmonary') {
      if (PULMONARY_LOOP_IDS.has(segment.id)) return 1.0;
      if (segment.id === 'tricuspid_valve' || segment.id === 'bicuspid_valve') return 0.22;
      return 0.14;
    }
    if (this.mode === 'systemic') {
      if (SYSTEMIC_LOOP_IDS.has(segment.id)) return 1.0;
      if (segment.id === 'tricuspid_valve' || segment.id === 'bicuspid_valve') return 0.22;
      return 0.14;
    }
    return 1.0;
  }

  /**
   * Return resolved particle positions and colors for inspection/testing.
   */
  getParticleSnapshot() {
    return this.particles.map((p) => {
      const seg = this.segments[p.segmentIndex];
      const poly = seg.branches[p.branchIndex % seg.branches.length];
      const localU = Math.max(0, Math.min(1, p.localDist / poly.totalLength));
      const pos = samplePolylineAtDistance(poly, p.localDist);
      const color = lerpRgbColor(seg.colorStart, seg.colorEnd, localU);
      return {
        id: p.id,
        segmentId: seg.id,
        localProgress: localU,
        x: pos.x,
        y: pos.y,
        angle: pos.angle,
        color: color.css,
      };
    });
  }

  /**
   * Render all RBC particles and selected-step highlights onto a 2D canvas context
   * already scaled to the canonical `1000 x 760` coordinate space.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} [width=1000]
   * @param {number} [height=760]
   */
  render(ctx, width = 1000, height = 760) {
    ctx.clearRect(0, 0, width, height);

    // 1. If a node is selected, draw a subtle luminous flow guide under the particles
    if (this.selectedNodeId && this.segmentIndexById[this.selectedNodeId] !== undefined) {
      const selectedSeg = this.segments[this.segmentIndexById[this.selectedNodeId]];
      this._renderSelectedSegmentGuide(ctx, selectedSeg);
    }

    const isBloodTypeMode = this.mode === 'blood_type';

    // 2. Render RBC particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const seg = this.segments[p.segmentIndex];
      const alpha = this._getSegmentAlpha(seg);
      if (alpha <= 0.02) continue;

      const poly = seg.branches[p.branchIndex % seg.branches.length];
      const localU = Math.max(0, Math.min(1, p.localDist / poly.totalLength));
      const pos = samplePolylineAtDistance(poly, p.localDist);

      // Taper lateral spread inside narrow valves and capillaries
      const laneScale =
        seg.category === 'valve'
          ? 0.25
          : seg.category === 'capillary'
          ? 0.32
          : seg.category === 'chamber'
          ? 1.45
          : 0.95;

      const wobble = Math.sin(p.wobblePhase) * (seg.category === 'capillary' ? 0.55 : 1.15);
      const normalX = -Math.sin(pos.angle);
      const normalY = Math.cos(pos.angle);
      const px = pos.x + normalX * (p.lateralOffset * laneScale + wobble);
      const py = pos.y + normalY * (p.lateralOffset * laneScale + wobble);

      const rgb = lerpRgbColor(seg.colorStart, seg.colorEnd, localU);
      const isSelected = this.selectedNodeId === seg.id;
      const scale = p.sizeScale * (isSelected ? 1.24 : 1.0);
      const rx = (seg.category === 'capillary' ? 4.8 : 5.6) * scale;
      const ry = (seg.category === 'capillary' ? 3.2 : 3.8) * scale;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pos.angle);
      ctx.globalAlpha = alpha;

      // Vivid glow halos in 'blood_type' mode
      if (isBloodTypeMode) {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 2.15, ry * 2.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 1.48, ry * 1.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.42)`;
        ctx.fill();
      }

      // Golden focus halo on particles inside the currently selected step
      if (isSelected) {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 1.65, ry * 1.75, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.38)';
        ctx.fill();
      }

      // RBC main biconcave body
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgb.css;
      ctx.fill();

      ctx.lineWidth = isSelected ? 1.35 : 0.9;
      ctx.strokeStyle = isSelected ? BLOOD_COLORS.highlight : 'rgba(15, 23, 42, 0.42)';
      ctx.stroke();

      // Inner dimple highlight to evoke biconcave RBC disc
      ctx.beginPath();
      ctx.ellipse(-rx * 0.14, -ry * 0.1, rx * 0.46, ry * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Draw an animated golden directional trace along the selected anatomical node.
   * @private
   */
  _renderSelectedSegmentGuide(ctx, segment) {
    const pulseAlpha = 0.22 + 0.12 * Math.sin(this.selectionPulseTime * 4.5);
    const branches = segment.branches;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let b = 0; b < branches.length; b++) {
      const pts = branches[b].points;
      if (pts.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = `rgba(250, 204, 21, ${pulseAlpha.toFixed(3)})`;
      ctx.lineWidth = segment.category === 'capillary' ? 6 : 12;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -this.selectionPulseTime * 48;
      ctx.stroke();
    }

    ctx.restore();
  }
}

export { CANONICAL_LOOP_ORDER };
export default CirculationEngine;
