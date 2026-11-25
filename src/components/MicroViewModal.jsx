import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import curriculumData from '../data/curriculumData.json';
import { SimulationContext } from '../state/SimulationContext';
import MicroViewCanvas, { PARTICLE_META } from './MicroViewCanvas';
import '../styles/microView.css';

const TABS = [
  {
    id: 'pulmonary_capillaries',
    label: '폐포와 모세혈관 기체 교환',
    dotClass: 'micro-tab-dot--pulmonary',
  },
  {
    id: 'systemic_capillaries',
    label: '조직세포와 모세혈관 물질 교환',
    dotClass: 'micro-tab-dot--systemic',
  },
];

const LEGEND_ITEMS = [
  { type: 'O2', label: 'O₂ (산소)', swatchClass: 'micro-legend-swatch--o2' },
  { type: 'CO2', label: 'CO₂ (이산화탄소)', swatchClass: 'micro-legend-swatch--co2' },
  { type: 'nutrient', label: '영양소', swatchClass: 'micro-legend-swatch--nutrient' },
  { type: 'waste', label: '노폐물', swatchClass: 'micro-legend-swatch--waste' },
];

const SPEED_OPTIONS = [0.5, 1, 2];

function normalizeTarget(rawTarget) {
  return rawTarget === 'systemic_capillaries' ? 'systemic_capillaries' : 'pulmonary_capillaries';
}

