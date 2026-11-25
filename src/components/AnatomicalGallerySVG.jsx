import React from 'react';
import { BLOOD_COLORS } from '../assets/circulationPaths';

export const GALLERY_ILLUSTRATIONS = [
  {
    id: 'heart_cross_section',
    titleKo: '심장 단면과 4방·판막·근육벽 두께',
    subtitleKo: '좌심실의 두꺼운 근육벽과 혈액 역류 방지 판막 구조',
  },
  {
    id: 'alveolus_gas_exchange',
    titleKo: '폐포와 모세혈관 기체 교환',
    subtitleKo: '분압 차이에 의한 O₂ 유입 및 CO₂ 배출 (정맥혈 → 동맥혈)',
  },
  {
    id: 'tissue_material_exchange',
    titleKo: '조직세포와 모세혈관 물질 교환',
    subtitleKo: '세포로 O₂·영양소 공급, 모세혈관으로 CO₂·노폐물 이동',
  },
  {
    id: 'vessel_comparison',
    titleKo: '동맥·정맥·모세혈관 단면과 판막 비교',
    subtitleKo: '혈압·벽 두께·단층 세포벽·정맥 판막의 역류 방지',
  },
  {
    id: 'rbc_oxygen',
    titleKo: '적혈구의 헤모글로빈 산소 운반',
    subtitleKo: '산소 농도에 따른 Hb 결합(선홍색)과 해리(암적색)',
  },
  {
    id: 'circulation_overview',
    titleKo: '체순환·폐순환 통합 모식도',
    subtitleKo: '심실 → 동맥 → 모세혈관 → 정맥 → 심방의 이중 폐쇄 순환',
  },
];

