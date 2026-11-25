/**
 * Canonical SVG geometry and blood-flow path definitions for the interactive
 * circulation simulation (`viewBox="0 0 1000 760"`).
 *
 * Shared single source of truth for both `CirculationSVG.jsx` (visual paths)
 * and `CirculationEngine.js` / `BloodFlowCanvas.jsx` (60fps RBC particle paths).
 *
 * Anatomical orientation: Viewer facing the subject (standard medical diagram).
 * - Right heart (`right_atrium`, `right_ventricle`) is on the viewer's LEFT.
 * - Left heart (`left_atrium`, `left_ventricle`) is on the viewer's RIGHT.
 *
 * Strict unidirectional loop:
 * vena_cava -> right_atrium -> tricuspid_valve -> right_ventricle ->
 * pulmonary_valve -> pulmonary_artery -> pulmonary_capillaries ->
 * pulmonary_vein -> left_atrium -> bicuspid_valve -> left_ventricle ->
 * aortic_valve -> aorta -> systemic_capillaries -> vena_cava
 */

export const CANONICAL_VIEWBOX = {
  width: 1000,
  height: 760,
  string: '0 0 1000 760',
};

export const BLOOD_COLORS = {
  arterial: '#E63946',
  venous: '#457B9D',
  valve: '#F59E0B',
  highlight: '#FACC15',
};

/**
 * Exact 14 canonical node IDs ordered from right_ventricle through pulmonary
 * and systemic circulation, matching `curriculumData.json` `meta.stepOrder`.
 */
export const CANONICAL_LOOP_ORDER = [
  'right_ventricle',
  'pulmonary_valve',
  'pulmonary_artery',
  'pulmonary_capillaries',
  'pulmonary_vein',
  'left_atrium',
  'bicuspid_valve',
  'left_ventricle',
  'aortic_valve',
  'aorta',
  'systemic_capillaries',
  'vena_cava',
  'right_atrium',
  'tricuspid_valve',
];

/**
 * Continuous, gap-free ordered segments forming the closed circulation loop.
 * Every segment's `endPoint` equals the next segment's `startPoint` (wrapping
 * from `tricuspid_valve` back into `right_ventricle`).
 */
