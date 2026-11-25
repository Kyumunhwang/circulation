import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SimulationContext from '../state/SimulationContext';
import curriculumData from '../data/curriculumData.json';
import AnatomicalGallerySVG, { GALLERY_ILLUSTRATIONS } from './AnatomicalGallerySVG';

const SHORT_THUMB_LABELS = {
  heart_cross_section: '심장 단면·벽두께',
  alveolus_gas_exchange: '폐포 기체교환',
  tissue_material_exchange: '조직 물질교환',
  vessel_comparison: '동맥·정맥·모세혈관',
  rbc_oxygen: '적혈구 O₂ 운반',
  circulation_overview: '순환 통합 모식도',
};

/**
 * Top-right pane showing the enlarged anatomical illustration (AnatomicalGallerySVG)
 * synced to the currently selected circulation node, inline 1x/2x zoom + drag-pan,
 * a 2x enlarged Lightbox modal, a 6-item gallery switcher, and a quick CTA button
 * to open the capillary Micro-View when relevant.
 */
export function DetailGalleryPanel({
  selectedNodeId: selectedNodeIdProp,
  onOpenMicroView,
}) {
  const ctx = useContext(SimulationContext) || {};
  const selectedNodeId =
    selectedNodeIdProp !== undefined ? selectedNodeIdProp : ctx.selectedNodeId ?? 'right_ventricle';
  const openMicroView = onOpenMicroView || ctx.openMicroView || (() => {});

  const node = curriculumData?.nodes?.[selectedNodeId];
  const nodeIllustrationId = node?.galleryIllustrationId || 'heart_cross_section';

  const [manualIllustrationId, setManualIllustrationId] = useState(null);
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(2);

  const scrollRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    setManualIllustrationId(null);
  }, [selectedNodeId]);

  // Center scroll viewport when zooming into 2x
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (galleryZoom > 1) {
      const rafId = window.requestAnimationFrame(() => {
        el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
        el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
      });
      return () => window.cancelAnimationFrame(rafId);
    }
    el.scrollLeft = 0;
    el.scrollTop = 0;
    return undefined;
  }, [galleryZoom]);

  // Close Lightbox modal on ESC
  useEffect(() => {
    if (!isModalOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = useCallback(() => {
    setModalZoom(2);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      if (galleryZoom <= 1 || e.button !== 0) return;
      const el = scrollRef.current;
      if (!el) return;
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
      setIsDragging(true);
    },
    [galleryZoom]
  );

  const handlePointerMove = useCallback((e) => {
    const drag = dragRef.current;
    const el = scrollRef.current;
    if (!drag.active || !el) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    el.scrollLeft = drag.scrollLeft - dx;
    el.scrollTop = drag.scrollTop - dy;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  const activeIllustrationId = manualIllustrationId || nodeIllustrationId;
  const activeMeta =
    GALLERY_ILLUSTRATIONS.find((item) => item.id === activeIllustrationId) ||
    GALLERY_ILLUSTRATIONS[0];

  const isCapillarySelected =
    selectedNodeId === 'pulmonary_capillaries' || selectedNodeId === 'systemic_capillaries';

  const microTarget =
    selectedNodeId === 'systemic_capillaries' || activeIllustrationId === 'tissue_material_exchange'
      ? 'systemic_capillaries'
      : 'pulmonary_capillaries';

  const showQuickMicroButton =
    isCapillarySelected ||
    activeIllustrationId === 'alveolus_gas_exchange' ||
    activeIllustrationId === 'tissue_material_exchange';

  const modalContent = isModalOpen ? (
    <div
      className="gallery-modal-backdrop"
      role="presentation"
      onClick={handleCloseModal}
    >
      <div
        className="gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gallery-modal__header">
          <div className="gallery-modal__title-wrap">
            <h2 id="gallery-modal-title" className="gallery-modal__title">
              🖼️ {activeMeta?.titleKo}
            </h2>
            <p className="gallery-modal__subtitle">{activeMeta?.subtitleKo}</p>
          </div>

          <div className="gallery-modal__actions">
            <div className="gallery-modal__zoom-group" role="group" aria-label="모달 확대 배율">
              <button
                type="button"
                className={`gallery-zoom-btn ${modalZoom === 1 ? 'is-active' : ''}`}
                onClick={() => setModalZoom(1)}
                aria-pressed={modalZoom === 1}
              >
                1x (460×320)
              </button>
              <button
                type="button"
                className={`gallery-zoom-btn ${modalZoom === 2 ? 'is-active' : ''}`}
                onClick={() => setModalZoom(2)}
                aria-pressed={modalZoom === 2}
              >
                2x (920×640)
              </button>
            </div>

            <button
              type="button"
              className="gallery-modal__close-btn"
              onClick={handleCloseModal}
              aria-label="확대 모식도 닫기"
            >
              닫기 (ESC)
            </button>
          </div>
        </div>

        <div className="gallery-modal__stage">
          <div
            className="gallery-modal__svg-box"
            style={{
              width: modalZoom === 2 ? '920px' : '460px',
              height: modalZoom === 2 ? '640px' : '320px',
            }}
          >
            <AnatomicalGallerySVG
              illustrationId={activeIllustrationId}
              className="gallery-modal__svg"
            />
          </div>
        </div>

        <div className="gallery-modal__footer" role="tablist" aria-label="확대 모식도 6종 전환">
          {GALLERY_ILLUSTRATIONS.map((item) => {
            const active = item.id === activeIllustrationId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`gallery-thumb-btn gallery-modal__tab ${active ? 'is-active' : ''}`}
                onClick={() => setManualIllustrationId(item.id)}
              >
                {SHORT_THUMB_LABELS[item.id] || item.titleKo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="pane-header">
        <h2 className="pane-header__title">
          <span aria-hidden="true">🖼️</span>
          <span>해부학 확대 모식도</span>
        </h2>

        <div className="gallery-header-actions">
          <button
            type="button"
            className="gallery-expand-btn"
            onClick={handleOpenModal}
            title="가로·세로 2배 크기의 전체 모식도 창 열기"
          >
            🔍 2배 크게 보기
          </button>

          {showQuickMicroButton && (
            <button
              type="button"
              className="gallery-micro-cta"
              onClick={() => openMicroView(microTarget)}
            >
              🔬 미시 확대 뷰 열기
            </button>
          )}
        </div>
      </div>

      <div className="gallery-panel__body">
        <div className="gallery-panel__caption">
          <strong className="gallery-panel__caption-title">{activeMeta?.titleKo}</strong>
          <span className="gallery-panel__caption-sub" title={activeMeta?.subtitleKo}>
            {activeMeta?.subtitleKo}
          </span>
        </div>

        <div className="gallery-panel__stage">
          <div className="gallery-zoom-controls" role="group" aria-label="모식도 인라인 확대 제어">
            <button
              type="button"
              className={`gallery-zoom-btn ${galleryZoom === 1 ? 'is-active' : ''}`}
              onClick={() => setGalleryZoom(1)}
              aria-pressed={galleryZoom === 1}
              title="원래 크기 (100%)"
            >
              1x
            </button>
            <button
              type="button"
              className={`gallery-zoom-btn ${galleryZoom === 2 ? 'is-active' : ''}`}
              onClick={() => setGalleryZoom(2)}
              aria-pressed={galleryZoom === 2}
              title="가로·세로 2배 확대 (200%)"
            >
              2x
            </button>
            {galleryZoom !== 1 && (
              <button
                type="button"
                className="gallery-zoom-btn"
                onClick={() => setGalleryZoom(1)}
                title="배율 초기화"
              >
                초기화
              </button>
            )}
          </div>

          <div
            ref={scrollRef}
            className={`gallery-panel__scroll ${galleryZoom > 1 ? 'is-zoomed' : ''} ${
              isDragging ? 'is-dragging' : ''
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onDoubleClick={handleOpenModal}
            title={
              galleryZoom > 1
                ? '드래그 또는 스크롤로 이동, 더블 클릭 시 2배 크게 보기 창 열림'
                : '더블 클릭 시 2배 크게 보기 창 열림'
            }
          >
            <div
              className="gallery-panel__svg-frame"
              style={{
                width: `${galleryZoom * 100}%`,
                height: `${galleryZoom * 100}%`,
                minWidth: `${galleryZoom * 100}%`,
                minHeight: `${galleryZoom * 100}%`,
              }}
            >
              <AnatomicalGallerySVG
                illustrationId={activeIllustrationId}
                className="gallery-panel__svg"
              />
            </div>
          </div>
        </div>

        <div className="gallery-panel__thumbs" role="tablist" aria-label="6대 해부학 모식도 선택">
          {GALLERY_ILLUSTRATIONS.map((item) => {
            const active = item.id === activeIllustrationId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`gallery-thumb-btn ${active ? 'is-active' : ''}`}
                onClick={() => setManualIllustrationId(item.id)}
                title={item.titleKo}
              >
                {SHORT_THUMB_LABELS[item.id] || item.titleKo}
              </button>
            );
          })}
        </div>
      </div>

      {typeof document !== 'undefined' && modalContent
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}

export default DetailGalleryPanel;