function HeartCrossSectionSVG() {
  return (
    <g>
      <rect x={0} y={0} width={460} height={320} rx={12} fill="#F8FAFC" />
      <text x={230} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0F172A">
        심장 단면 구조 (앞에서 본 방향: 좌/우 반전)
      </text>

      {/* Pulmonary trunk & Aorta exits */}
      <path d="M 205 110 C 202 72, 184 52, 152 46" fill="none" stroke={BLOOD_COLORS.venous} strokeWidth={18} strokeLinecap="round" />
      <path d="M 248 110 C 254 66, 286 48, 326 62" fill="none" stroke="#F8FAFC" strokeWidth={24} strokeLinecap="round" />
      <path d="M 248 110 C 254 66, 286 48, 326 62" fill="none" stroke={BLOOD_COLORS.arterial} strokeWidth={18} strokeLinecap="round" />

      {/* Outer Myocardium (Noticeably thicker on right side = Left Ventricle!) */}
      <path
        d="M 142 98
           C 116 106, 118 158, 130 176
           C 130 226, 154 276, 224 286
           C 284 294, 336 266, 342 198
           C 345 166, 336 154, 328 148
           C 336 124, 328 96, 300 96
           C 276 96, 264 110, 250 118
           L 204 118
           C 190 110, 174 96, 142 98 Z"
        fill="#FCA5A5"
        stroke="#991B1B"
        strokeWidth={2.5}
      />

      {/* Thick Left Ventricle Myocardium Highlight */}
      <path
        d="M 294 176 C 306 218, 294 260, 232 266 C 254 284, 328 268, 338 200 C 340 176, 332 164, 318 162 Z"
        fill="#DC2626"
        opacity={0.82}
      />

      {/* Septum */}
      <line x1={226} y1={154} x2={226} y2={278} stroke="#B91C1C" strokeWidth={11} strokeLinecap="round" />

      {/* Right Atrium (Left side) */}
      <path
        d="M 136 112 C 124 126, 128 154, 152 160 L 186 160 C 190 138, 188 112, 160 108 Z"
        fill={BLOOD_COLORS.venous}
        stroke="#1E3A5F"
        strokeWidth={2}
      />
      {/* Right Ventricle (Left side, thin outer wall ~8px) */}
      <path
        d="M 142 172 C 136 214, 154 260, 218 266 L 218 162 L 194 146 L 184 172 Z"
        fill={BLOOD_COLORS.venous}
        stroke="#1E3A5F"
        strokeWidth={2}
      />

      {/* Left Atrium (Right side) */}
      <path
        d="M 314 112 C 326 126, 322 154, 298 160 L 264 160 C 260 138, 262 112, 290 108 Z"
        fill={BLOOD_COLORS.arterial}
        stroke="#7F1D1D"
        strokeWidth={2}
      />
      {/* Left Ventricle (Right side, thick outer wall ~24px) */}
      <path
        d="M 298 172 C 306 210, 292 256, 234 264 L 234 162 L 258 146 L 268 172 Z"
        fill={BLOOD_COLORS.arterial}
        stroke="#7F1D1D"
        strokeWidth={2}
      />

      {/* 4 Valves (Yellow leaflets) */}
      <g stroke="#F59E0B" strokeWidth={3} strokeLinecap="round">
        {/* Tricuspid */}
        <line x1={154} y1={164} x2={164} y2={174} />
        <line x1={182} y1={164} x2={172} y2={174} />
        {/* Bicuspid */}
        <line x1={270} y1={164} x2={280} y2={174} />
        <line x1={298} y1={164} x2={288} y2={174} />
        {/* Pulmonary */}
        <line x1={196} y1={142} x2={203} y2={132} />
        <line x1={214} y1={142} x2={207} y2={132} />
        {/* Aortic */}
        <line x1={238} y1={142} x2={245} y2={132} />
        <line x1={256} y1={142} x2={249} y2={132} />
      </g>

      {/* Clean non-overlapping labels */}
      <g fontSize={11.5} fontWeight={700}>
        {/* Left column */}
        <line x1={104} y1={134} x2={140} y2={134} stroke="#457B9D" strokeWidth={1.5} />
        <rect x={24} y={122} width={80} height={24} rx={12} fill="#FFFFFF" stroke="#457B9D" strokeWidth={1.5} />
        <text x={64} y={138} textAnchor="middle" fill="#0F172A">우심방</text>

        <line x1={104} y1={170} x2={156} y2={170} stroke="#D97706" strokeWidth={1.5} />
        <rect x={24} y={158} width={80} height={24} rx={12} fill="#FFFBEB" stroke="#D97706" strokeWidth={1.5} />
        <text x={64} y={174} textAnchor="middle" fill="#92400E">삼첨판</text>

        <line x1={104} y1={218} x2={150} y2={218} stroke="#457B9D" strokeWidth={1.5} />
        <rect x={24} y={206} width={80} height={24} rx={12} fill="#FFFFFF" stroke="#457B9D" strokeWidth={1.5} />
        <text x={64} y={222} textAnchor="middle" fill="#0F172A">우심실</text>

        <rect x={16} y={244} width={118} height={36} rx={8} fill="#EFF6FF" stroke="#3B82F6" strokeWidth={1.2} />
        <text x={75} y={259} textAnchor="middle" fontSize={10.5} fill="#1E40AF">우심실 벽: 얇음</text>
        <text x={75} y={273} textAnchor="middle" fontSize={10} fill="#475569">(폐까지만 펌프)</text>

        {/* Right column */}
        <line x1={356} y1={134} x2={314} y2={134} stroke="#E63946" strokeWidth={1.5} />
        <rect x={356} y={122} width={80} height={24} rx={12} fill="#FFFFFF" stroke="#E63946" strokeWidth={1.5} />
        <text x={396} y={138} textAnchor="middle" fill="#0F172A">좌심방</text>

        <line x1={356} y1={170} x2={298} y2={170} stroke="#D97706" strokeWidth={1.5} />
        <rect x={356} y={158} width={80} height={24} rx={12} fill="#FFFBEB" stroke="#D97706" strokeWidth={1.5} />
        <text x={396} y={174} textAnchor="middle" fill="#92400E">이첨판</text>

        <line x1={356} y1={212} x2={292} y2={212} stroke="#E63946" strokeWidth={1.5} />
        <rect x={356} y={200} width={80} height={24} rx={12} fill="#FFFFFF" stroke="#E63946" strokeWidth={1.5} />
        <text x={396} y={216} textAnchor="middle" fill="#0F172A">좌심실</text>

        {/* Thick Left Ventricle Bracket & Callout */}
        <line x1={302} y1={236} x2={326} y2={244} stroke="#FEF08A" strokeWidth={3} />
        <rect x={324} y={240} width={126} height={38} rx={8} fill="#FEF2F2" stroke="#DC2626" strokeWidth={1.6} />
        <text x={387} y={256} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#991B1B">좌심실 벽: 가장 두꺼움!</text>
        <text x={387} y={271} textAnchor="middle" fontSize={10} fill="#7F1D1D">(온몸으로 강하게 펌프)</text>

        {/* Top vessel labels (wrapped in opaque pills clear of vessel strokes) */}
        <line x1={128} y1={50} x2={148} y2={48} stroke="#457B9D" strokeWidth={1.5} />
        <rect x={22} y={38} width={106} height={24} rx={12} fill="#EFF6FF" stroke="#457B9D" strokeWidth={1.5} />
        <text x={75} y={54} textAnchor="middle" fill="#1E3A5F">폐동맥(정맥혈)</text>

        <line x1={328} y1={60} x2={342} y2={58} stroke="#E63946" strokeWidth={1.5} />
        <rect x={342} y={46} width={106} height={24} rx={12} fill="#FEF2F2" stroke="#E63946" strokeWidth={1.5} />
        <text x={395} y={62} textAnchor="middle" fill="#991B1B">대동맥(동맥혈)</text>

        <text x={230} y={308} textAnchor="middle" fontSize={11} fill="#64748B">
          반월판(폐동맥·대동맥 판막)과 방실판(삼첨판·이첨판)이 역류를 막음
        </text>
      </g>
    </g>
  );
}