export const PATH_SEGMENTS = [
  {
    id: 'right_ventricle',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'venous',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 442, y: 384 },
    endPoint: { x: 474, y: 358 },
    d: 'M 442 384 C 428 438, 438 476, 458 468 C 476 460, 476 406, 474 358',
    speedMultiplier: 0.9,
    pulsatilePhase: 'ventricular_systole',
  },
  {
    id: 'pulmonary_valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'venous',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 474, y: 358 },
    endPoint: { x: 470, y: 326 },
    d: 'M 474 358 C 473 347, 471 337, 470 326',
    speedMultiplier: 1.25,
    pulsatilePhase: 'ventricular_systole',
  },
  {
    id: 'pulmonary_artery',
    loop: 'pulmonary',
    category: 'artery',
    bloodType: 'venous',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 470, y: 326 },
    endPoint: { x: 325, y: 118 },
    d: 'M 470 326 C 466 268, 460 212, 424 166 C 392 126, 355 122, 325 118',
    speedMultiplier: 1.15,
    pulsatilePhase: 'ventricular_systole',
  },
  {
    id: 'pulmonary_capillaries',
    loop: 'pulmonary',
    category: 'capillary',
    bloodType: 'gas_exchange',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 325, y: 118 },
    endPoint: { x: 675, y: 118 },
    d: 'M 325 118 C 420 96, 580 96, 675 118',
    speedMultiplier: 0.65,
    pulsatilePhase: 'steady',
  },
  {
    id: 'pulmonary_vein',
    loop: 'pulmonary',
    category: 'vein',
    bloodType: 'arterial',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 675, y: 118 },
    endPoint: { x: 598, y: 304 },
    d: 'M 675 118 C 668 175, 646 250, 598 304',
    speedMultiplier: 0.95,
    pulsatilePhase: 'diastole',
  },
  {
    id: 'left_atrium',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'arterial',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 598, y: 304 },
    endPoint: { x: 566, y: 358 },
    d: 'M 598 304 C 584 326, 574 342, 566 358',
    speedMultiplier: 0.85,
    pulsatilePhase: 'atrial_systole',
  },
  {
    id: 'bicuspid_valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'arterial',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 566, y: 358 },
    endPoint: { x: 558, y: 384 },
    d: 'M 566 358 C 563 367, 561 375, 558 384',
    speedMultiplier: 1.15,
    pulsatilePhase: 'atrial_systole',
  },
  {
    id: 'left_ventricle',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'arterial',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 558, y: 384 },
    endPoint: { x: 526, y: 358 },
    d: 'M 558 384 C 574 442, 566 482, 544 472 C 524 462, 524 405, 526 358',
    speedMultiplier: 0.95,
    pulsatilePhase: 'ventricular_systole',
  },
  {
    id: 'aortic_valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'arterial',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 526, y: 358 },
    endPoint: { x: 530, y: 326 },
    d: 'M 526 358 C 527 347, 529 337, 530 326',
    speedMultiplier: 1.35,
    pulsatilePhase: 'ventricular_systole',
  },
  {
    id: 'aorta',
    loop: 'systemic',
    category: 'artery',
    bloodType: 'arterial',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.arterial,
    startPoint: { x: 530, y: 326 },
    endPoint: { x: 710, y: 648 },
    d: 'M 530 326 C 534 258, 558 192, 645 190 C 735 188, 778 250, 778 360 C 778 485, 778 605, 710 648',
    speedMultiplier: 1.25,
    pulsatilePhase: 'ventricular_systole',
  },
  {
    id: 'systemic_capillaries',
    loop: 'systemic',
    category: 'capillary',
    bloodType: 'material_exchange',
    colorStart: BLOOD_COLORS.arterial,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 710, y: 648 },
    endPoint: { x: 290, y: 648 },
    d: 'M 710 648 C 610 626, 390 626, 290 648',
    speedMultiplier: 0.65,
    pulsatilePhase: 'steady',
  },
  {
    id: 'vena_cava',
    loop: 'systemic',
    category: 'vein',
    bloodType: 'venous',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 290, y: 648 },
    endPoint: { x: 402, y: 306 },
    d: 'M 290 648 C 222 605, 222 485, 222 360 C 222 292, 295 288, 402 306',
    speedMultiplier: 0.95,
    pulsatilePhase: 'diastole',
  },
  {
    id: 'right_atrium',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'venous',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 402, y: 306 },
    endPoint: { x: 434, y: 358 },
    d: 'M 402 306 C 416 324, 426 340, 434 358',
    speedMultiplier: 0.85,
    pulsatilePhase: 'atrial_systole',
  },
  {
    id: 'tricuspid_valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'venous',
    colorStart: BLOOD_COLORS.venous,
    colorEnd: BLOOD_COLORS.venous,
    startPoint: { x: 434, y: 358 },
    endPoint: { x: 442, y: 384 },
    d: 'M 434 358 C 437 367, 440 375, 442 384',
    speedMultiplier: 1.15,
    pulsatilePhase: 'atrial_systole',
  },
];

export const SEGMENT_BY_ID = Object.fromEntries(
  PATH_SEGMENTS.map((segment) => [segment.id, segment]),
);

/**
 * Parallel capillary branches for visual rendering and multi-lane RBC routing.
 * Every branch shares the exact entry and exit coordinates of its parent segment.
 */
export const CAPILLARY_BRANCHES = {
  pulmonary_capillaries: [
    'M 325 118 C 390 74, 610 74, 675 118',
    'M 325 118 C 420 96, 580 96, 675 118',
    'M 325 118 C 420 132, 580 132, 675 118',
    'M 325 118 C 390 156, 610 156, 675 118',
  ],
  systemic_capillaries: [
    'M 710 648 C 630 604, 370 604, 290 648',
    'M 710 648 C 610 626, 390 626, 290 648',
    'M 710 648 C 610 668, 390 668, 290 648',
    'M 710 648 C 630 692, 370 692, 290 648',
  ],
};

/**
 * Single closed SVG path string combining all 14 segments in order.
 */
export const FULL_LOOP_PATH_D = PATH_SEGMENTS.map((seg, idx) =>
  idx === 0 ? seg.d : seg.d.replace(/^M\s+[\d.]+\s+[\d.]+\s*/, ''),
).join(' ');

