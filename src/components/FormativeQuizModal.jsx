import React, { useEffect, useMemo, useState } from 'react';
import curriculumData from '../data/curriculumData.json';
import '../styles/teacherTools.css';

const FALLBACK_QUIZZES = [
  {
    id: 'quiz_1',
    number: 1,
    type: 'multiple_choice',
    category: '오개념 점검',
    question:
      "혈액의 순환 과정에서 '심장으로 들어오는 혈관(정맥)'이지만, 산소가 풍부한 '동맥혈'이 흐르는 혈관은 무엇인가요?",
    options: [
      { id: 'aorta', label: '대동맥' },
      { id: 'pulmonary_artery', label: '폐동맥' },
      { id: 'vena_cava', label: '대정맥' },
      { id: 'pulmonary_vein', label: '폐정맥' },
    ],
    correctAnswer: 'pulmonary_vein',
    explanation:
      "폐정맥은 폐의 모세혈관에서 산소(O₂)를 충분히 흡수한 직후 심장의 좌심방으로 들어오는 혈관입니다. 심장으로 들어오므로 이름은 '정맥'이지만, 산소 함량이 높은 선홍색 '동맥혈'이 흐릅니다.",
  },
  {
    id: 'quiz_2',
    number: 2,
    type: 'sequence_order',
    category: '폐순환 경로',
    question: '다음 5개의 구조를 클릭하여 올바른 [폐순환] 혈액 이동 순서대로 배열하세요.',
    options: [
      { id: 'pulmonary_vein', label: '폐정맥' },
      { id: 'right_ventricle', label: '우심실' },
      { id: 'left_atrium', label: '좌심방' },
      { id: 'pulmonary_capillaries', label: '폐의 모세혈관' },
      { id: 'pulmonary_artery', label: '폐동맥' },
    ],
    correctSequence: [
      'right_ventricle',
      'pulmonary_artery',
      'pulmonary_capillaries',
      'pulmonary_vein',
      'left_atrium',
    ],
    explanation:
      '폐순환은 [우심실 → 폐동맥 → 폐의 모세혈관(기체 교환) → 폐정맥 → 좌심방] 순서로 진행됩니다.',
  },
  {
    id: 'quiz_3',
    number: 3,
    type: 'multiple_choice',
    category: '심장의 구조',
    question:
      '심장의 4개 방 중 근육벽이 가장 두꺼우며, 대동맥과 직접 연결되어 온몸으로 혈액을 강하게 내보내는 곳은 어디인가요?',
    options: [
      { id: 'right_atrium', label: '우심방' },
      { id: 'right_ventricle', label: '우심실' },
      { id: 'left_atrium', label: '좌심방' },
      { id: 'left_ventricle', label: '좌심실' },
    ],
    correctAnswer: 'left_ventricle',
    explanation:
      '좌심실은 온몸의 모든 조직에 혈액을 공급해야 하므로 심장의 4개 방 중 근육벽이 가장 두껍고, 대동맥 판막을 통해 대동맥과 연결되어 있습니다.',
  },
  {
    id: 'quiz_4',
    number: 4,
    type: 'multiple_choice',
    category: '모세혈관 물질 교환',
    question:
      "체순환 중 '온몸의 모세혈관'과 '조직세포' 사이에서 일어나는 물질 교환에 대한 설명으로 옳은 것은?",
    options: [
      { id: 'opt1', label: '조직세포에서 모세혈관으로 산소(O₂)와 영양소가 이동한다.' },
      { id: 'opt2', label: '모세혈관에서 조직세포로 이산화탄소(CO₂)와 노폐물이 이동한다.' },
      { id: 'opt3', label: '모세혈관에서 조직세포로 산소와 영양소가 이동하고, 정맥혈이 된다.' },
      { id: 'opt4', label: '기체 교환만 일어나며 정맥혈이 선홍색 동맥혈로 바뀐다.' },
    ],
    correctAnswer: 'opt3',
    explanation:
      '온몸의 모세혈관에서는 산소(O₂)와 영양소가 조직세포로 공급되고, 이산화탄소(CO₂)와 노폐물이 모세혈관으로 회수되어 동맥혈이 정맥혈로 변합니다.',
  },
  {
    id: 'quiz_5',
    number: 5,
    type: 'sequence_order',
    category: '체순환 경로',
    question: '다음 5개의 구조를 클릭하여 올바른 [체순환(온몸 순환)] 혈액 이동 순서대로 배열하세요.',
    options: [
      { id: 'vena_cava', label: '대정맥' },
      { id: 'left_ventricle', label: '좌심실' },
      { id: 'systemic_capillaries', label: '온몸의 모세혈관' },
      { id: 'right_atrium', label: '우심방' },
      { id: 'aorta', label: '대동맥' },
    ],
    correctSequence: [
      'left_ventricle',
      'aorta',
      'systemic_capillaries',
      'vena_cava',
      'right_atrium',
    ],
    explanation:
      '체순환은 [좌심실 → 대동맥 → 온몸의 모세혈관(물질 교환) → 대정맥 → 우심방] 순서로 진행됩니다.',
  },
];

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Classroom 5-question formative assessment quiz supporting both multiple-choice
 * and interactive click-to-order / reorderable pathway sequencing questions.
 */
