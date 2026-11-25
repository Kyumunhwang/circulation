import React, { useCallback, useContext, useRef, useState } from 'react';
import SimulationContext from '../state/SimulationContext';
import ModeController from './ModeController';
import DetailGalleryPanel from './DetailGalleryPanel';
import TeacherExplanationCard from './TeacherExplanationCard';
import '../styles/dashboard.css';

const CARDIAC_PHASES = [
  { id: 'atrial_systole', label: '심방 수축' },
  { id: 'ventricular_systole', label: '심실 수축' },
  { id: 'diastole', label: '심실 이완' },
];

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.25;

/**
 * 3-Pane classroom whiteboard dashboard layout:
 * - Top: ModeController bar
 * - Left/Center (60%): Simulation viewport with zoom/pan controls, cardiac phase indicator,
 *   blood color legend, and clickable capillary micro-view hints
 * - Top-Right (40% col top): DetailGalleryPanel
 * - Bottom-Right (40% col bottom): TeacherExplanationCard
 */
export function DashboardLayout({
  children,
  simulationViewport,
  topBar,
  rightTop,
  rightBottom,
  cardiacPhase: cardiacPhaseProp,
  selectedNodeId: selectedNodeIdProp,
  blindMode: blindModeProp,
  onOpenMicroView,
}) {
  const ctx = useContext(SimulationContext) || {};
  const cardiacPhase =
    cardiacPhaseProp !== undefined ? cardiacPhaseProp : ctx.cardiacPhase ?? 'ventricular_systole';
  const selectedNodeId =
    selectedNodeIdProp !== undefined ? selectedNodeIdProp : ctx.selectedNodeId ?? 'right_ventricle';
  const blindMode = blindModeProp !== undefined ? blindModeProp : ctx.blindMode ?? false;
  const openMicroView = onOpenMicroView || ctx.openMicroView || (() => {});

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2)));
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      if (zoom <= 1) return;
      if (e.button !== 0) return;
      dragStateRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        originX: pan.x,
        originY: pan.y,
      };
    },
    [zoom, pan]
  );

  const handlePointerMove = useCallback((e) => {
    const drag = dragStateRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
    }
    if (drag.moved) {
      setPan({
        x: Math.max(-320, Math.min(320, drag.originX + dx)),
        y: Math.max(-240, Math.min(240, drag.originY + dy)),
      });
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragStateRef.current.active = false;
  }, []);

  const viewportContent = simulationViewport || children;

  return (
    <div className="dashboard-shell">
      {topBar || <ModeController />}

      <main className="dashboard-grid">
        {/* Pane 1: Left / Center Main Simulation Viewport (60%) */}
        <section className="dashboard-pane sim-pane" aria-label="순환계 인터랙티브 시뮬레이션 화면">
          <div className="sim-pane__header">
            <div className="sim-legend" aria-label="혈액 색상 범례">
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--arterial" aria-hidden="true" />
                <span>동맥혈 (산소 풍부 · 선홍색)</span>
              </span>
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--venous" aria-hidden="true" />
                <span>정맥혈 (산소 부족 · 암적색)</span>
              </span>
            </div>

            <div className="cardiac-phase-pill" aria-label="현재 심장 박동 주기">
              <span className="cardiac-phase-pill__label">심장 박동 주기</span>
              <div className="cardiac-phase-steps">
                {CARDIAC_PHASES.map((phase) => {
                  const active = cardiacPhase === phase.id;
                  const extraClass = phase.id === 'diastole' ? 'cardiac-step--diastole' : '';
                  return (
                    <span
                      key={phase.id}
                      className={`cardiac-step ${extraClass} ${active ? 'is-active' : ''}`}
                      aria-current={active ? 'step' : undefined}
                    >
                      {phase.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="sim-pane__viewport"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
          >
            <div className="sim-zoom-controls" role="group" aria-label="화면 확대 및 축소">
              <button
                type="button"
                className="zoom-btn"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
                title="축소"
                aria-label="시뮬레이션 축소"
              >
                －
              </button>
              <span className="zoom-level-text" aria-live="polite">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="zoom-btn"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
                title="확대"
                aria-label="시뮬레이션 확대"
              >
                ＋
              </button>
              <button
                type="button"
                className="zoom-btn"
                onClick={handleResetView}
                title="배율 및 위치 초기화"
              >
                초기화
              </button>
            </div>

            <div
              className="sim-pane__zoom-stage"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {viewportContent}
            </div>
          </div>

          <div className="sim-pane__footer">
            <div className="focal-hint-group">
              <span className="focal-hint-label">🔍 모세혈관 미시 확대 뷰:</span>
              <button
                type="button"
                className={`focal-hint-btn ${
                  selectedNodeId === 'pulmonary_capillaries' ? 'is-highlighted' : ''
                }`}
                onClick={() => openMicroView('pulmonary_capillaries')}
              >
                폐의 모세혈관 (기체 교환)
              </button>
              <button
                type="button"
                className={`focal-hint-btn ${
                  selectedNodeId === 'systemic_capillaries' ? 'is-highlighted' : ''
                }`}
                onClick={() => openMicroView('systemic_capillaries')}
              >
                온몸의 모세혈관 (물질 교환)
              </button>
            </div>

            {blindMode && (
              <span className="blind-status-banner">
                🙈 블라인드 테스트 ON · 도표 명칭을 클릭해 정답 공개
              </span>
            )}
          </div>
        </section>

        {/* Right Column: Top DetailGalleryPanel + Bottom TeacherExplanationCard */}
        <div className="dashboard-right-col">
          <section className="dashboard-pane gallery-panel" aria-label="선택 구간 해부학 모식도 갤러리">
            {rightTop || <DetailGalleryPanel />}
          </section>

          <section className="dashboard-pane teacher-card" aria-label="단계별 교사용 해설 카드">
            {rightBottom || <TeacherExplanationCard />}
          </section>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