/**
 * Valve metadata and cardiac-phase open/close state helpers.
 * - AV valves (`tricuspid_valve`, `bicuspid_valve`) open in `diastole` & `atrial_systole`, close in `ventricular_systole`.
 * - Semilunar valves (`pulmonary_valve`, `aortic_valve`) open in `ventricular_systole`, close in `diastole` & `atrial_systole`.
 */
export const VALVE_CONFIG = {
  tricuspid_valve: {
    id: 'tricuspid_valve',
    type: 'av',
    cx: 438,
    cy: 371,
    angleDeg: 14,
    width: 28,
  },
  bicuspid_valve: {
    id: 'bicuspid_valve',
    type: 'av',
    cx: 562,
    cy: 371,
    angleDeg: -14,
    width: 28,
  },
  pulmonary_valve: {
    id: 'pulmonary_valve',
    type: 'semilunar',
    cx: 472,
    cy: 342,
    angleDeg: -6,
    width: 22,
  },
  aortic_valve: {
    id: 'aortic_valve',
    type: 'semilunar',
    cx: 528,
    cy: 342,
    angleDeg: 6,
    width: 22,
  },
};

export function isValveOpen(valveId, cardiacPhase) {
  const valve = VALVE_CONFIG[valveId];
  if (!valve) return true;
  if (valve.type === 'av') {
    return cardiacPhase === 'diastole' || cardiacPhase === 'atrial_systole';
  }
  return cardiacPhase === 'ventricular_systole';
}

/**
 * Non-overlapping label coordinates, anchor coordinates, and leader-line targets
 * for all 14 canonical anatomical structures in the `1000 x 760` coordinate space.
 */
export const NODE_METADATA = {
  right_atrium: {
    id: 'right_atrium',
    nameKo: '우심방',
    nameEn: 'Right Atrium',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'venous',
    anchor: { x: 422, y: 328 },
    labelPos: { x: 302, y: 332 },
    leaderTarget: { x: 392, y: 328 },
  },
  tricuspid_valve: {
    id: 'tricuspid_valve',
    nameKo: '삼첨판',
    nameEn: 'Tricuspid Valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'venous',
    anchor: { x: 438, y: 371 },
    labelPos: { x: 302, y: 384 },
    leaderTarget: { x: 422, y: 372 },
  },
  right_ventricle: {
    id: 'right_ventricle',
    nameKo: '우심실',
    nameEn: 'Right Ventricle',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'venous',
    anchor: { x: 446, y: 440 },
    labelPos: { x: 302, y: 442 },
    leaderTarget: { x: 406, y: 442 },
  },
  pulmonary_valve: {
    id: 'pulmonary_valve',
    nameKo: '폐동맥 판막',
    nameEn: 'Pulmonary Valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'venous',
    anchor: { x: 472, y: 342 },
    labelPos: { x: 356, y: 228 },
    leaderTarget: { x: 460, y: 340 },
  },
  pulmonary_artery: {
    id: 'pulmonary_artery',
    nameKo: '폐동맥',
    nameEn: 'Pulmonary Artery',
    loop: 'pulmonary',
    category: 'artery',
    bloodType: 'venous',
    anchor: { x: 416, y: 162 },
    labelPos: { x: 242, y: 172 },
    leaderTarget: { x: 398, y: 152 },
  },
  pulmonary_capillaries: {
    id: 'pulmonary_capillaries',
    nameKo: '폐의 모세혈관',
    nameEn: 'Pulmonary Capillaries',
    loop: 'pulmonary',
    category: 'capillary',
    bloodType: 'gas_exchange',
    anchor: { x: 500, y: 118 },
    labelPos: { x: 500, y: 54 },
    leaderTarget: { x: 500, y: 80 },
  },
  pulmonary_vein: {
    id: 'pulmonary_vein',
    nameKo: '폐정맥',
    nameEn: 'Pulmonary Vein',
    loop: 'pulmonary',
    category: 'vein',
    bloodType: 'arterial',
    anchor: { x: 646, y: 214 },
    labelPos: { x: 758, y: 164 },
    leaderTarget: { x: 660, y: 176 },
  },
  left_atrium: {
    id: 'left_atrium',
    nameKo: '좌심방',
    nameEn: 'Left Atrium',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'arterial',
    anchor: { x: 578, y: 328 },
    labelPos: { x: 698, y: 326 },
    leaderTarget: { x: 608, y: 326 },
  },
  bicuspid_valve: {
    id: 'bicuspid_valve',
    nameKo: '이첨판',
    nameEn: 'Bicuspid (Mitral) Valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'arterial',
    anchor: { x: 562, y: 371 },
    labelPos: { x: 698, y: 376 },
    leaderTarget: { x: 578, y: 372 },
  },
  left_ventricle: {
    id: 'left_ventricle',
    nameKo: '좌심실',
    nameEn: 'Left Ventricle',
    loop: 'heart',
    category: 'chamber',
    bloodType: 'arterial',
    anchor: { x: 556, y: 440 },
    labelPos: { x: 698, y: 434 },
    leaderTarget: { x: 598, y: 434 },
  },
  aortic_valve: {
    id: 'aortic_valve',
    nameKo: '대동맥 판막',
    nameEn: 'Aortic Valve',
    loop: 'heart',
    category: 'valve',
    bloodType: 'arterial',
    anchor: { x: 528, y: 342 },
    labelPos: { x: 500, y: 212 },
    leaderTarget: { x: 526, y: 332 },
  },
  aorta: {
    id: 'aorta',
    nameKo: '대동맥',
    nameEn: 'Aorta',
    loop: 'systemic',
    category: 'artery',
    bloodType: 'arterial',
    anchor: { x: 778, y: 420 },
    labelPos: { x: 874, y: 420 },
    leaderTarget: { x: 794, y: 420 },
  },
  systemic_capillaries: {
    id: 'systemic_capillaries',
    nameKo: '온몸의 모세혈관',
    nameEn: 'Systemic Capillaries',
    loop: 'systemic',
    category: 'capillary',
    bloodType: 'material_exchange',
    anchor: { x: 500, y: 648 },
    labelPos: { x: 500, y: 726 },
    leaderTarget: { x: 500, y: 694 },
  },
  vena_cava: {
    id: 'vena_cava',
    nameKo: '대정맥',
    nameEn: 'Vena Cava',
    loop: 'systemic',
    category: 'vein',
    bloodType: 'venous',
    anchor: { x: 222, y: 450 },
    labelPos: { x: 126, y: 450 },
    leaderTarget: { x: 206, y: 450 },
  },
};