function AlveolusGasExchangeSVG() {
  return (
    <g>
      <rect x={0} y={0} width={460} height={320} rx={12} fill="#F8FAFC" />
      <text x={230} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0F172A">
        폐포와 모세혈관의 기체 교환 (외호흡)
      </text>

      {/* Alveolus air sac */}
      <path
        d="M 150 62 C 110 62, 92 108, 120 144 C 142 170, 210 178, 250 174 C 300 170, 344 150, 348 112 C 352 72, 312 52, 272 60 C 254 44, 198 44, 180 62 Z"
        fill="#FCE7F3"
        stroke="#EC4899"
        strokeWidth={3}
      />
      {/* Alveolar epithelial cell outlines */}
      <ellipse cx={230} cy={112} rx={96} ry={46} fill="#FFF1F2" stroke="#F472B6" strokeWidth={1.5} strokeDasharray="5 3" />

      <text x={230} y={96} textAnchor="middle" fontSize={13.5} fontWeight={800} fill="#9D174D">
        폐포 (공기 주머니)
      </text>
      <text x={230} y={115} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#BE185D">
        O₂ 분압 높음 ↑ · CO₂ 분압 낮음 ↓
      </text>

      {/* Capillary tube hugging the bottom of alveolus */}
      <defs>
        <linearGradient id="gal-pulm-cap" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BLOOD_COLORS.venous} />
          <stop offset="50%" stopColor="#945B74" />
          <stop offset="100%" stopColor={BLOOD_COLORS.arterial} />
        </linearGradient>
      </defs>
      <path
        d="M 48 232 C 125 220, 175 198, 230 198 C 285 198, 335 220, 412 232"
        fill="none"
        stroke="url(#gal-pulm-cap)"
        strokeWidth={36}
        strokeLinecap="round"
      />
      <path
        d="M 48 232 C 125 220, 175 198, 230 198 C 285 198, 335 220, 412 232"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={28}
        strokeLinecap="round"
        opacity={0.28}
      />

      {/* RBC color transition along capillary */}
      {[
        { cx: 88, cy: 226, fill: BLOOD_COLORS.venous },
        { cx: 154, cy: 210, fill: '#5B6E8C' },
        { cx: 228, cy: 198, fill: '#A84E68' },
        { cx: 304, cy: 210, fill: '#D93E4D' },
        { cx: 372, cy: 226, fill: BLOOD_COLORS.arterial },
      ].map((rbc, idx) => (
        <g key={idx} transform={`translate(${rbc.cx}, ${rbc.cy})`}>
          <ellipse rx={13} ry={8.5} fill={rbc.fill} stroke="#FFFFFF" strokeWidth={1.6} />
          <ellipse rx={6} ry={3.5} fill="#FFFFFF" opacity={0.35} />
        </g>
      ))}

      {/* Diffusion Arrows: O2 DOWN into capillary, CO2 UP into alveolus */}
      {/* O2 arrow */}
      <g>
        <line x1={194} y1={134} x2={194} y2={182} stroke="#DC2626" strokeWidth={3.5} />
        <polygon points="187,178 201,178 194,191" fill="#DC2626" />
        <rect x={122} y={140} width={64} height={24} rx={12} fill="#FEF2F2" stroke="#DC2626" strokeWidth={1.6} />
        <text x={154} y={156} textAnchor="middle" fontSize={12} fontWeight={800} fill="#991B1B">O₂ 확산</text>
      </g>

      {/* CO2 arrow */}
      <g>
        <line x1={268} y1={188} x2={268} y2={140} stroke="#2563EB" strokeWidth={3.5} />
        <polygon points="261,144 275,144 268,131" fill="#2563EB" />
        <rect x={276} y={140} width={68} height={24} rx={12} fill="#EFF6FF" stroke="#2563EB" strokeWidth={1.6} />
        <text x={310} y={156} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1E40AF">CO₂ 확산</text>
      </g>

      {/* Bottom annotations */}
      <rect x={22} y={266} width={120} height={36} rx={10} fill="#EFF6FF" stroke="#457B9D" strokeWidth={1.5} />
      <text x={82} y={282} textAnchor="middle" fontSize={11} fontWeight={800} fill="#1E3A5F">폐동맥 쪽 (정맥혈)</text>
      <text x={82} y={296} textAnchor="middle" fontSize={10} fill="#475569">O₂ 적음 · CO₂ 많음</text>

      <rect x={162} y={266} width={136} height={36} rx={10} fill="#F1F5F9" stroke="#64748B" strokeWidth={1.4} />
      <text x={230} y={282} textAnchor="middle" fontSize={11} fontWeight={800} fill="#0F172A">확산 원리</text>
      <text x={230} y={296} textAnchor="middle" fontSize={10} fill="#334155">고농도 → 저농도 이동</text>

      <rect x={318} y={266} width={120} height={36} rx={10} fill="#FEF2F2" stroke="#E63946" strokeWidth={1.5} />
      <text x={378} y={282} textAnchor="middle" fontSize={11} fontWeight={800} fill="#991B1B">폐정맥 쪽 (동맥혈)</text>
      <text x={378} y={296} textAnchor="middle" fontSize={10} fill="#475569">O₂ 풍부 · CO₂ 적음</text>
    </g>
  );
}