export default function MicroViewModal({
  isOpen,
  target,
  microViewTarget: propMicroViewTarget,
  onChangeTarget,
  onSelectTarget,
  onClose,
}) {
  const simCtx = useContext(SimulationContext);

  const externalTarget = target ?? propMicroViewTarget ?? simCtx?.microViewTarget ?? null;
  const shouldOpen = typeof isOpen === 'boolean' ? isOpen : Boolean(externalTarget);

  const [activeTab, setActiveTab] = useState(() => normalizeTarget(externalTarget));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [gradientLevel, setGradientLevel] = useState('normal'); // 'normal' | 'high'
  const [hoveredParticle, setHoveredParticle] = useState(null);
  const [pinnedParticle, setPinnedParticle] = useState(null);

  useEffect(() => {
    if (externalTarget) {
      setActiveTab(normalizeTarget(externalTarget));
      setHoveredParticle(null);
      setPinnedParticle(null);
    }
  }, [externalTarget]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (simCtx?.closeMicroView) {
      simCtx.closeMicroView();
    }
  }, [onClose, simCtx]);

  useEffect(() => {
    if (!shouldOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldOpen, handleClose]);

  const activeParticle = hoveredParticle ?? pinnedParticle;

  const microData = useMemo(() => {
    return (
      curriculumData?.microViews?.[activeTab] ??
      curriculumData?.microViews?.pulmonary_capillaries
    );
  }, [activeTab]);

  if (!shouldOpen || !microData) {
    return null;
  }

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setHoveredParticle(null);
    setPinnedParticle(null);
    if (onChangeTarget) {
      onChangeTarget(tabId);
    } else if (onSelectTarget) {
      onSelectTarget(tabId);
    } else if (simCtx?.setMicroViewTarget) {
      simCtx.setMicroViewTarget(tabId);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const activeParticleMeta = activeParticle ? PARTICLE_META[activeParticle] : null;
  const activeParticleDesc = activeParticleMeta
    ? activeTab === 'pulmonary_capillaries'
      ? activeParticleMeta.pulmonaryDesc
      : activeParticleMeta.systemicDesc
    : null;
  const canvasHighlight =
    activeTab === 'pulmonary_capillaries' &&
    (activeParticle === 'nutrient' || activeParticle === 'waste')
      ? null
      : activeParticle;

  const getExchangeItemClass = (item) => {
    if (item.substance.includes('영양소')) return 'micro-exchange-item--nutrient';
    if (item.substance.includes('노폐물')) return 'micro-exchange-item--waste';
    if (item.direction === 'alveolus_to_blood' || item.direction === 'blood_to_tissue') {
      return 'micro-exchange-item--in';
    }
    return 'micro-exchange-item--out';
  };

  return (
    <div
      className="micro-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="micro-modal-heading"
      onClick={handleBackdropClick}
    >
      <div className="micro-modal-dialog">
        {/* Header */}
        <header className="micro-modal-header">
          <div className="micro-modal-title-group">
            <span className="micro-modal-badge">미시 확대 시뮬레이션 · 모세혈관 물질 교환</span>
            <h2 id="micro-modal-heading" className="micro-modal-title">
              {microData.title}
            </h2>
          </div>

          <button
            type="button"
            className="micro-close-btn"
            onClick={handleClose}
            aria-label="미시 확대 모달 닫기"
          >
            <span aria-hidden="true">✕</span>
            <span>닫기 (ESC)</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="micro-tabs-bar" role="tablist" aria-label="모세혈관 미시 뷰 선택">
          <div className="micro-tabs-group">
            {TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`micro-tab-btn ${selected ? 'is-active' : ''}`}
                  onClick={() => handleTabSelect(tab.id)}
                >
                  <span className={`micro-tab-dot ${tab.dotClass}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="micro-direction-pill">
            <span>{microData.subtitle}</span>
          </div>
        </div>

        {/* Body */}
        <div className="micro-modal-body">
          {/* Left: Canvas + Controls + Interactive Legend */}
          <div className="micro-simulation-col">
            <div className="micro-canvas-card">
              <MicroViewCanvas
                mode={activeTab}
                isPlaying={isPlaying}
                speed={speed}
                gradientLevel={gradientLevel}
                highlightedParticle={canvasHighlight}
                onHoverParticle={setHoveredParticle}
              />

              {activeParticleMeta && (
                <div className="micro-hover-tooltip" role="status">
                  <strong>{activeParticleMeta.label}</strong>
                  <span>{activeParticleDesc}</span>
                </div>
              )}
            </div>

            {/* Playback & Concentration Gradient Controls */}
            <div className="micro-controls-bar">
              <div className="micro-control-group">
                <button
                  type="button"
                  className={`micro-play-btn ${!isPlaying ? 'is-paused' : ''}`}
                  onClick={() => setIsPlaying((prev) => !prev)}
                >
                  {isPlaying ? '⏸ 일시정지' : '▶ 재생'}
                </button>

                <span className="micro-control-label">배속</span>
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`micro-pill-btn ${speed === opt ? 'is-active' : ''}`}
                    onClick={() => setSpeed(opt)}
                  >
                    {opt}x
                  </button>
                ))}
              </div>

              <div className="micro-control-group">
                <span className="micro-control-label">농도 차이</span>
                <button
                  type="button"
                  className={`micro-pill-btn ${gradientLevel === 'normal' ? 'is-active' : ''}`}
                  onClick={() => setGradientLevel('normal')}
                >
                  안정 상태
                </button>
                <button
                  type="button"
                  className={`micro-pill-btn is-gradient-high ${
                    gradientLevel === 'high' ? 'is-active' : ''
                  }`}
                  onClick={() => setGradientLevel('high')}
                >
                  농도 차 확대 (운동 시)
                </button>
              </div>
            </div>

            {/* Interactive Legend */}
            <div className="micro-legend-bar" aria-label="입자 범례">
              <span className="micro-legend-title">입자 범례 (강조 보기):</span>
              {LEGEND_ITEMS.map((item) => {
                const isActive = activeParticle === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    className={`micro-legend-item ${isActive ? 'is-highlighted' : ''}`}
                    onMouseEnter={() => setHoveredParticle(item.type)}
                    onMouseLeave={() => setHoveredParticle(null)}
                    onClick={() =>
                      setPinnedParticle((prev) => (prev === item.type ? null : item.type))
                    }
                    aria-pressed={pinnedParticle === item.type}
                  >
                    <span
                      className={`micro-legend-swatch ${item.swatchClass}`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <span className="micro-legend-hint">마우스 올리기 또는 클릭으로 이동 경로 강조</span>
            </div>
          </div>

          {/* Right: Diffusion Principle & Educational Breakdown */}
          <aside className="micro-info-col">
            <section className="micro-info-card micro-info-card--principle">
              <h3 className="micro-info-card-title">핵심 원리 · 농도 차이에 의한 확산</h3>
              <p className="micro-info-text">{microData.diffusionPrinciple}</p>
            </section>

            <section className="micro-info-card">
              <h3 className="micro-info-card-title">혈액 상태 변화</h3>
              <div className="micro-blood-transition-box">
                <span
                  className={`micro-blood-chip ${
                    microData.bloodTransition.from === 'venous'
                      ? 'micro-blood-chip--venous'
                      : 'micro-blood-chip--arterial'
                  }`}
                >
                  {microData.bloodTransition.fromLabel}
                </span>
                <span aria-hidden="true">→</span>
                <span
                  className={`micro-blood-chip ${
                    microData.bloodTransition.to === 'arterial'
                      ? 'micro-blood-chip--arterial'
                      : 'micro-blood-chip--venous'
                  }`}
                >
                  {microData.bloodTransition.toLabel}
                </span>
              </div>
              <p className="micro-exchange-desc" style={{ marginTop: '8px', fontWeight: 700 }}>
                산소 포화도 변화: {microData.bloodTransition.oxygenSaturationChange}
              </p>
            </section>

            <section className="micro-info-card">
              <h3 className="micro-info-card-title">물질별 이동 방향</h3>
              <ul className="micro-exchange-list">
                {microData.exchanges.map((ex) => (
                  <li
                    key={ex.substance}
                    className={`micro-exchange-item ${getExchangeItemClass(ex)}`}
                  >
                    <div className="micro-exchange-item-head">
                      <span>{ex.substance}</span>
                      <span className="micro-exchange-dir">
                        {ex.from} → {ex.to}
                      </span>
                    </div>
                    <p className="micro-exchange-desc">{ex.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            {microData.classroomQuestion && (
              <div className="micro-tip-box">
                <strong>수업 발문 팁</strong>
                <span>{microData.classroomQuestion}</span>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