/**
 * Pure-JS cubic Bezier path sampler (fallback / non-DOM utility).
 * Supports `M x y` and one or more `C x1 y1, x2 y2, x y` commands used in `PATH_SEGMENTS`.
 *
 * @param {string} d - SVG path `d` string consisting of `M` and `C` commands.
 * @param {number} [stepsPerCurve=24] - Sample subdivisions per cubic Bezier curve.
 * @returns {Array<{x: number, y: number, angle: number}>} Sampled points along the path.
 */
export function sampleCubicPathPoints(d, stepsPerCurve = 24) {
  const tokens = d.replace(/,/g, ' ').trim().split(/\s+/);
  const points = [];
  let cx = 0;
  let cy = 0;
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M') {
      cx = parseFloat(tokens[i + 1]);
      cy = parseFloat(tokens[i + 2]);
      i += 3;
    } else if (cmd === 'C') {
      const x1 = parseFloat(tokens[i + 1]);
      const y1 = parseFloat(tokens[i + 2]);
      const x2 = parseFloat(tokens[i + 3]);
      const y2 = parseFloat(tokens[i + 4]);
      const x3 = parseFloat(tokens[i + 5]);
      const y3 = parseFloat(tokens[i + 6]);

      for (let s = 0; s <= stepsPerCurve; s++) {
        if (s === 0 && points.length > 0) continue;
        const t = s / stepsPerCurve;
        const mt = 1 - t;
        const x = mt ** 3 * cx + 3 * mt ** 2 * t * x1 + 3 * mt * t ** 2 * x2 + t ** 3 * x3;
        const y = mt ** 3 * cy + 3 * mt ** 2 * t * y1 + 3 * mt * t ** 2 * y2 + t ** 3 * y3;
        const dx = 3 * mt ** 2 * (x1 - cx) + 6 * mt * t * (x2 - x1) + 3 * t ** 2 * (x3 - x2);
        const dy = 3 * mt ** 2 * (y1 - cy) + 6 * mt * t * (y2 - y1) + 3 * t ** 2 * (y3 - y2);
        points.push({ x, y, angle: Math.atan2(dy, dx) });
      }
      cx = x3;
      cy = y3;
      i += 7;
    } else {
      i += 1;
    }
  }
  return points;
}