function TissueMaterialExchangeSVG() {
  return (
    <g>
      <rect x={0} y={0} width={460} height={320} rx={12} fill="#F8FAFC" />
      <text x={230} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0F172A">
        조직세포와 모세혈관의 물질 교환 (내호흡)
      </text>

      {/* Capillary across top */}
      <defs>
        <linearGradient id="gal-sys-cap" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BLOOD_COLORS.arterial} />
          <stop offset="50%" stopColor="#945B74" />
          <stop offset="100%" stopColor={BLOOD_COLORS.venous} />
        </linearGradient>
      </defs>
      <path
        d="M 42 78 L 418 78"
        stroke="url(#gal-sys-cap)"
        strokeWidth={38}
        strokeLinecap="round"
      />
      <path
        d="M 42 78 L 418 78"
        stroke="#FFFFFF"
        strokeWidth={30}
        strokeLinecap="round"
        opacity={0.25}
      />

      {/* RBC transition: Arterial -> Venous */}
      {[
        { cx: 82, fill: BLOOD_COLORS.arterial },
        { cx: 156, fill: '#D14353' },
        { cx: 230, fill: '#945B74' },
        { cx: 304, fill: '#5B6E8C' },
        { cx: 378, fill: BLOOD_COLORS.venous },
      ].map((rbc, idx) => (
        <g key={idx} transform={`translate(${rbc.cx}, 78)`}>
          <ellipse rx={13} ry={8.5} fill={rbc.fill} stroke="#FFFFFF" strokeWidth={1.6} />
          <ellipse rx={6} ry={3.5} fill="#FFFFFF" opacity={0.35} />
        </g>
      ))}

      {/* Tissue Cells Cluster at bottom */}
      {[
        { x: 95, y: 212 },
        { x: 230, y: 216 },
        { x: 365, y: 212 },
      ].map((cell, idx) => (
        <g key={idx}>
          <rect
            x={cell.x - 56}
            y={cell.y - 38}
            width={112}
            height={76}
            rx={24}
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth={2.2}
          />
          <circle cx={cell.x - 16} cy={cell.y} r={14} fill="#F59E0B" opacity={0.45} stroke="#B45309" strokeWidth={1.5} />
          {/* Mitochondria */}
          <ellipse cx={cell.x + 22} cy={cell.y + 8} rx={14} ry={7} fill="#F97316" opacity={0.65} />
          <text x={cell.x} y={cell.y + 30} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#92400E">
            조직세포 {idx + 1}
          </text>
        </g>
      ))}

      {/* Arrows: O2 & Nutrients DOWN, CO2 & Wastes UP */}
      <g>
        <line x1={155} y1={104} x2={155} y2={160} stroke="#DC2626" strokeWidth={3.5} />
        <polygon points="148,155 162,155 155,168" fill="#DC2626" />
        <rect x={46} y={118} width={100} height={26} rx={12} fill="#FEF2F2" stroke="#DC2626" strokeWidth={1.5} />
        <text x={96} y={135} textAnchor="middle" fontSize={11} fontWeight={800} fill="#991B1B">O₂ · 영양소 공급</text>
      </g>

      <g>
        <line x1={305} y1={164} x2={305} y2={108} stroke="#2563EB" strokeWidth={3.5} />
        <polygon points="298,113 312,113 305,100" fill="#2563EB" />
        <rect x={314} y={118} width={108} height={26} rx={12} fill="#EFF6FF" stroke="#2563EB" strokeWidth={1.5} />
        <text x={368} y={135} textAnchor="middle" fontSize={11} fontWeight={800} fill="#1E40AF">CO₂ · 노폐물 회수</text>
      </g>

      <rect x={28} y={272} width={404} height={32} rx={10} fill="#FFFBEB" stroke="#F59E0B" strokeWidth={1.4} />
      <text x={230} y={292} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#78350F">
        세포 호흡에 O₂·영양소 사용 → 생성된 CO₂·노폐물을 모세혈관으로 배출 (동맥혈 → 정맥혈)
      </text>
    </g>
  );
}

