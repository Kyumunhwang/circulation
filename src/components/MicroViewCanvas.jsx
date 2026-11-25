import React, { useEffect, useRef, useCallback } from 'react';

const LOGICAL_WIDTH = 860;
const LOGICAL_HEIGHT = 460;

const VENOUS_RGB = { r: 69, g: 123, b: 157 }; // #457B9D
const ARTERIAL_RGB = { r: 230, g: 57, b: 70 }; // #E63946

export const PARTICLE_META = {
  O2: {
    type: 'O2',
    label: '산소 (O₂)',
    shortLabel: 'O₂',
    color: '#E63946',
    stroke: '#991B1B',
    pulmonaryDesc: '폐포의 높은 산소 농도에서 모세혈관(적혈구)으로 확산됩니다.',
    systemicDesc: '동맥혈에서 농도가 낮은 조직세포(미토콘드리아)로 확산됩니다.',
  },
  CO2: {
    type: 'CO2',
    label: '이산화탄소 (CO₂)',
    shortLabel: 'CO₂',
    color: '#2563EB',
    stroke: '#1E3A8A',
    pulmonaryDesc: '혈액(정맥혈)에서 농도가 낮은 폐포로 확산되어 날숨으로 나갑니다.',
    systemicDesc: '세포 호흡으로 생성된 조직세포에서 모세혈관으로 확산됩니다.',
  },
  nutrient: {
    type: 'nutrient',
    label: '영양소 (포도당 등)',
    shortLabel: '영양소',
    color: '#F59E0B',
    stroke: '#B45309',
    pulmonaryDesc: '폐순환에서는 주로 기체(O₂·CO₂) 교환이 일어납니다.',
    systemicDesc: '혈장 속에 녹아 있다가 농도 차에 의해 조직세포로 공급됩니다.',
  },
  waste: {
    type: 'waste',
    label: '노폐물 (요소 등)',
    shortLabel: '노폐물',
    color: '#7C3AED',
    stroke: '#4C1D95',
    pulmonaryDesc: '기체 외 대사 노폐물은 주로 온몸의 모세혈관을 통해 운반됩니다.',
    systemicDesc: '조직세포의 물질대사 결과 생성되어 모세혈관 혈장으로 이동합니다.',
  },
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpRgbString(c1, c2, t) {
  const clamped = clamp(t, 0, 1);
  const r = Math.round(lerp(c1.r, c2.r, clamped));
  const g = Math.round(lerp(c1.g, c2.g, clamped));
  const b = Math.round(lerp(c1.b, c2.b, clamped));
  return `rgb(${r}, ${g}, ${b})`;
}

function createInitialState(mode) {
  const rbcs = [];
  const rbcCount = 11;
  for (let i = 0; i < rbcCount; i += 1) {
    rbcs.push({
      x: (i / rbcCount) * (LOGICAL_WIDTH + 90) - 45,
      yOffset: (i % 3 - 1) * 20 + ((i % 2) * 6 - 3),
      tilt: ((i % 5) - 2) * 0.14,
      bobPhase: i * 1.1,
    });
  }

  const particles = [];

  if (mode === 'pulmonary_capillaries') {
    // O2 diffusing from Alveolus (top: y 55..205) -> Capillary (bottom: y 265..385)
    for (let i = 0; i < 24; i += 1) {
      particles.push({
        id: `o2-${i}`,
        type: 'O2',
        progress: (i / 24 + Math.random() * 0.04) % 1,
        baseX: 165 + ((i * 53) % 530),
        wobblePhase: i * 0.9,
        wobbleAmp: 8 + (i % 4) * 3,
        speedFactor: 0.85 + (i % 5) * 0.08,
      });
    }
    // CO2 diffusing from Capillary (bottom: y 270..380) -> Alveolus (top: y 55..195)
    for (let i = 0; i < 18; i += 1) {
      particles.push({
        id: `co2-${i}`,
        type: 'CO2',
        progress: (i / 18 + Math.random() * 0.05) % 1,
        baseX: 130 + ((i * 61) % 460),
        wobblePhase: i * 1.3,
        wobbleAmp: 7 + (i % 3) * 4,
        speedFactor: 0.8 + (i % 4) * 0.1,
      });
    }
  } else {
    // systemic_capillaries:
    // O2: Capillary (top: y 65..175) -> Tissue cells (bottom: y 255..405)
    for (let i = 0; i < 20; i += 1) {
      particles.push({
        id: `sys-o2-${i}`,
        type: 'O2',
        progress: (i / 20 + Math.random() * 0.04) % 1,
        baseX: 140 + ((i * 59) % 540),
        wobblePhase: i * 0.8,
        wobbleAmp: 7 + (i % 4) * 3,
        speedFactor: 0.88 + (i % 4) * 0.09,
      });
    }
    // Nutrients: Capillary (top) -> Tissue cells (bottom)
    for (let i = 0; i < 16; i += 1) {
      particles.push({
        id: `sys-nut-${i}`,
        type: 'nutrient',
        progress: (i / 16 + Math.random() * 0.05) % 1,
        baseX: 160 + ((i * 67) % 520),
        wobblePhase: i * 1.15,
        wobbleAmp: 6 + (i % 3) * 3,
        speedFactor: 0.78 + (i % 5) * 0.07,
      });
    }
    // CO2: Tissue cells (bottom) -> Capillary (top)
    for (let i = 0; i < 18; i += 1) {
      particles.push({
        id: `sys-co2-${i}`,
        type: 'CO2',
        progress: (i / 18 + Math.random() * 0.04) % 1,
        baseX: 180 + ((i * 61) % 510),
        wobblePhase: i * 1.4,
        wobbleAmp: 8 + (i % 3) * 3,
        speedFactor: 0.82 + (i % 4) * 0.09,
      });
    }
    // Metabolic wastes: Tissue cells (bottom) -> Capillary (top)
    for (let i = 0; i < 14; i += 1) {
      particles.push({
        id: `sys-waste-${i}`,
        type: 'waste',
        progress: (i / 14 + Math.random() * 0.05) % 1,
        baseX: 200 + ((i * 71) % 490),
        wobblePhase: i * 1.7,
        wobbleAmp: 6 + (i % 3) * 3,
        speedFactor: 0.74 + (i % 4) * 0.08,
      });
    }
  }

  return { rbcs, particles, time: 0 };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawRoundedPill(ctx, x, y, w, h, r, fill, stroke, text, textColor, font) {
  ctx.save();
  const resolvedFont = font || 'bold 13px "Pretendard", "Noto Sans KR", sans-serif';
  ctx.font = resolvedFont;
  let boxW = w;
  let boxX = x;
  if (text) {
    const measuredW = Math.ceil(ctx.measureText(text).width) + 24;
    if (measuredW > boxW) {
      if (x + w / 2 > LOGICAL_WIDTH / 2) {
        boxX = x + w - measuredW;
      }
      boxW = measuredW;
    }
  }
  roundRectPath(ctx, boxX, y, boxW, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  if (text) {
    ctx.fillStyle = textColor || '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + boxW / 2, y + h / 2 + 0.5);
  }
  ctx.restore();
}

function drawRedBloodCell(ctx, x, y, tilt, colorStr, o2Ratio) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Outer drop shadow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Biconcave disc silhouette
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 15, 0, 0, Math.PI * 2);
  ctx.fillStyle = colorStr;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.stroke();

  // Inner biconcave dimple
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 6.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
  ctx.fill();

  // Bound O2 molecules visualized on RBC
  const boundCount = Math.round(clamp(o2Ratio, 0, 1) * 4);
  const slotOffsets = [
    [-11, -5],
    [11, -5],
    [-10, 6],
    [10, 6],
  ];
  for (let i = 0; i < boundCount; i += 1) {
    const [ox, oy] = slotOffsets[i];
    ctx.beginPath();
    ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FEF08A';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#B91C1C';
    ctx.stroke();
  }

  ctx.restore();
}

function drawSingleCellWall(ctx, yTop, yBottom, width, cellCount, wallLabel) {
  ctx.save();
  const cellWidth = width / cellCount;
  const midY = (yTop + yBottom) / 2;

  // Membrane base
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(0, yTop, width, yBottom - yTop);

  for (let i = 0; i < cellCount; i += 1) {
    const cx = i * cellWidth;
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 1, yTop + 1, cellWidth - 2, yBottom - yTop - 2);

    // Flattened squamous endothelial nucleus
    ctx.beginPath();
    ctx.ellipse(cx + cellWidth * 0.5, midY, 10, 4.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(217, 119, 6, 0.42)';
    ctx.fill();
  }

  // Label badge centered on the right-ish or center
  drawRoundedPill(
    ctx,
    width / 2 - 120,
    midY - 12,
    240,
    24,
    12,
    'rgba(255, 251, 235, 0.94)',
    '#D97706',
    wallLabel,
    '#92400E',
    'bold 12.5px "Pretendard", "Noto Sans KR", sans-serif'
  );
  ctx.restore();
}

function drawDiffusionArrow(ctx, x, yStart, yEnd, color, label, time) {
  ctx.save();
  const dir = yEnd > yStart ? 1 : -1;
  const pulse = (Math.sin(time * 3.5) + 1) * 0.5;
  ctx.globalAlpha = 0.45 + pulse * 0.45;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.lineDashOffset = -time * 24;

  ctx.beginPath();
  ctx.moveTo(x, yStart);
  ctx.lineTo(x, yEnd - dir * 8);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, yEnd);
  ctx.lineTo(x - 7, yEnd - dir * 11);
  ctx.lineTo(x + 7, yEnd - dir * 11);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.92;
  ctx.font = 'bold 12px "Pretendard", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, dir > 0 ? yStart - 8 : yStart + 14);
  ctx.restore();
}

