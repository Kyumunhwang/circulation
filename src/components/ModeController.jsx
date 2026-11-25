import React, { useContext } from 'react';
import SimulationContext from '../state/SimulationContext';
import curriculumData from '../data/curriculumData.json';

const MODE_OPTIONS = [
  { id: 'all', label: '전체 순환 보기', className: 'mode-btn--all' },
  { id: 'pulmonary', label: '폐순환 집중 모드', className: 'mode-btn--pulmonary' },
  { id: 'systemic', label: '체순환 집중 모드', className: 'mode-btn--systemic' },
  { id: 'blood_type', label: '동맥혈·정맥혈 하이라이트 모드', className: 'mode-btn--blood-type' },
];

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1.0x' },
  { value: 2, label: '2.0x' },
];

/**
 * Top control bar for classroom whiteboard operation:
 * - Simulation title & achievement standard badge
 * - 4 one-click circulation visualization modes
 * - Teacher tools (Blind Test toggle, Misconception comparison, Formative quiz)
 * - Playback controls (Play/Pause, speed 0.5x/1.0x/2.0x, Prev/Next step)
 */
export function ModeController({
  title,
  achievementStandard,
  mode: modeProp,
  onModeChange,
  isPlaying: isPlayingProp,
  onTogglePlay,
  speed: speedProp,
  onSpeedChange,
  onPrevStep,
  onNextStep,
  blindMode: blindModeProp,
  onToggleBlindMode,
  onRevealAll,
  onHideAll,
  onOpenMisconception,
  onOpenQuiz,
  extraTeacherTools = null,
}) {
  const ctx = useContext(SimulationContext) || {};

  const displayTitle =
    title || curriculumData?.meta?.title || '중학교 2학년 과학 [순환] 인터랙티브 시뮬레이션';
  const displayStandard =
    achievementStandard || curriculumData?.meta?.achievementStandard || '[9과11-02]';

  const mode = modeProp !== undefined ? modeProp : ctx.mode ?? 'all';
  const setMode = onModeChange || ctx.setMode || (() => {});

  const isPlaying = isPlayingProp !== undefined ? isPlayingProp : ctx.isPlaying ?? true;
  const togglePlay = onTogglePlay || ctx.togglePlay || (() => {});

  const speed = speedProp !== undefined ? speedProp : ctx.speed ?? 1;
  const setSpeed = onSpeedChange || ctx.setSpeed || (() => {});

  const handlePrevStep = onPrevStep || ctx.stepPrev || (() => {});
  const handleNextStep = onNextStep || ctx.stepNext || (() => {});

  const blindMode = blindModeProp !== undefined ? blindModeProp : ctx.blindMode ?? false;
  const toggleBlindMode = onToggleBlindMode || ctx.toggleBlindMode || (() => {});
  const revealAll = onRevealAll || ctx.revealAllLabels || (() => {});
  const hideAll = onHideAll || ctx.hideAllLabels || (() => {});

  const openMisconception =
    onOpenMisconception || (() => ctx.setShowMisconceptionModal?.(true));
  const openQuiz = onOpenQuiz || (() => ctx.setShowQuizModal?.(true));

  return (
    <header className="mode-controller" role="banner">
      <div className="mode-controller__top-row">
        <div className="mode-controller__brand">
          <span className="mode-controller__badge">{displayStandard}</span>
          <h1 className="mode-controller__title">{displayTitle}</h1>
        </div>

        <div className="mode-controller__teacher-tools" aria-label="교사용 수업 보조 도구">
          <button
            type="button"
            className={`tool-btn tool-btn--blind ${blindMode ? 'is-active' : ''}`}
            onClick={toggleBlindMode}
            aria-pressed={blindMode}
            title="도표의 명칭을 가리고 학생들에게 질문한 뒤 클릭하여 정답을 공개합니다."
          >
            <span>{blindMode ? '🙈 레이블 숨김 ON' : '👁️ 레이블 숨기기'}</span>
          </button>

          {blindMode && (
            <>
              <button
                type="button"
                className="tool-btn tool-btn--subtle"
                onClick={revealAll}
              >
                전체 공개
              </button>
              <button
                type="button"
                className="tool-btn tool-btn--subtle"
                onClick={hideAll}
              >
                모두 가리기
              </button>
            </>
          )}

          <button
            type="button"
            className="tool-btn tool-btn--misconception"
            onClick={openMisconception}
          >
            <span>⚖️ 핵심 오개념 비교</span>
          </button>

          <button
            type="button"
            className="tool-btn tool-btn--quiz"
            onClick={openQuiz}
          >
            <span>📝 형성평가 퀴즈</span>
          </button>

          {extraTeacherTools}
        </div>
      </div>

      <div className="mode-controller__bottom-row">
        <nav className="mode-controller__modes" aria-label="순환 학습 모드 선택">
          {MODE_OPTIONS.map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mode-btn ${item.className} ${active ? 'is-active' : ''}`}
                onClick={() => setMode(item.id)}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="playback-bar" aria-label="시뮬레이션 재생 및 단계 제어">
          <div className="playback-group">
            <button
              type="button"
              className="ctrl-btn"
              onClick={handlePrevStep}
              title="이전 순환 단계로 이동"
            >
              ◀ 이전 단계
            </button>
            <button
              type="button"
              className={`ctrl-btn ctrl-btn--play ${isPlaying ? '' : 'is-paused'}`}
              onClick={togglePlay}
              aria-pressed={isPlaying}
            >
              {isPlaying ? '⏸ 일시정지' : '▶ 재생'}
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={handleNextStep}
              title="다음 순환 단계로 이동"
            >
              다음 단계 ▶
            </button>
          </div>

          <div className="playback-group" role="group" aria-label="재생 배속">
            {SPEED_OPTIONS.map((opt) => {
              const active = Number(speed) === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`ctrl-btn ctrl-btn--speed ${active ? 'is-active' : ''}`}
                  onClick={() => setSpeed(opt.value)}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ModeController;
