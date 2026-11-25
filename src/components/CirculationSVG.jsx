import React from 'react';
import {
  BLOOD_COLORS,
  CAPILLARY_BRANCHES,
  CANONICAL_VIEWBOX,
  NODE_METADATA,
  SEGMENT_BY_ID,
  VALVE_CONFIG,
  isValveOpen,
} from '../assets/circulationPaths';

const PULMONARY_ACTIVE_IDS = new Set([
  'right_ventricle',
  'pulmonary_valve',
  'pulmonary_artery',
  'pulmonary_capillaries',
  'pulmonary_vein',
  'left_atrium',
]);

const SYSTEMIC_ACTIVE_IDS = new Set([
  'left_ventricle',
  'aortic_valve',
  'aorta',
  'systemic_capillaries',
  'vena_cava',
  'right_atrium',
]);

const BLOOD_BADGE_TEXT = {
  pulmonary_artery: '정맥혈',
  pulmonary_vein: '동맥혈',
  aorta: '동맥혈',
  vena_cava: '정맥혈',
};

/**
 * Computes opacity for a canonical node group based on the active view mode.
 */
function getNodeOpacity(nodeId, mode) {
  if (mode === 'pulmonary') {
    return PULMONARY_ACTIVE_IDS.has(nodeId) ? 1 : 0.22;
  }
  if (mode === 'systemic') {
    return SYSTEMIC_ACTIVE_IDS.has(nodeId) ? 1 : 0.22;
  }
  return 1;
}

/**
 * Checks whether a label is revealed in blind mode (supports Array or Set).
 */
function checkLabelRevealed(revealedLabels, nodeId) {
  if (!revealedLabels) return false;
  if (Array.isArray(revealedLabels)) return revealedLabels.includes(nodeId);
  if (revealedLabels instanceof Set) return revealedLabels.has(nodeId);
  return Boolean(revealedLabels[nodeId]);
}

/**
 * Interactive animated valve subcomponent synchronized with `cardiacPhase`.
 */
function ValveGraphic({
  valveId,
  cardiacPhase,
  isSelected,
  opacity,
  onSelect,
}) {
  const cfg = VALVE_CONFIG[valveId];
  const open = isValveOpen(valveId, cardiacPhase);
  const { cx, cy, angleDeg, type } = cfg;

  // AV valves open downward (+y); semilunar valves open upward (-y)
  const dir = type === 'av' ? 1 : -1;
  const openAngle = open ? 38 : 4;
  const leftRotate = dir * -openAngle;
  const rightRotate = dir * openAngle;

  return (
    <g
      id={valveId}
      role="button"
      tabIndex={0}
      aria-label={NODE_METADATA[valveId].nameKo}
      style={{ cursor: 'pointer', opacity, transition: 'opacity 250ms ease' }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(valveId);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(valveId);
        }
      }}
    >
      {/* Generous invisible hit area for touch/whiteboard clicking */}
      <circle cx={cx} cy={cy} r={22} fill="transparent" />

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={20}
          fill="rgba(250, 204, 21, 0.22)"
          stroke={BLOOD_COLORS.highlight}
          strokeWidth={3.5}
        />
      )}

      <g transform={`translate(${cx}, ${cy}) rotate(${angleDeg})`}>
        {/* Valve annulus ring */}
        <ellipse
          cx={0}
          cy={0}
          rx={15}
          ry={5.5}
          fill={open ? 'rgba(254, 243, 199, 0.85)' : '#FDE68A'}
          stroke="#B45309"
          strokeWidth={2}
        />

        {/* Left leaflet */}
        <path
          d={
            type === 'av'
              ? 'M -13 0 Q -6 3, -1 0'
              : 'M -11 0 Q -5 -3, -1 0'
          }
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={4.5}
          strokeLinecap="round"
          style={{
            transform: `rotate(${leftRotate}deg)`,
            transformOrigin: '-12px 0px',
            transition: 'transform 160ms ease-out',
          }}
        />
        <path
          d={
            type === 'av'
              ? 'M -13 0 Q -6 3, -1 0'
              : 'M -11 0 Q -5 -3, -1 0'
          }
          fill="none"
          stroke="#D97706"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            transform: `rotate(${leftRotate}deg)`,
            transformOrigin: '-12px 0px',
            transition: 'transform 160ms ease-out',
          }}
        />

        {/* Right leaflet */}
        <path
          d={
            type === 'av'
              ? 'M 13 0 Q 6 3, 1 0'
              : 'M 11 0 Q 5 -3, 1 0'
          }
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={4.5}
          strokeLinecap="round"
          style={{
            transform: `rotate(${rightRotate}deg)`,
            transformOrigin: '12px 0px',
            transition: 'transform 160ms ease-out',
          }}
        />
        <path
          d={
            type === 'av'
              ? 'M 13 0 Q 6 3, 1 0'
              : 'M 11 0 Q 5 -3, 1 0'
          }
          fill="none"
          stroke="#D97706"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            transform: `rotate(${rightRotate}deg)`,
            transformOrigin: '12px 0px',
            transition: 'transform 160ms ease-out',
          }}
        />

        {/* Status dot: green when open, amber when closed */}
        <circle
          cx={0}
          cy={dir * -9}
          r={3.5}
          fill={open ? '#10B981' : '#F59E0B'}
          stroke="#FFFFFF"
          strokeWidth={1.2}
        />
      </g>
    </g>
  );
}