function VesselComparisonSVG() {
  return (
    <g>
      <rect x={0} y={0} width={460} height={320} rx={12} fill="#F8FAFC" />
      <text x={230} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0F172A">
        동맥 · 모세혈관 · 정맥 구조와 판막 비교
      </text>

      {/* Column 1: Artery */}
      <g>
        <rect x={16} y={42} width={136} height={262} rx={12} fill="#FEF2F2" stroke="#FCA5A5" strokeWidth={1.5} />
        <text x={84} y={64} textAnchor="middle" fontSize={13} fontWeight={800} fill="#991B1B">동맥 (Artery)</text>
        {/* Cross section: thick muscular wall, narrow lumen */}
        <circle cx={84} cy={126} r={38} fill="#FCA5A5" stroke="#DC2626" strokeWidth={3} />
        <circle cx={84} cy={126} r={26} fill="#F87171" stroke="#B91C1C" strokeWidth={1.5} />
        <circle cx={84} cy={126} r={14} fill={BLOOD_COLORS.arterial} />
        <text x={84} y={182} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7F1D1D">가장 두꺼운 근육층</text>
        <text x={84} y={200} textAnchor="middle" fontSize={10.5} fill="#334155">• 심장에서 나가는 혈관</text>
        <text x={84} y={218} textAnchor="middle" fontSize={10.5} fill="#334155">• 높은 혈압 견딤</text>
        <text x={84} y={236} textAnchor="middle" fontSize={10.5} fill="#334155">• 탄력성 매우 큼</text>
        <rect x={34} y={252} width={100} height={24} rx={8} fill="#FFFFFF" stroke="#EF4444" strokeWidth={1.2} />
        <text x={84} y={268} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#991B1B">판막 없음</text>
      </g>

      {/* Column 2: Capillary */}
      <g>
        <rect x={162} y={42} width={136} height={262} rx={12} fill="#F5F3FF" stroke="#C4B5FD" strokeWidth={1.5} />
        <text x={230} y={64} textAnchor="middle" fontSize={13} fontWeight={800} fill="#5B21B6">모세혈관</text>
        {/* Single cell layer */}
        <circle cx={230} cy={126} r={24} fill="#EDE9FE" stroke="#7C3AED" strokeWidth={2.2} strokeDasharray="6 3" />
        <circle cx={230} cy={126} r={18} fill="#A78BFA" opacity={0.4} />
        <ellipse cx={230} cy={126} rx={10} ry={7} fill={BLOOD_COLORS.arterial} />
        <text x={230} y={182} textAnchor="middle" fontSize={11} fontWeight={700} fill="#5B21B6">한 겹의 세포층</text>
        <text x={230} y={200} textAnchor="middle" fontSize={10.5} fill="#334155">• 온몸에 그물처럼 분포</text>
        <text x={230} y={218} textAnchor="middle" fontSize={10.5} fill="#334155">• 혈류 속도 가장 느림</text>
        <text x={230} y={236} textAnchor="middle" fontSize={10.5} fill="#334155">• 총 단면적 가장 넓음</text>
        <rect x={180} y={252} width={100} height={24} rx={8} fill="#FFFFFF" stroke="#7C3AED" strokeWidth={1.2} />
        <text x={230} y={268} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#5B21B6">물질·기체 교환</text>
      </g>

      {/* Column 3: Vein with Valve */}
      <g>
        <rect x={308} y={42} width={136} height={262} rx={12} fill="#EFF6FF" stroke="#93C5FD" strokeWidth={1.5} />
        <text x={376} y={64} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1E3A8A">정맥 (Vein)</text>
        {/* Longitudinal cutaway showing valve preventing backflow */}
        <rect x={346} y={82} width={60} height={82} rx={8} fill="#93C5FD" stroke="#1D4ED8" strokeWidth={2} />
        <rect x={354} y={82} width={44} height={82} fill={BLOOD_COLORS.venous} />
        {/* Valve flaps */}
        <path d="M 354 128 Q 372 120, 374 108" fill="none" stroke="#FDE047" strokeWidth={3.5} strokeLinecap="round" />
        <path d="M 398 128 Q 380 120, 378 108" fill="none" stroke="#FDE047" strokeWidth={3.5} strokeLinecap="round" />
        {/* Upward flow arrow */}
        <line x1={376} y1={154} x2={376} y2={132} stroke="#FFFFFF" strokeWidth={2.5} />
        <polygon points="370,136 382,136 376,126" fill="#FFFFFF" />

        <text x={376} y={182} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1E3A8A">얇은 벽 · 넓은 내강</text>
        <text x={376} y={200} textAnchor="middle" fontSize={10.5} fill="#334155">• 심장으로 들어오는 혈관</text>
        <text x={376} y={218} textAnchor="middle" fontSize={10.5} fill="#334155">• 혈압이 매우 낮음</text>
        <text x={376} y={236} textAnchor="middle" fontSize={10.5} fill="#334155">• 주변 근육 수축 도움</text>
        <rect x={318} y={252} width={116} height={24} rx={8} fill="#FEF9C3" stroke="#D97706" strokeWidth={1.4} />
        <text x={376} y={268} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#92400E">판막 있음 (역류방지)</text>
      </g>
    </g>
  );
}

