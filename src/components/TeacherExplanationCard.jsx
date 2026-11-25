import React, { useContext } from 'react';
import SimulationContext from '../state/SimulationContext';
import curriculumData from '../data/curriculumData.json';

function getBloodBadgeClass(node) {
  if (!node) return 'blood-badge--venous';
  if (node.bloodType === 'arterial') return 'blood-badge--arterial';
  if (node.bloodType === 'venous') return 'blood-badge--venous';
  if (node.bloodType === 'gas_exchange' || node.bloodType === 'material_exchange') {
    return 'blood-badge--exchange';
  }
  if (node.bloodType === 'valve') {
    if (node.passingBloodType === 'arterial') return 'blood-badge--arterial';
    if (node.passingBloodType === 'venous') return 'blood-badge--venous';
    return 'blood-badge--valve';
  }
  return 'blood-badge--venous';
}

function maskNodeNameInText(text, nameKo) {
  if (!text || !nameKo) return text || '';
  const baseName = nameKo.replace(/\s*\([^)]*\)/g, '').trim();
  if (!baseName) return text;
  return text.split(baseName).join('[ ??? ]');
}

/**
 * Bottom-right pane displaying step-by-step teacher commentary from curriculumData.json:
 * - Node name (masked in blindMode until individually revealed)
 * - Blood type badge & oxygen saturation
 * - Flow direction & substance/gas exchange principle
 * - Wall thickness note (emphasizing left_ventricle's thickest muscular wall)
 * - Classroom Q&A tip (수업 발문 팁)
 */
export function TeacherExplanationCard({
  selectedNodeId: selectedNodeIdProp,
  blindMode: blindModeProp,
  revealedLabels: revealedLabelsProp,
  onToggleBlindLabel,
  onOpenMicroView,
  stepOrder: stepOrderProp,
}) {
  const ctx = useContext(SimulationContext) || {};

  const selectedNodeId =
    selectedNodeIdProp !== undefined ? selectedNodeIdProp : ctx.selectedNodeId ?? 'right_ventricle';
  const blindMode = blindModeProp !== undefined ? blindModeProp : ctx.blindMode ?? false;
  const revealedLabels =
    revealedLabelsProp !== undefined ? revealedLabelsProp : ctx.revealedLabels ?? [];
  const toggleBlindLabel = onToggleBlindLabel || ctx.toggleBlindLabel || (() => {});
  const openMicroView = onOpenMicroView || ctx.openMicroView || (() => {});
  const stepOrder =
    stepOrderProp || ctx.activeStepOrder || curriculumData?.meta?.stepOrder || [];

  const nodes = curriculumData?.nodes || {};
  const node = nodes[selectedNodeId] || nodes.right_ventricle;
  if (!node) {
    return null;
  }

  const isRevealed = !blindMode || revealedLabels.includes(node.id);
  const stepIndex = stepOrder.indexOf(node.id);
  const isCapillary =
    node.id === 'pulmonary_capillaries' || node.id === 'systemic_capillaries';
  const isLeftVentricle = node.id === 'left_ventricle';

  const displayDirection = isRevealed
    ? node.directionText
    : maskNodeNameInText(node.directionText, node.nameKo);

  return (
    <>
      <div className="pane-header">
        <h2 className="pane-header__title">
          <span aria-hidden="true">👩‍🏫</span>
          <span>단계별 교사용 해설</span>
        </h2>
        {stepIndex >= 0 && (
          <span className="o2-badge" aria-label="현재 단계 번호">
            단계 {stepIndex + 1} / {stepOrder.length}
          </span>
        )}
      </div>

      <div className="teacher-card__body">
        <div className="teacher-card__hero">
          {isRevealed ? (
            <div>
              <h3 className="teacher-card__node-title">{node.nameKo}</h3>
              <div className="teacher-card__node-sub">{node.nameEn}</div>
            </div>
          ) : (
            <div className="teacher-card__blind-box">
              <span className="blind-mask-pill" aria-label="가려진 명칭">
                ??? (명칭 비공개)
              </span>
              <button
                type="button"
                className="blind-reveal-btn"
                onClick={() => toggleBlindLabel(node.id)}
              >
                정답 공개
              </button>
            </div>
          )}

          {blindMode && isRevealed && (
            <button
              type="button"
              className="blind-reveal-btn"
              onClick={() => toggleBlindLabel(node.id)}
            >
              다시 가리기
            </button>
          )}
        </div>

        <div className="teacher-card__badges">
          <span className={`blood-badge ${getBloodBadgeClass(node)}`}>
            {node.bloodTypeLabel}
          </span>
          <span className="o2-badge">산소(O₂) 포화도: {node.oxygenSaturation}</span>
        </div>

        <div className="info-block">
          <div className="info-block__label">혈액 이동 방향</div>
          <p className="info-block__text">{displayDirection}</p>
        </div>

        <div className="info-block">
          <div className="info-block__label">물질·기체 교환 및 생물학적 원리</div>
          <p className="info-block__text">{node.exchangePrinciple}</p>
          {node.teacherExplanation && (
            <p className="info-block__text" style={{ marginTop: '6px', color: '#334155' }}>
              {node.teacherExplanation}
            </p>
          )}
        </div>

        {node.wallThicknessNote && (
          <div className={`info-block ${isLeftVentricle ? 'info-block--wall' : ''}`}>
            <div className="info-block__label">
              {isLeftVentricle ? '⚡ 좌심실 근육벽 두께 핵심 포인트' : '구조 및 압력 특징'}
            </div>
            <p className="info-block__text">{node.wallThicknessNote}</p>
          </div>
        )}

        {isCapillary && (
          <div className="info-block info-block--micro">
            <span className="info-block__text" style={{ fontWeight: 800, color: '#5b21b6' }}>
              🔬 모세혈관 확산 입자를 확대해 확인하세요
            </span>
            <button
              type="button"
              className="gallery-micro-cta"
              onClick={() => openMicroView(node.id)}
            >
              미시 뷰 열기
            </button>
          </div>
        )}

        {node.classroomTip && (
          <div className="info-block info-block--tip">
            <div className="info-block__label">💡 수업 발문 팁</div>
            <p className="info-block__text">{node.classroomTip}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default TeacherExplanationCard;