export function FormativeQuizModal({ isOpen = true, onClose, quizzesData }) {
  const quizzes = useMemo(() => {
    const source = quizzesData || curriculumData?.quizzes;
    return Array.isArray(source) && source.length > 0 ? source : FALLBACK_QUIZZES;
  }, [quizzesData]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [quizId]: string | string[] }
  const [checkedMap, setCheckedMap] = useState({}); // { [quizId]: boolean }
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalQuestions = quizzes.length;
  const currentQuiz = quizzes[currentIdx] || quizzes[0];
  const currentAnswer = answers[currentQuiz.id];
  const isCurrentChecked = Boolean(checkedMap[currentQuiz.id]);

  const isQuestionCorrect = (quiz) => {
    if (!checkedMap[quiz.id]) return null;
    const ans = answers[quiz.id];
    if (quiz.type === 'sequence_order') {
      return Array.isArray(ans) && arraysEqual(ans, quiz.correctSequence || []);
    }
    return ans === quiz.correctAnswer;
  };

  const checkedCount = quizzes.filter((q) => Boolean(checkedMap[q.id])).length;
  const correctCount = quizzes.filter((q) => isQuestionCorrect(q) === true).length;

  const getOptionLabel = (quiz, optionId) => {
    const found = (quiz.options || []).find((opt) => opt.id === optionId);
    return found ? found.label : optionId;
  };

  const handleSelectChoice = (optionId) => {
    if (isCurrentChecked) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuiz.id]: optionId,
    }));
  };

  const handleAddSequenceItem = (optionId) => {
    if (isCurrentChecked) return;
    setAnswers((prev) => {
      const existing = Array.isArray(prev[currentQuiz.id]) ? prev[currentQuiz.id] : [];
      if (existing.includes(optionId)) return prev;
      return {
        ...prev,
        [currentQuiz.id]: [...existing, optionId],
      };
    });
  };

  const handleRemoveSequenceItem = (optionId) => {
    if (isCurrentChecked) return;
    setAnswers((prev) => {
      const existing = Array.isArray(prev[currentQuiz.id]) ? prev[currentQuiz.id] : [];
      return {
        ...prev,
        [currentQuiz.id]: existing.filter((id) => id !== optionId),
      };
    });
  };

  const handleMoveSequenceItem = (index, delta) => {
    if (isCurrentChecked) return;
    setAnswers((prev) => {
      const existing = Array.isArray(prev[currentQuiz.id]) ? [...prev[currentQuiz.id]] : [];
      const targetIdx = index + delta;
      if (targetIdx < 0 || targetIdx >= existing.length) return prev;
      const temp = existing[index];
      existing[index] = existing[targetIdx];
      existing[targetIdx] = temp;
      return {
        ...prev,
        [currentQuiz.id]: existing,
      };
    });
  };

  const handleClearSequence = () => {
    if (isCurrentChecked) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuiz.id]: [],
    }));
  };

  const canCheckCurrent = () => {
    if (isCurrentChecked) return false;
    if (currentQuiz.type === 'sequence_order') {
      const seq = Array.isArray(currentAnswer) ? currentAnswer : [];
      const requiredLen = (currentQuiz.correctSequence || currentQuiz.options || []).length;
      return seq.length === requiredLen;
    }
    return typeof currentAnswer === 'string' && currentAnswer.length > 0;
  };

  const handleCheckAnswer = () => {
    if (!canCheckCurrent()) return;
    setCheckedMap((prev) => ({
      ...prev,
      [currentQuiz.id]: true,
    }));
  };

  const handleRetryQuestion = () => {
    setCheckedMap((prev) => {
      const next = { ...prev };
      delete next[currentQuiz.id];
      return next;
    });
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuiz.id];
      return next;
    });
  };

  const handleResetAll = () => {
    setAnswers({});
    setCheckedMap({});
    setCurrentIdx(0);
    setShowSummary(false);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  };

  const currentCorrectState = isQuestionCorrect(currentQuiz);
  const selectedSequence = Array.isArray(currentAnswer) ? currentAnswer : [];
  const expectedSequenceLen = (currentQuiz.correctSequence || currentQuiz.options || []).length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getMasteryMessage = () => {
    if (correctCount === totalQuestions) {
      return '완벽합니다! 폐순환·체순환 경로와 핵심 오개념까지 모두 정확히 이해했어요.';
    }
    if (correctCount >= Math.ceil(totalQuestions * 0.6)) {
      return '아주 잘했어요! 틀린 문항의 해설을 확인하고 시뮬레이션에서 해당 구간을 다시 눌러 보세요.';
    }
    return '좋은 시작이에요! [핵심 오개념 비교]와 [단계별 이동]을 활용해 순환 경로를 다시 복습해 봅시다.';
  };

  return (
    <div
      className="tt-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tt-quiz-title"
    >
      <div className="tt-modal tt-modal--quiz">
        <header className="tt-modal-header">
          <div className="tt-modal-title-group">
            <span className="tt-modal-kicker">중2 과학 [9과11-02] 형성평가 미니 퀴즈</span>
            <h2 id="tt-quiz-title" className="tt-modal-title">
              혈액의 순환 이해도 확인 퀴즈 ({totalQuestions}문항)
            </h2>
            <p className="tt-modal-subtitle">
              객관식과 순환 경로 순서 맞추기로 수업 내용을 학생들과 함께 점검해 보세요.
            </p>
          </div>
          <button
            type="button"
            className="tt-close-btn"
            onClick={onClose}
            aria-label="형성평가 퀴즈 닫기"
          >
            ✕ 닫기 (ESC)
          </button>
        </header>

        <div className="tt-modal-body">
          {/* Progress Indicator */}
          <div className="tt-quiz-progress-bar">
            <span className="tt-quiz-step-text">
              {showSummary
                ? `최종 결과 요약 (${correctCount} / ${totalQuestions} 정답)`
                : `문항 ${currentIdx + 1} / ${totalQuestions} · 채점 완료 ${checkedCount}/${totalQuestions}`}
            </span>
            <div className="tt-quiz-dots" role="tablist" aria-label="문항 번호 이동">
              {quizzes.map((quiz, idx) => {
                const status = isQuestionCorrect(quiz);
                const isActive = !showSummary && idx === currentIdx;
                let cls = 'tt-quiz-dot';
                if (isActive) cls += ' tt-quiz-dot--active';
                else if (status === true) cls += ' tt-quiz-dot--correct';
                else if (status === false) cls += ' tt-quiz-dot--wrong';
                return (
                  <button
                    key={quiz.id}
                    type="button"
                    className={cls}
                    onClick={() => {
                      setShowSummary(false);
                      setCurrentIdx(idx);
                    }}
                    aria-label={`${idx + 1}번 문항으로 이동`}
                  >
                    {status === true ? '✓' : status === false ? '!' : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {showSummary ? (
            /* Final Score Summary Screen */
            <section className="tt-summary-card" aria-label="형성평가 최종 결과">
              <div className="tt-score-circle">
                <span className="tt-score-big">
                  {correctCount}/{totalQuestions}
                </span>
                <span className="tt-score-sub">{percentage}점</span>
              </div>
              <h3 className="tt-summary-heading">형성평가 결과 요약</h3>
              <p className="tt-summary-message">{getMasteryMessage()}</p>

              <div className="tt-summary-list">
                {quizzes.map((quiz, idx) => {
                  const status = isQuestionCorrect(quiz);
                  let itemCls = 'tt-summary-item';
                  if (status === true) itemCls += ' tt-summary-item--correct';
                  else if (status === false) itemCls += ' tt-summary-item--wrong';
                  return (
                    <button
                      key={quiz.id}
                      type="button"
                      className={itemCls}
                      onClick={() => {
                        setShowSummary(false);
                        setCurrentIdx(idx);
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        {idx + 1}. {quiz.category}
                      </span>
                      <span
                        className={`tt-badge ${
                          status === true
                            ? 'tt-badge--arterial'
                            : status === false
                            ? 'tt-badge--venous'
                            : 'tt-badge--vessel'
                        }`}
                        style={
                          status === true
                            ? { background: '#dcfce7', borderColor: '#15803d', color: '#14532d' }
                            : status === false
                            ? { background: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d' }
                            : undefined
                        }
                      >
                        {status === true ? '정답' : status === false ? '오답 (해설 보기)' : '미응답'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            /* Active Question View */
            <section className="tt-question-card" aria-label={`문항 ${currentIdx + 1}`}>
              <div className="tt-question-meta">
                <span className="tt-question-type-badge">
                  {currentQuiz.type === 'sequence_order'
                    ? '🔀 순환 경로 순서 맞추기'
                    : '☑️ 객관식 문항'}
                </span>
                <span className="tt-badge tt-badge--vessel">{currentQuiz.category}</span>
              </div>

              <h3 className="tt-question-prompt">
                Q{currentIdx + 1}. {currentQuiz.question}
              </h3>

              {currentQuiz.type === 'multiple_choice' ? (
                <div className="tt-options-list">
                  {(currentQuiz.options || []).map((opt, optIdx) => {
                    const isSelected = currentAnswer === opt.id;
                    const isCorrectOpt = opt.id === currentQuiz.correctAnswer;
                    let cls = 'tt-option-btn';
                    if (isCurrentChecked) {
                      if (isCorrectOpt) cls += ' tt-option-btn--correct';
                      else if (isSelected) cls += ' tt-option-btn--wrong';
                    } else if (isSelected) {
                      cls += ' tt-option-btn--selected';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={cls}
                        disabled={isCurrentChecked}
                        onClick={() => handleSelectChoice(opt.id)}
                      >
                        <span className="tt-option-index">{optIdx + 1}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Sequence Ordering Interactive UI */
                <div className="tt-seq-area">
                  <p className="tt-seq-instruction">
                    아래 보기 카드를 혈액이 흐르는 순서대로 클릭해 빈 칸({expectedSequenceLen}단계)을
                    채우세요. 배치된 카드는 ◀/▶ 버튼으로 순서를 바꾸거나 ×로 뺄 수 있습니다.
                  </p>

                  {/* Ordered Slots Area */}
                  <div className="tt-seq-slots-box">
                    <div className="tt-seq-slots-header">
                      <span>
                        내가 만든 순환 순서 ({selectedSequence.length} / {expectedSequenceLen})
                      </span>
                      {!isCurrentChecked && selectedSequence.length > 0 && (
                        <button
                          type="button"
                          className="tt-seq-mini-btn"
                          onClick={handleClearSequence}
                        >
                          순서 비우기
                        </button>
                      )}
                    </div>

                    <div className="tt-seq-slots-list">
                      {selectedSequence.length === 0 ? (
                        <div className="tt-seq-slot-empty">
                          여기에 선택한 구조가 1단계부터 순서대로 표시됩니다.
                        </div>
                      ) : (
                        selectedSequence.map((id, idx) => {
                          const expectedId = (currentQuiz.correctSequence || [])[idx];
                          let itemCls = 'tt-seq-placed-item';
                          if (isCurrentChecked) {
                            itemCls +=
                              id === expectedId
                                ? ' tt-seq-placed-item--correct'
                                : ' tt-seq-placed-item--wrong';
                          }
                          return (
                            <React.Fragment key={id}>
                              {idx > 0 && <span className="tt-seq-arrow">→</span>}
                              <div className={itemCls}>
                                <span className="tt-seq-step-num">{idx + 1}</span>
                                <span>{getOptionLabel(currentQuiz, id)}</span>
                                {!isCurrentChecked && (
                                  <>
                                    <button
                                      type="button"
                                      className="tt-seq-mini-btn"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveSequenceItem(idx, -1)}
                                      aria-label={`${getOptionLabel(currentQuiz, id)} 앞으로 이동`}
                                    >
                                      ◀
                                    </button>
                                    <button
                                      type="button"
                                      className="tt-seq-mini-btn"
                                      disabled={idx === selectedSequence.length - 1}
                                      onClick={() => handleMoveSequenceItem(idx, 1)}
                                      aria-label={`${getOptionLabel(currentQuiz, id)} 뒤로 이동`}
                                    >
                                      ▶
                                    </button>
                                    <button
                                      type="button"
                                      className="tt-seq-mini-btn"
                                      onClick={() => handleRemoveSequenceItem(id)}
                                      aria-label={`${getOptionLabel(currentQuiz, id)} 제거`}
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}
                              </div>
                            </React.Fragment>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Option Bank */}
                  <div className="tt-seq-bank" aria-label="순서 선택 보기 카드">
                    {(currentQuiz.options || []).map((opt) => {
                      const alreadyPlaced = selectedSequence.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className="tt-seq-chip"
                          disabled={alreadyPlaced || isCurrentChecked}
                          onClick={() => handleAddSequenceItem(opt.id)}
                        >
                          + {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Row for Current Question */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {!isCurrentChecked ? (
                  <button
                    type="button"
                    className="tt-btn tt-btn--primary"
                    disabled={!canCheckCurrent()}
                    onClick={handleCheckAnswer}
                  >
                    정답 확인
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tt-btn tt-btn--secondary"
                    onClick={handleRetryQuestion}
                  >
                    이 문항 다시 풀기
                  </button>
                )}
              </div>

              {/* Instant Explanation Feedback */}
              {isCurrentChecked && (
                <div
                  className={`tt-feedback-box ${
                    currentCorrectState ? 'tt-feedback-box--correct' : 'tt-feedback-box--wrong'
                  }`}
                  role="status"
                >
                  <p className="tt-feedback-title">
                    {currentCorrectState ? '🎉 정답입니다!' : '💡 아쉬워요! 다시 확인해 볼까요?'}
                  </p>
                  {!currentCorrectState && (
                    <p className="tt-feedback-answer">
                      정답:{' '}
                      {currentQuiz.type === 'sequence_order'
                        ? (currentQuiz.correctSequence || [])
                            .map((id) => getOptionLabel(currentQuiz, id))
                            .join(' → ')
                        : getOptionLabel(currentQuiz, currentQuiz.correctAnswer)}
                    </p>
                  )}
                  <p className="tt-feedback-explanation">{currentQuiz.explanation}</p>
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="tt-modal-footer">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="tt-btn tt-btn--secondary" onClick={handleResetAll}>
              ↺ 전체 다시 풀기
            </button>
            {!showSummary && (
              <button
                type="button"
                className="tt-btn tt-btn--accent"
                onClick={() => setShowSummary(true)}
              >
                📊 결과 화면 보기 ({checkedCount}/{totalQuestions})
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {showSummary ? (
              <button
                type="button"
                className="tt-btn tt-btn--primary"
                onClick={() => {
                  setShowSummary(false);
                  setCurrentIdx(0);
                }}
              >
                문항으로 돌아가기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="tt-btn tt-btn--secondary"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                >
                  ◀ 이전 문항
                </button>
                {currentIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    className="tt-btn tt-btn--primary"
                    onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  >
                    다음 문항 ▶
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tt-btn tt-btn--success"
                    onClick={() => setShowSummary(true)}
                  >
                    최종 결과 보기 ✓
                  </button>
                )}
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FormativeQuizModal;