function RBCOxygenSVG() {
  return (
    <g>
      <rect x={0} y={0} width={460} height={320} rx={12} fill="#F8FAFC" />
      <text x={230} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0F172A">
        적혈구의 헤모글로빈(Hb) 산소 운반 원리
      </text>

      {/* Left Card: Oxygenated (Arterial) */}
      <g>
        <rect x={18} y={44} width={202} height={212} rx={14} fill="#FEF2F2" stroke="#E63946" strokeWidth={2} />
        <text x={119} y={68} textAnchor="middle" fontSize={13} fontWeight={800} fill="#991B1B">
          산소 결합 상태 (동맥혈)
        </text>
        {/* Biconcave RBC */}
        <ellipse cx={119} cy={126} rx={58} ry={34} fill={BLOOD_COLORS.arterial} stroke="#991B1B" strokeWidth={2} />
        <ellipse cx={119} cy={126} rx={28} ry={14} fill="#F87171" opacity={0.65} />
        {/* 4 O2 molecules bound */}
        {[
          { x: 86, y: 112 },
          { x: 152, y: 112 },
          { x: 86, y: 140 },
          { x: 152, y: 140 },
        ].map((pos, idx) => (
          <g key={idx}>
            <circle cx={pos.x} cy={pos.y} r={9} fill="#FFFFFF" stroke="#DC2626" strokeWidth={1.5} />
            <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#DC2626">O₂</text>
          </g>
        ))}
        <text x={119} y={184} textAnchor="middle" fontSize={12} fontWeight={800} fill="#991B1B">선홍색 (옥시헤모글로빈)</text>
        <text x={119} y={204} textAnchor="middle" fontSize={10.5} fill="#334155">• 폐(O₂ 많음)에서 산소와 결합</text>
        <text x={119} y={222} textAnchor="middle" fontSize={10.5} fill="#334155">• 폐정맥 → 좌심 → 대동맥 이동</text>
        <text x={119} y={242} textAnchor="middle" fontSize={11} fontWeight={700} fill="#DC2626">Hb + 4 O₂ → Hb(O₂)₄</text>
      </g>

      {/* Center Reversible Arrow */}
      <g>
        <polygon points="222,135 238,135 230,126" fill="#64748B" />
        <polygon points="222,145 238,145 230,154" fill="#64748B" />
      </g>

      {/* Right Card: Deoxygenated (Venous) */}
      <g>
        <rect x={240} y={44} width={202} height={212} rx={14} fill="#EFF6FF" stroke="#457B9D" strokeWidth={2} />
        <text x={341} y={68} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1E3A5F">
          산소 해리 상태 (정맥혈)
        </text>
        {/* Biconcave RBC */}
        <ellipse cx={341} cy={126} rx={58} ry={34} fill={BLOOD_COLORS.venous} stroke="#1E3A5F" strokeWidth={2} />
        <ellipse cx={341} cy={126} rx={28} ry={14} fill="#93C5FD" opacity={0.4} />
        <text x={341} y={130} textAnchor="middle" fontSize={11} fontWeight={800} fill="#FFFFFF">Hb (산소 방출)</text>
        {/* Released O2 floating out */}
        <circle cx={408} cy={100} r={8} fill="#FFFFFF" stroke="#DC2626" strokeWidth={1.3} />
        <text x={408} y={103.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="#DC2626">O₂</text>

        <text x={341} y={184} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1E3A5F">암적색 (산소 적은 혈액)</text>
        <text x={341} y={204} textAnchor="middle" fontSize={10.5} fill="#334155">• 조직세포(O₂ 적음)에 산소 전달</text>
        <text x={341} y={222} textAnchor="middle" fontSize={10.5} fill="#334155">• 대정맥 → 우심 → 폐동맥 이동</text>
        <text x={341} y={242} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1E40AF">Hb(O₂)₄ → Hb + 4 O₂</text>
      </g>

      <rect x={18} y={268} width={424} height={36} rx={10} fill="#F1F5F9" stroke="#94A3B8" strokeWidth={1.4} />
      <text x={230} y={290} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#0F172A">
        적혈구 특징: 가운데가 오목한 원반 모양 · 핵이 없음 · 헤모글로빈(Fe)으로 산소 운반
      </text>
    </g>
  );
}

function CirculationOverviewSVG() {
  return (
    <g>
      <rect x={0} y={0} width={460} height={320} rx={12} fill="#F8FAFC" />
      <text x={230} y={22} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0F172A">
        체순환과 폐순환 통합 모식도
      </text>

      {/* Top Lungs Box */}
      <rect x={146} y={36} width={168} height={38} rx={12} fill="#FCE7F3" stroke="#EC4899" strokeWidth={2} />
      <text x={230} y={59} textAnchor="middle" fontSize={12} fontWeight={800} fill="#9D174D">폐 (폐의 모세혈관)</text>

      {/* Bottom Tissues Box */}
      <rect x={138} y={246} width={184} height={38} rx={12} fill="#FEF3C7" stroke="#D97706" strokeWidth={2} />
      <text x={230} y={269} textAnchor="middle" fontSize={12} fontWeight={800} fill="#92400E">온몸의 조직세포 (모세혈관)</text>

      {/* Left Pulmonary Artery: Heart(RV) -> Lungs */}
      <path d="M 186 150 L 92 150 L 92 55 L 146 55" fill="none" stroke={BLOOD_COLORS.venous} strokeWidth={8} strokeLinejoin="round" />
      {/* Right Pulmonary Vein: Lungs -> Heart(LA) */}
      <path d="M 314 55 L 368 55 L 368 150 L 274 150" fill="none" stroke={BLOOD_COLORS.arterial} strokeWidth={8} strokeLinejoin="round" />

      {/* Right Aorta: Heart(LV) -> Tissues */}
      <path d="M 274 178 L 368 178 L 368 265 L 322 265" fill="none" stroke={BLOOD_COLORS.arterial} strokeWidth={8} strokeLinejoin="round" />
      {/* Left Vena Cava: Tissues -> Heart(RA) */}
      <path d="M 138 265 L 92 265 L 92 178 L 186 178" fill="none" stroke={BLOOD_COLORS.venous} strokeWidth={8} strokeLinejoin="round" />

      {/* Center Heart 4-grid */}
      <rect x={182} y={118} width={96} height={86} rx={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2} />
      <rect x={186} y={122} width={42} height={37} rx={4} fill={BLOOD_COLORS.venous} />
      <text x={207} y={145} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#FFFFFF">우심방</text>
      <rect x={186} y={163} width={42} height={37} rx={4} fill={BLOOD_COLORS.venous} />
      <text x={207} y={186} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#FFFFFF">우심실</text>

      <rect x={232} y={122} width={42} height={37} rx={4} fill={BLOOD_COLORS.arterial} />
      <text x={253} y={145} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#FFFFFF">좌심방</text>
      <rect x={232} y={163} width={42} height={37} rx={4} fill={BLOOD_COLORS.arterial} />
      <text x={253} y={186} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#FFFFFF">좌심실</text>

      {/* Vessel callouts */}
      <rect x={16} y={86} width={96} height={32} rx={8} fill="#EFF6FF" stroke="#457B9D" strokeWidth={1.5} />
      <text x={64} y={100} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#1E3A5F">폐동맥</text>
      <text x={64} y={113} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#457B9D">(정맥혈!)</text>

      <rect x={348} y={86} width={96} height={32} rx={8} fill="#FEF2F2" stroke="#E63946" strokeWidth={1.5} />
      <text x={396} y={100} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#991B1B">폐정맥</text>
      <text x={396} y={113} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#E63946">(동맥혈!)</text>

      <rect x={16} y={202} width={96} height={32} rx={8} fill="#EFF6FF" stroke="#457B9D" strokeWidth={1.5} />
      <text x={64} y={216} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#1E3A5F">대정맥</text>
      <text x={64} y={229} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#457B9D">(정맥혈)</text>

      <rect x={348} y={202} width={96} height={32} rx={8} fill="#FEF2F2" stroke="#E63946" strokeWidth={1.5} />
      <text x={396} y={216} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#991B1B">대동맥</text>
      <text x={396} y={229} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#E63946">(동맥혈)</text>

      {/* Bottom Rule Banner */}
      <rect x={28} y={292} width={404} height={22} rx={8} fill="#0F172A" />
      <text x={230} y={307} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#FACC15">
        핵심 공식: 폐순환(우심실→폐→좌심방) · 체순환(좌심실→온몸→우심방)
      </text>
    </g>
  );
}

/**
 * Renders one of the 6 high-detail educational SVG illustrations selectable by `illustrationId`.
 */
export default function AnatomicalGallerySVG({
  illustrationId = 'circulation_overview',
  className = '',
}) {
  const renderIllustration = () => {
    switch (illustrationId) {
      case 'heart_cross_section':
        return <HeartCrossSectionSVG />;
      case 'alveolus_gas_exchange':
        return <AlveolusGasExchangeSVG />;
      case 'tissue_material_exchange':
        return <TissueMaterialExchangeSVG />;
      case 'vessel_comparison':
        return <VesselComparisonSVG />;
      case 'rbc_oxygen':
        return <RBCOxygenSVG />;
      case 'circulation_overview':
      default:
        return <CirculationOverviewSVG />;
    }
  };

  const currentMeta =
    GALLERY_ILLUSTRATIONS.find((item) => item.id === illustrationId) ||
    GALLERY_ILLUSTRATIONS[5];

  return (
    <svg
      viewBox="0 0 460 320"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label={currentMeta.titleKo}
    >
      {renderIllustration()}
    </svg>
  );
}