function drawParticleShape(ctx, type, x, y, isHighlighted, isDimmed) {
  ctx.save();
  ctx.globalAlpha = isDimmed ? 0.2 : 1;
  const scale = isHighlighted ? 1.38 : 1;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (isHighlighted) {
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.38)';
    ctx.fill();
  }

  const meta = PARTICLE_META[type];
  ctx.fillStyle = meta.color;
  ctx.strokeStyle = meta.stroke;
  ctx.lineWidth = 1.6;

  if (type === 'O2') {
    // Twin-circle oxygen molecule look or crisp bright circle with label
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O₂', 0, 0.5);
  } else if (type === 'CO2') {
    // Rounded square for CO2
    roundRectPath(ctx, -7.5, -7.5, 15, 15, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 7.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CO₂', 0, 0.5);
  } else if (type === 'nutrient') {
    // Golden diamond for nutrients
    ctx.rotate(Math.PI / 4);
    roundRectPath(ctx, -6.5, -6.5, 13, 13, 2.5);
    ctx.fill();
    ctx.stroke();
  } else if (type === 'waste') {
    // Purple hexagon for metabolic waste
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = Math.cos(angle) * 8;
      const py = Math.sin(angle) * 8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawMitochondrion(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FDBA74';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#C2410C';
  ctx.stroke();

  // Inner cristae zig-zag
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-9, -5);
  ctx.lineTo(-4, 5);
  ctx.lineTo(1, -5);
  ctx.lineTo(6, 5);
  ctx.lineTo(11, -4);
  ctx.lineTo(15, 0);
  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

export default function MicroViewCanvas({
  mode = 'pulmonary_capillaries',
  isPlaying = true,
  speed = 1,
  gradientLevel = 'normal',
  highlightedParticle = null,
  onHoverParticle,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef(createInitialState(mode));
  const hitRegionsRef = useRef([]);
  const propsRef = useRef({
    mode,
    isPlaying,
    speed,
    gradientLevel,
    highlightedParticle,
  });

  useEffect(() => {
    propsRef.current = {
      mode,
      isPlaying,
      speed,
      gradientLevel,
      highlightedParticle,
    };
  }, [mode, isPlaying, speed, gradientLevel, highlightedParticle]);

  useEffect(() => {
    stateRef.current = createInitialState(mode);
    hitRegionsRef.current = [];
  }, [mode]);

  const computeParticleCoords = useCallback((p, currentMode, time) => {
    const wobble = Math.sin(time * 2.4 + p.wobblePhase) * p.wobbleAmp;

    if (currentMode === 'pulmonary_capillaries') {
      if (p.type === 'O2') {
        // High concentration in Alveolus (y ~ 72) -> diffuses down into Capillary (y ~ 345), drifting slightly right with blood once inside capillary
        const y = lerp(72, 348, p.progress);
        const bloodDrift = p.progress > 0.55 ? (p.progress - 0.55) * 140 : 0;
        const x = clamp(p.baseX + wobble + bloodDrift, 30, LOGICAL_WIDTH - 30);
        return { x, y };
      }
      // CO2: Capillary (y ~ 348) -> Alveolus (y ~ 58)
      const y = lerp(348, 58, p.progress);
      const bloodDrift = p.progress < 0.45 ? p.progress * 90 : 40;
      const x = clamp(p.baseX + wobble + bloodDrift, 30, LOGICAL_WIDTH - 30);
      return { x, y };
    }

    // systemic_capillaries
    if (p.type === 'O2' || p.type === 'nutrient') {
      // Capillary (y ~ 105) -> Tissue cells (y ~ 372)
      const y = lerp(105, 372, p.progress);
      const bloodDrift = p.progress < 0.38 ? p.progress * 110 : 42;
      const x = clamp(p.baseX + wobble + bloodDrift, 30, LOGICAL_WIDTH - 30);
      return { x, y };
    }
    // CO2 & waste: Tissue cells (y ~ 380) -> Capillary (y ~ 102)
    const y = lerp(380, 102, p.progress);
    const bloodDrift = p.progress > 0.58 ? (p.progress - 0.58) * 160 : 0;
    const x = clamp(p.baseX + wobble + bloodDrift, 30, LOGICAL_WIDTH - 30);
    return { x, y };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let animationFrameId = null;
    let lastTimestamp = performance.now();

    const syncCanvasDpr = () => {
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(LOGICAL_WIDTH * dpr);
      const targetH = Math.round(LOGICAL_HEIGHT * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      return dpr;
    };

    const renderFrame = (now) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
      lastTimestamp = now;

      const {
        mode: curMode,
        isPlaying: playing,
        speed: curSpeed,
        gradientLevel: curGrad,
        highlightedParticle: curHighlight,
      } = propsRef.current;

      const sim = stateRef.current;
      const gradMultiplier = curGrad === 'high' ? 1.45 : 1.0;

      if (playing) {
        sim.time += dt * curSpeed;
        const rbcSpeed = 68 * curSpeed * (curGrad === 'high' ? 1.25 : 1.0);
        for (let i = 0; i < sim.rbcs.length; i += 1) {
          const rbc = sim.rbcs[i];
          rbc.x += rbcSpeed * dt;
          if (rbc.x > LOGICAL_WIDTH + 45) {
            rbc.x = -45;
          }
        }

        const particleRate = 0.24 * curSpeed * gradMultiplier;
        for (let i = 0; i < sim.particles.length; i += 1) {
          const p = sim.particles[i];
          p.progress += particleRate * p.speedFactor * dt;
          if (p.progress >= 1) {
            p.progress -= 1;
          }
        }
      }

      const dpr = syncCanvasDpr();
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // ================================================================
      // SCENE RENDERING
      // ================================================================
      if (curMode === 'pulmonary_capillaries') {
        // 1. Alveolus Air Sac (Top: y=0..215)
        const alvGrad = ctx.createLinearGradient(0, 0, 0, 215);
        alvGrad.addColorStop(0, '#E0F2FE');
        alvGrad.addColorStop(1, '#F0F9FF');
        ctx.fillStyle = alvGrad;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, 215);

        // Soft curved alveolus air sac outline
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(40, 215);
        ctx.bezierCurveTo(40, 42, 220, 18, 430, 18);
        ctx.bezierCurveTo(640, 18, 820, 42, 820, 215);
        ctx.fillStyle = curGrad === 'high' ? 'rgba(186, 230, 253, 0.45)' : 'rgba(224, 242, 254, 0.55)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#38BDF8';
        ctx.stroke();
        ctx.restore();

        // Alveolus Labels
        drawRoundedPill(
          ctx,
          24,
          16,
          225,
          34,
          10,
          '#0369A1',
          '#0284C7',
          '폐포 (공기 주머니 · 들숨 유입)',
          '#FFFFFF',
          'bold 14px "Pretendard", "Noto Sans KR", sans-serif'
        );
        drawRoundedPill(
          ctx,
          LOGICAL_WIDTH - 270,
          16,
          246,
          34,
          10,
          curGrad === 'high' ? '#FEF2F2' : '#FFFFFF',
          '#E63946',
          curGrad === 'high' ? 'O₂ 농도: 매우 높음 (운동 시)' : 'O₂ 농도: 높음  |  CO₂ 농도: 낮음',
          '#991B1B',
          'bold 13px "Pretendard", "Noto Sans KR", sans-serif'
        );

        // 2. Single-cell Alveolar + Capillary Membrane (y=215..246)
        drawSingleCellWall(
          ctx,
          215,
          246,
          LOGICAL_WIDTH,
          10,
          '폐포벽 · 모세혈관벽 (한 층의 얇은 세포)'
        );

        // 3. Pulmonary Capillary Lumen (y=246..412)
        const capGrad = ctx.createLinearGradient(0, 0, LOGICAL_WIDTH, 0);
        capGrad.addColorStop(0, 'rgba(69, 123, 157, 0.24)');
        capGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.16)');
        capGrad.addColorStop(1, 'rgba(230, 57, 70, 0.24)');
        ctx.fillStyle = capGrad;
        ctx.fillRect(0, 246, LOGICAL_WIDTH, 166);

        // Bottom capillary wall
        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(0, 412, LOGICAL_WIDTH, 14);
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 412);
        ctx.lineTo(LOGICAL_WIDTH, 412);
        ctx.stroke();

        // Background ambient flow chevrons inside capillary
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
        ctx.lineWidth = 3;
        for (let cx = 80; cx < LOGICAL_WIDTH; cx += 130) {
          ctx.beginPath();
          ctx.moveTo(cx - 10, 316);
          ctx.lineTo(cx + 4, 329);
          ctx.lineTo(cx - 10, 342);
          ctx.stroke();
        }
        ctx.restore();

        // Diffusion gradient guide arrows across membrane
        drawDiffusionArrow(ctx, 290, 175, 290, '#E63946', 'O₂ 확산 (고→저)', sim.time);
        drawDiffusionArrow(ctx, 560, 295, 170, '#2563EB', 'CO₂ 확산 (고→저)', sim.time);

        // RBCs moving left -> right, turning Venous (#457B9D) -> Arterial (#E63946)
        for (let i = 0; i < sim.rbcs.length; i += 1) {
          const rbc = sim.rbcs[i];
          const t = clamp((rbc.x - 140) / (LOGICAL_WIDTH - 280), 0, 1);
          const colorStr = lerpRgbString(VENOUS_RGB, ARTERIAL_RGB, t);
          const bobY = Math.sin(sim.time * 2.2 + rbc.bobPhase) * 4;
          drawRedBloodCell(ctx, rbc.x, 329 + rbc.yOffset + bobY, rbc.tilt, colorStr, t);
        }

        // Bottom Flow Direction Labels
        drawRoundedPill(
          ctx,
          14,
          428,
          284,
          28,
          8,
          '#457B9D',
          '#1E3A8A',
          '폐동맥 쪽에서 유입 (정맥혈 · O₂ 적음)',
          '#FFFFFF',
          'bold 12.5px "Pretendard", "Noto Sans KR", sans-serif'
        );
        drawRoundedPill(
          ctx,
          LOGICAL_WIDTH - 298,
          428,
          284,
          28,
          8,
          '#E63946',
          '#991B1B',
          '폐정맥 쪽으로 유출 (동맥혈 · O₂ 풍부) →',
          '#FFFFFF',
          'bold 12.5px "Pretendard", "Noto Sans KR", sans-serif'
        );
      } else {
        // ==============================================================
        // SYSTEMIC CAPILLARIES (Tissue Cell Material Exchange)
        // ==============================================================
        // Top ambient strip
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, 44);

        drawRoundedPill(
          ctx,
          14,
          8,
          324,
          28,
          8,
          '#E63946',
          '#991B1B',
          '대동맥 쪽에서 유입 (동맥혈 · O₂/영양소 풍부)',
          '#FFFFFF',
          'bold 12.5px "Pretendard", "Noto Sans KR", sans-serif'
        );
        drawRoundedPill(
          ctx,
          LOGICAL_WIDTH - 344,
          8,
          330,
          28,
          8,
          '#457B9D',
          '#1E3A8A',
          '대정맥 쪽으로 유출 (정맥혈 · CO₂/노폐물 운반) →',
          '#FFFFFF',
          'bold 12.5px "Pretendard", "Noto Sans KR", sans-serif'
        );

        // Top capillary wall
        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(0, 44, LOGICAL_WIDTH, 12);
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 56);
        ctx.lineTo(LOGICAL_WIDTH, 56);
        ctx.stroke();

        // Capillary Lumen (y=56..196)
        const capGrad = ctx.createLinearGradient(0, 0, LOGICAL_WIDTH, 0);
        capGrad.addColorStop(0, 'rgba(230, 57, 70, 0.24)');
        capGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.16)');
        capGrad.addColorStop(1, 'rgba(69, 123, 157, 0.24)');
        ctx.fillStyle = capGrad;
        ctx.fillRect(0, 56, LOGICAL_WIDTH, 140);

        // Flow chevrons
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
        ctx.lineWidth = 3;
        for (let cx = 80; cx < LOGICAL_WIDTH; cx += 130) {
          ctx.beginPath();
          ctx.moveTo(cx - 10, 113);
          ctx.lineTo(cx + 4, 126);
          ctx.lineTo(cx - 10, 139);
          ctx.stroke();
        }
        ctx.restore();

        // RBCs moving left -> right, turning Arterial (#E63946) -> Venous (#457B9D)
        for (let i = 0; i < sim.rbcs.length; i += 1) {
          const rbc = sim.rbcs[i];
          const t = clamp((rbc.x - 140) / (LOGICAL_WIDTH - 280), 0, 1);
          const colorStr = lerpRgbString(ARTERIAL_RGB, VENOUS_RGB, t);
          const bobY = Math.sin(sim.time * 2.2 + rbc.bobPhase) * 3.5;
          drawRedBloodCell(ctx, rbc.x, 126 + rbc.yOffset * 0.8 + bobY, rbc.tilt, colorStr, 1 - t);
        }

        // Single-cell capillary wall (y=196..226)
        drawSingleCellWall(
          ctx,
          196,
          226,
          LOGICAL_WIDTH,
          10,
          '모세혈관벽 (한 층의 세포) · 물질 이동 통로'
        );

        // Interstitial Fluid + Clustered Tissue Cells (y=226..460)
        const tissueBg = ctx.createLinearGradient(0, 226, 0, LOGICAL_HEIGHT);
        tissueBg.addColorStop(0, '#FFFBEB');
        tissueBg.addColorStop(1, '#FEF3C7');
        ctx.fillStyle = tissueBg;
        ctx.fillRect(0, 226, LOGICAL_WIDTH, LOGICAL_HEIGHT - 226);

        // Draw 3 stylized tissue cells with nuclei and mitochondria
        const cells = [
          { cx: 155, cy: 342, rx: 120, ry: 82, nucX: 112, nucY: 342, mitoX: 205, mitoY: 328 },
          { cx: 430, cy: 345, rx: 130, ry: 86, nucX: 430, nucY: 362, mitoX: 370, mitoY: 315 },
          { cx: 705, cy: 342, rx: 120, ry: 82, nucX: 745, nucY: 342, mitoX: 650, mitoY: 328 },
        ];

        for (let i = 0; i < cells.length; i += 1) {
          const c = cells[i];
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(c.cx, c.cy, c.rx, c.ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#FFF7ED';
          ctx.fill();
          ctx.lineWidth = 2.8;
          ctx.strokeStyle = '#EA580C';
          ctx.stroke();

          // Cell Nucleus
          ctx.beginPath();
          ctx.ellipse(c.nucX, c.nucY, 28, 22, 0.12, 0, Math.PI * 2);
          ctx.fillStyle = '#DDD6FE';
          ctx.fill();
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = '#7C3AED';
          ctx.stroke();

          ctx.fillStyle = '#4C1D95';
          ctx.font = 'bold 11px "Pretendard", "Noto Sans KR", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('핵', c.nucX, c.nucY);

          // Mitochondrion
          drawMitochondrion(ctx, c.mitoX, c.mitoY, i === 1 ? -0.15 : 0.2);
          if (i === 1) {
            ctx.fillStyle = '#9A3412';
            ctx.font = 'bold 11px "Pretendard", "Noto Sans KR", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('미토콘드리아', c.mitoX, c.mitoY - 14);
          }
          ctx.restore();
        }

        // Tissue cell labels
        drawRoundedPill(
          ctx,
          22,
          422,
          228,
          28,
          8,
          '#9A3412',
          '#7C2D12',
          '주변 조직세포 (세포 호흡 진행)',
          '#FFFFFF',
          'bold 12.5px "Pretendard", "Noto Sans KR", sans-serif'
        );
        drawRoundedPill(
          ctx,
          LOGICAL_WIDTH - 344,
          422,
          322,
          28,
          8,
          '#FFFFFF',
          '#EA580C',
          '세포 호흡: 영양소 + O₂ → 에너지 + CO₂ + 노폐물',
          '#9A3412',
          'bold 12px "Pretendard", "Noto Sans KR", sans-serif'
        );

        // Diffusion directional arrows across capillary wall
        drawDiffusionArrow(ctx, 255, 160, 275, '#E63946', 'O₂ · 영양소 공급', sim.time);
        drawDiffusionArrow(ctx, 605, 275, 160, '#2563EB', 'CO₂ · 노폐물 회수', sim.time);
      }

      // ================================================================
      // PARTICLES & HIT REGIONS
      // ================================================================
      const nextHits = [];
      for (let i = 0; i < sim.particles.length; i += 1) {
        const p = sim.particles[i];
        const { x, y } = computeParticleCoords(p, curMode, sim.time);
        const isHighlighted = curHighlight === p.type;
        const isDimmed = Boolean(curHighlight && curHighlight !== p.type);
        drawParticleShape(ctx, p.type, x, y, isHighlighted, isDimmed);
        nextHits.push({ type: p.type, x, y });
      }
      hitRegionsRef.current = nextHits;

      ctx.restore();
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    animationFrameId = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [computeParticleCoords]);

  const handleMouseMove = (event) => {
    if (!onHoverParticle) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;
    const mx = (event.clientX - rect.left) * scaleX;
    const my = (event.clientY - rect.top) * scaleY;

    let closestType = null;
    let closestDist = 24;
    const hits = hitRegionsRef.current;
    for (let i = 0; i < hits.length; i += 1) {
      const h = hits[i];
      const dist = Math.hypot(h.x - mx, h.y - my);
      if (dist < closestDist) {
        closestDist = dist;
        closestType = h.type;
      }
    }

    onHoverParticle(closestType);
  };

  const handleMouseLeave = () => {
    if (onHoverParticle) {
      onHoverParticle(null);
    }
  };

  return (
    <div className="micro-canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="micro-canvas-element"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={
          mode === 'pulmonary_capillaries'
            ? '폐포와 모세혈관 사이의 산소와 이산화탄소 확산 시뮬레이션'
            : '조직세포와 모세혈관 사이의 산소, 영양소, 이산화탄소, 노폐물 교환 시뮬레이션'
        }
      />
    </div>
  );
}