/**
 * Interactive anatomical label pill with blind-mode masking & leader line.
 */
function NodeLabelPill({
  nodeId,
  mode,
  isSelected,
  blindMode,
  isRevealed,
  onSelectNode,
  onToggleBlindLabel,
}) {
  const meta = NODE_METADATA[nodeId];
  const opacity = getNodeOpacity(nodeId, mode);
  const masked = blindMode && !isRevealed;
  const bloodBadge = !masked && mode === 'blood_type' ? BLOOD_BADGE_TEXT[nodeId] : null;

  const text = masked ? '? (확인)' : meta.nameKo;
  const pillWidth = Math.max(82, text.length * 14 + (bloodBadge ? 56 : 24));
  const pillHeight = 30;
  const { x, y } = meta.labelPos;
  const { x: tx, y: ty } = meta.leaderTarget;

  const isVenous = meta.bloodType === 'venous';
  const isArterial = meta.bloodType === 'arterial';
  const isValve = meta.category === 'valve';
  const accentColor = isValve
    ? '#D97706'
    : isVenous
      ? BLOOD_COLORS.venous
      : isArterial
        ? BLOOD_COLORS.arterial
        : '#7C3AED';

  const handleClick = (e) => {
    e.stopPropagation();
    if (blindMode) {
      onToggleBlindLabel?.(nodeId);
    } else {
      onSelectNode?.(nodeId);
    }
  };

  return (
    <g
      style={{
        cursor: 'pointer',
        opacity: opacity < 0.5 ? 0.35 : 1,
        transition: 'opacity 250ms ease',
      }}
      onClick={handleClick}
    >
      {/* Leader line */}
      <line
        x1={x}
        y1={y}
        x2={tx}
        y2={ty}
        stroke={isSelected ? '#EAB308' : masked ? '#64748B' : accentColor}
        strokeWidth={isSelected ? 2.6 : 1.6}
        strokeDasharray={masked ? '4 3' : undefined}
        opacity={0.78}
      />
      <circle
        cx={tx}
        cy={ty}
        r={3.5}
        fill={isSelected ? '#EAB308' : accentColor}
        stroke="#FFFFFF"
        strokeWidth={1.2}
      />

      {/* Pill box */}
      <rect
        x={x - pillWidth / 2}
        y={y - pillHeight / 2}
        width={pillWidth}
        height={pillHeight}
        rx={15}
        fill={masked ? '#1E293B' : isSelected ? '#FEF9C3' : '#FFFFFF'}
        stroke={isSelected ? '#EAB308' : masked ? '#94A3B8' : accentColor}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={masked ? '5 3' : undefined}
        filter="url(#pill-shadow)"
      />

      {/* Node name or ? */}
      <text
        x={bloodBadge ? x - 24 : x}
        y={y + 5}
        textAnchor="middle"
        fontSize={14}
        fontWeight={800}
        fill={masked ? '#F8FAFC' : '#0F172A'}
        style={{ userSelect: 'none', fontFamily: 'inherit' }}
      >
        {text}
      </text>

      {/* Optional blood type sub-pill in blood_type mode */}
      {bloodBadge && (
        <g>
          <rect
            x={x + pillWidth / 2 - 52}
            y={y - 10}
            width={46}
            height={20}
            rx={10}
            fill={isVenous ? BLOOD_COLORS.venous : BLOOD_COLORS.arterial}
          />
          <text
            x={x + pillWidth / 2 - 29}
            y={y + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="#FFFFFF"
            style={{ userSelect: 'none', fontFamily: 'inherit' }}
          >
            {bloodBadge}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * Interactive SVG anatomical diagram (`viewBox="0 0 1000 760"`).
 * Renders chambers, myocardium thickness comparison, animated valves, vessels,
 * capillary gradients, clickable labels, and overlays `children` (BloodFlowCanvas)
 * inside the exact same `1000x760` coordinate frame.
 */
export default function CirculationSVG({
  mode = 'all',
  selectedNodeId = null,
  cardiacPhase = 'diastole',
  blindMode = false,
  revealedLabels = [],
  onSelectNode,
  onToggleBlindLabel,
  onOpenMicroView,
  children,
}) {
  const isAtrialSystole = cardiacPhase === 'atrial_systole';
  const isVentricularSystole = cardiacPhase === 'ventricular_systole';

  const makeInteractiveProps = (nodeId) => ({
    id: nodeId,
    role: 'button',
    tabIndex: 0,
    'aria-label': NODE_METADATA[nodeId]?.nameKo || nodeId,
    style: {
      cursor: 'pointer',
      opacity: getNodeOpacity(nodeId, mode),
      transition: 'opacity 260ms ease',
    },
    onClick: (e) => {
      e.stopPropagation();
      onSelectNode?.(nodeId);
    },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectNode?.(nodeId);
      }
    },
  });

  const isSelected = (id) => selectedNodeId === id;

  return (
    <div
      className="circulation-svg-stage"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${CANONICAL_VIEWBOX.width} / ${CANONICAL_VIEWBOX.height}`,
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox={CANONICAL_VIEWBOX.string}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'visible',
        }}
        role="img"
        aria-label="인체 혈액 순환계 인터랙티브 모식도"
      >
        <defs>
          {/* Pulmonary Capillary Gradient: Venous (#457B9D) -> Arterial (#E63946) */}
          <linearGradient id="grad-pulmonary-cap" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={BLOOD_COLORS.venous} />
            <stop offset="48%" stopColor="#8E5B74" />
            <stop offset="100%" stopColor={BLOOD_COLORS.arterial} />
          </linearGradient>

          {/* Systemic Capillary Gradient: Arterial (#E63946) -> Venous (#457B9D) */}
          <linearGradient id="grad-systemic-cap" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={BLOOD_COLORS.arterial} />
            <stop offset="52%" stopColor="#8E5B74" />
            <stop offset="100%" stopColor={BLOOD_COLORS.venous} />
          </linearGradient>

          {/* Myocardium muscle texture gradient */}
          <linearGradient id="grad-myocardium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="55%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>

          {/* Lung silhouette background */}
          <linearGradient id="grad-lung-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCE7F3" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#FBCFE8" stopOpacity="0.52" />
          </linearGradient>

          {/* Body tissue silhouette background */}
          <linearGradient id="grad-tissue-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.55" />
          </linearGradient>

          {/* Drop shadow for pills */}
          <filter id="pill-shadow" x="-15%" y="-20%" width="130%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.14" />
          </filter>

          {/* Highlight glow */}
          <filter id="node-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FACC15" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* 1. Background Anatomical Zones */}
        {/* Lungs (Top) */}
        <g opacity={mode === 'systemic' ? 0.35 : 0.95} style={{ transition: 'opacity 260ms ease' }}>
          <path
            d="M 270 165 C 232 165, 224 95, 272 64 C 318 36, 430 46, 470 72 C 484 82, 486 150, 464 162 Z"
            fill="url(#grad-lung-bg)"
            stroke="#F472B6"
            strokeWidth={2}
          />
          <path
            d="M 730 165 C 768 165, 776 95, 728 64 C 682 36, 570 46, 530 72 C 516 82, 514 150, 536 162 Z"
            fill="url(#grad-lung-bg)"
            stroke="#F472B6"
            strokeWidth={2}
          />
          {/* Subtle trachea hint */}
          <path
            d="M 492 22 L 492 66 M 508 22 L 508 66"
            stroke="#CBD5E1"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <rect x={442} y={14} width={116} height={22} rx={11} fill="#FDF2F8" stroke="#F472B6" strokeWidth={1.4} />
          <text x={500} y={29} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#9D174D">
            폐 (Lungs)
          </text>
        </g>

        {/* Body Tissues (Bottom) */}
        <g opacity={mode === 'pulmonary' ? 0.35 : 0.95} style={{ transition: 'opacity 260ms ease' }}>
          <rect
            x={248}
            y={574}
            width={504}
            height={132}
            rx={28}
            fill="url(#grad-tissue-bg)"
            stroke="#F59E0B"
            strokeWidth={2}
          />
          {/* Stylized background tissue cells */}
          {[330, 415, 500, 585, 670].map((cx, i) => (
            <g key={cx} opacity={0.45}>
              <ellipse
                cx={cx}
                cy={i % 2 === 0 ? 616 : 678}
                rx={28}
                ry={14}
                fill="#FDE68A"
                stroke="#D97706"
                strokeWidth={1.2}
              />
              <circle cx={cx} cy={i % 2 === 0 ? 616 : 678} r={4.5} fill="#B45309" opacity={0.45} />
            </g>
          ))}
          <rect x={426} y={562} width={148} height={24} rx={12} fill="#FFFBEB" stroke="#D97706" strokeWidth={1.5} />
          <text x={500} y={578} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#92400E">
            온몸의 조직세포
          </text>
        </g>

        {/* 2. Great Vessels (Posterior layer first: Pulmonary Vein, Vena Cava, Pulmonary Artery) */}

        {/* Vena Cava (Systemic Venous Return) */}
        <g {...makeInteractiveProps('vena_cava')}>
          {isSelected('vena_cava') && (
            <path
              d={SEGMENT_BY_ID.vena_cava.d}
              fill="none"
              stroke={BLOOD_COLORS.highlight}
              strokeWidth={34}
              strokeLinecap="round"
              opacity={0.75}
            />
          )}
          <path
            d={SEGMENT_BY_ID.vena_cava.d}
            fill="none"
            stroke={BLOOD_COLORS.venous}
            strokeWidth={24}
            strokeLinecap="round"
          />
          <path
            d={SEGMENT_BY_ID.vena_cava.d}
            fill="none"
            stroke="#93B7CE"
            strokeWidth={14}
            strokeLinecap="round"
            opacity={0.45}
          />
          {/* Flow arrows on vena cava */}
          <path d="M 215 470 L 222 452 L 229 470 Z" fill="#FFFFFF" opacity={0.9} />
          <path d="M 294 282 L 312 288 L 295 296 Z" fill="#FFFFFF" opacity={0.9} />
        </g>

        {/* Pulmonary Vein (Pulmonary Arterial-Blood Return: #E63946) */}
        <g {...makeInteractiveProps('pulmonary_vein')}>
          {isSelected('pulmonary_vein') && (
            <path
              d={SEGMENT_BY_ID.pulmonary_vein.d}
              fill="none"
              stroke={BLOOD_COLORS.highlight}
              strokeWidth={30}
              strokeLinecap="round"
              opacity={0.75}
            />
          )}
          <path
            d={SEGMENT_BY_ID.pulmonary_vein.d}
            fill="none"
            stroke={BLOOD_COLORS.arterial}
            strokeWidth={20}
            strokeLinecap="round"
          />
          <path
            d={SEGMENT_BY_ID.pulmonary_vein.d}
            fill="none"
            stroke="#F4A3AA"
            strokeWidth={11}
            strokeLinecap="round"
            opacity={0.45}
          />
          <path d="M 656 226 L 645 242 L 642 223 Z" fill="#FFFFFF" opacity={0.9} />
        </g>

        {/* Pulmonary Artery (Venous Blood to Lungs: #457B9D) */}
        <g {...makeInteractiveProps('pulmonary_artery')}>
          {isSelected('pulmonary_artery') && (
            <path
              d={SEGMENT_BY_ID.pulmonary_artery.d}
              fill="none"
              stroke={BLOOD_COLORS.highlight}
              strokeWidth={32}
              strokeLinecap="round"
              opacity={0.75}
            />
          )}
          <path
            d={SEGMENT_BY_ID.pulmonary_artery.d}
            fill="none"
            stroke="#F8FAFC"
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d={SEGMENT_BY_ID.pulmonary_artery.d}
            fill="none"
            stroke={BLOOD_COLORS.venous}
            strokeWidth={21}
            strokeLinecap="round"
          />
          <path
            d={SEGMENT_BY_ID.pulmonary_artery.d}
            fill="none"
            stroke="#93B7CE"
            strokeWidth={11}
            strokeLinecap="round"
            opacity={0.45}
          />
          <path d="M 455 245 L 458 226 L 469 242 Z" fill="#FFFFFF" opacity={0.9} />
        </g>

        {/* Aorta (Systemic Arterial Blood: #E63946, arches anteriorly over pulmonary vein) */}
        <g {...makeInteractiveProps('aorta')}>
          {isSelected('aorta') && (
            <path
              d={SEGMENT_BY_ID.aorta.d}
              fill="none"
              stroke={BLOOD_COLORS.highlight}
              strokeWidth={36}
              strokeLinecap="round"
              opacity={0.75}
            />
          )}
          {/* White casing halo cleanly separates crossing above pulmonary vein */}
          <path
            d={SEGMENT_BY_ID.aorta.d}
            fill="none"
            stroke="#F8FAFC"
            strokeWidth={30}
            strokeLinecap="round"
          />
          <path
            d={SEGMENT_BY_ID.aorta.d}
            fill="none"
            stroke={BLOOD_COLORS.arterial}
            strokeWidth={24}
            strokeLinecap="round"
          />
          <path
            d={SEGMENT_BY_ID.aorta.d}
            fill="none"
            stroke="#F4A3AA"
            strokeWidth={13}
            strokeLinecap="round"
            opacity={0.45}
          />
          {/* Flow arrows on aorta */}
          <path d="M 656 183 L 675 190 L 656 197 Z" fill="#FFFFFF" opacity={0.9} />
          <path d="M 771 452 L 778 470 L 785 452 Z" fill="#FFFFFF" opacity={0.9} />
        </g>

        {/* 3. Capillary Networks (Pulmonary & Systemic) */}
        {/* Pulmonary Capillaries (Venous -> Arterial) */}
        <g {...makeInteractiveProps('pulmonary_capillaries')}>
          {isSelected('pulmonary_capillaries') && (
            <rect
              x={315}
              y={72}
              width={370}
              height={92}
              rx={44}
              fill="rgba(250, 204, 21, 0.16)"
              stroke={BLOOD_COLORS.highlight}
              strokeWidth={3.5}
            />
          )}
          {CAPILLARY_BRANCHES.pulmonary_capillaries.map((branchD, idx) => (
            <path
              key={idx}
              d={branchD}
              fill="none"
              stroke="url(#grad-pulmonary-cap)"
              strokeWidth={idx === 1 || idx === 2 ? 9 : 7}
              strokeLinecap="round"
            />
          ))}
          {/* Micro-view quick button */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode?.('pulmonary_capillaries');
              onOpenMicroView?.('pulmonary_capillaries');
            }}
          >
            <rect
              x={440}
              y={156}
              width={120}
              height={24}
              rx={12}
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth={1.6}
            />
            <text x={500} y={172} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#F8FAFC">
              기체교환 확대 ↗
            </text>
          </g>
        </g>

        {/* Systemic Capillaries (Arterial -> Venous) */}
        <g {...makeInteractiveProps('systemic_capillaries')}>
          {isSelected('systemic_capillaries') && (
            <rect
              x={280}
              y={598}
              width={440}
              height={100}
              rx={46}
              fill="rgba(250, 204, 21, 0.16)"
              stroke={BLOOD_COLORS.highlight}
              strokeWidth={3.5}
            />
          )}
          {CAPILLARY_BRANCHES.systemic_capillaries.map((branchD, idx) => (
            <path
              key={idx}
              d={branchD}
              fill="none"
              stroke="url(#grad-systemic-cap)"
              strokeWidth={idx === 1 || idx === 2 ? 9 : 7}
              strokeLinecap="round"
            />
          ))}
          {/* Micro-view quick button */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode?.('systemic_capillaries');
              onOpenMicroView?.('systemic_capillaries');
            }}
          >
            <rect
              x={578}
              y={714}
              width={120}
              height={24}
              rx={12}
              fill="#0F172A"
              stroke="#F59E0B"
              strokeWidth={1.6}
            />
            <text x={638} y={730} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#F8FAFC">
              물질교환 확대 ↗
            </text>
          </g>
        </g>

        {/* 4. Anatomical Heart Body & Chambers (Viewer's Left = Right Heart, Viewer's Right = Left Heart) */}
        <g id="heart-structure">
          {/* Heart outer myocardium silhouette — RIGHT side (left_ventricle) is visibly much thicker */}
          <path
            d="M 402 276
               C 365 280, 368 358, 386 382
               C 386 440, 412 508, 496 520
               C 562 532, 628 504, 636 420
               C 640 374, 628 360, 622 350
               C 632 320, 624 276, 588 276
               C 555 276, 540 296, 526 306
               L 474 306
               C 460 296, 440 276, 402 276 Z"
            fill="url(#grad-myocardium)"
            stroke="#991B1B"
            strokeWidth={3}
          />

          {/* Interventricular Septum (심실 중격) */}
          <path
            d="M 498 352 L 498 512"
            stroke="#B91C1C"
            strokeWidth={14}
            strokeLinecap="round"
          />

          {/* RIGHT ATRIUM (우심방 - Viewer's Upper Left) */}
          <g
            {...makeInteractiveProps('right_atrium')}
            style={{
              ...makeInteractiveProps('right_atrium').style,
              transform: isAtrialSystole ? 'scale(0.95)' : 'scale(1)',
              transformOrigin: '422px 324px',
              transition: 'transform 220ms ease, opacity 260ms ease',
            }}
          >
            <path
              d="M 392 292 C 378 308, 380 352, 412 362 L 452 362 C 458 334, 456 296, 424 288 C 408 284, 398 286, 392 292 Z"
              fill={BLOOD_COLORS.venous}
              stroke={isSelected('right_atrium') ? BLOOD_COLORS.highlight : '#1E3A5F'}
              strokeWidth={isSelected('right_atrium') ? 4.5 : 2.5}
              filter={isSelected('right_atrium') ? 'url(#node-glow)' : undefined}
            />
          </g>

          {/* RIGHT VENTRICLE (우심실 - Viewer's Lower Left, THINNER outer wall ~9px) */}
          <g
            {...makeInteractiveProps('right_ventricle')}
            style={{
              ...makeInteractiveProps('right_ventricle').style,
              transform: isVentricularSystole ? 'scale(0.96)' : 'scale(1)',
              transformOrigin: '446px 435px',
              transition: 'transform 220ms ease, opacity 260ms ease',
            }}
          >
            <path
              d="M 402 378
                 C 394 426, 412 490, 488 498
                 L 490 364
                 L 462 346
                 L 452 378 Z"
              fill={BLOOD_COLORS.venous}
              stroke={isSelected('right_ventricle') ? BLOOD_COLORS.highlight : '#1E3A5F'}
              strokeWidth={isSelected('right_ventricle') ? 4.5 : 2.5}
              filter={isSelected('right_ventricle') ? 'url(#node-glow)' : undefined}
            />
          </g>

          {/* LEFT ATRIUM (좌심방 - Viewer's Upper Right) */}
          <g
            {...makeInteractiveProps('left_atrium')}
            style={{
              ...makeInteractiveProps('left_atrium').style,
              transform: isAtrialSystole ? 'scale(0.95)' : 'scale(1)',
              transformOrigin: '578px 324px',
              transition: 'transform 220ms ease, opacity 260ms ease',
            }}
          >
            <path
              d="M 608 292 C 622 308, 620 352, 588 362 L 548 362 C 542 334, 544 296, 576 288 C 592 284, 602 286, 608 292 Z"
              fill={BLOOD_COLORS.arterial}
              stroke={isSelected('left_atrium') ? BLOOD_COLORS.highlight : '#7F1D1D'}
              strokeWidth={isSelected('left_atrium') ? 4.5 : 2.5}
              filter={isSelected('left_atrium') ? 'url(#node-glow)' : undefined}
            />
          </g>

          {/* LEFT VENTRICLE (좌심실 - Viewer's Lower Right, THICKER muscular outer wall ~22-26px!) */}
          <g
            {...makeInteractiveProps('left_ventricle')}
            style={{
              ...makeInteractiveProps('left_ventricle').style,
              transform: isVentricularSystole ? 'scale(0.95)' : 'scale(1)',
              transformOrigin: '554px 435px',
              transition: 'transform 220ms ease, opacity 260ms ease',
            }}
          >
            {/* Outer thick myocardium ring highlight so students immediately see wall thickness */}
            <path
              d="M 594 378
                 C 612 426, 594 494, 512 498
                 C 538 524, 622 502, 632 422
                 C 635 394, 626 378, 616 370 Z"
              fill="#DC2626"
              stroke="#7F1D1D"
              strokeWidth={1.6}
              opacity={0.92}
            />
            {/* Inner lumen of left ventricle */}
            <path
              d="M 596 378
                 C 604 422, 588 486, 512 496
                 L 510 364
                 L 538 346
                 L 548 378 Z"
              fill={BLOOD_COLORS.arterial}
              stroke={isSelected('left_ventricle') ? BLOOD_COLORS.highlight : '#7F1D1D'}
              strokeWidth={isSelected('left_ventricle') ? 4.5 : 2.5}
              filter={isSelected('left_ventricle') ? 'url(#node-glow)' : undefined}
            />
          </g>

          {/* Myocardium wall-thickness educational callout on Left Ventricle */}
          <g
            opacity={mode === 'pulmonary' ? 0.25 : 0.95}
            style={{ cursor: 'pointer', transition: 'opacity 250ms ease' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode?.('left_ventricle');
            }}
          >
            {/* Double-headed thickness bracket across left ventricle's thick outer wall */}
            <line x1={600} y1={466} x2={628} y2={474} stroke="#FEF08A" strokeWidth={3} />
            <line x1={628} y1={474} x2={658} y2={488} stroke="#B91C1C" strokeWidth={1.8} strokeDasharray="3 2" />
            <rect
              x={640}
              y={474}
              width={118}
              height={26}
              rx={13}
              fill="#FEF2F2"
              stroke="#DC2626"
              strokeWidth={1.8}
              filter="url(#pill-shadow)"
            />
            <text x={699} y={491} textAnchor="middle" fontSize={12} fontWeight={800} fill="#991B1B">
              두꺼운 근육벽 💪
            </text>
          </g>

          {/* 5. Heart Valves (AV & Semilunar) */}
          {Object.keys(VALVE_CONFIG).map((valveId) => (
            <ValveGraphic
              key={valveId}
              valveId={valveId}
              cardiacPhase={cardiacPhase}
              isSelected={isSelected(valveId)}
              opacity={getNodeOpacity(valveId, mode)}
              onSelect={onSelectNode}
            />
          ))}
        </g>

        {/* 6. Interactive Labels (Non-overlapping, Blind-mode aware) */}
        <g id="anatomical-labels">
          {Object.keys(NODE_METADATA).map((nodeId) => (
            <NodeLabelPill
              key={nodeId}
              nodeId={nodeId}
              mode={mode}
              isSelected={isSelected(nodeId)}
              blindMode={blindMode}
              isRevealed={checkLabelRevealed(revealedLabels, nodeId)}
              onSelectNode={onSelectNode}
              onToggleBlindLabel={onToggleBlindLabel}
            />
          ))}
        </g>
      </svg>

      {/* BloodFlowCanvas overlay sits in exact same 1000x760 aspect-ratio coordinate box */}
      {children}
    </div>
  );
}
