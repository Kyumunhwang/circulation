import React, { useEffect, useState } from 'react';
import curriculumData from '../data/curriculumData.json';
import '../styles/teacherTools.css';

const FALLBACK_MISCONCEPTIONS = {
  title: '동맥 vs 동맥혈 · 정맥 vs 정맥혈 한눈에 비교하기',
  subtitle: "학생들이 가장 많이 헷갈리는 '동맥 ≠ 동맥혈', '정맥 ≠ 정맥혈' 구분 원리",
  coreRule:
    "혈관의 이름(동맥/정맥)은 '심장 기준 혈액 이동 방향'으로 정하고, 혈액의 종류(동맥혈/정맥혈)는 '산소 함량'으로 구분합니다.",
  comparisons: [
    {
      id: 'artery_vs_arterial_blood',
      title: '동맥 vs 동맥혈',
      conceptA: {
        name: '동맥 (Artery)',
        category: '혈관의 종류',
        criterion: '혈액의 이동 방향 (심장 → 밖)',
        definition: '심실의 수축으로 심장에서 몸 밖(폐 또는 온몸)으로 나가는 혈액이 흐르는 혈관',
        features: [
          '높은 혈압을 견디기 위해 혈관벽이 두껍고 탄력성이 큼',
          '판막이 혈관 내부에 존재하지 않음 (심장 출구에만 반월판 존재)',
          '종류: 대동맥, 폐동맥',
        ],
        badgeColor: '#1D3557',
      },
      conceptB: {
        name: '동맥혈 (Arterial Blood)',
        category: '혈액의 상태',
        criterion: '산소(O₂) 함량 (높음)',
        definition: '폐에서 산소를 충분히 받아 산소 포화도가 높고 이산화탄소가 적은 혈액',
        features: [
          '산소와 결합한 헤모글로빈 때문에 밝은 선홍색을 띰',
          '산소 포화도 약 95~98%',
          '흐르는 곳: 폐정맥, 좌심방, 좌심실, 대동맥',
        ],
        badgeColor: '#E63946',
      },
      keyDifference:
        "동맥은 '도로(심장에서 나가는 길)', 동맥혈은 '실려 있는 화물(산소가 가득한 혈액)'입니다.",
      commonTrap:
        "폐동맥은 심장(우심실)에서 나가므로 '동맥'이지만, 폐에서 산소를 받기 전이므로 '정맥혈'이 흐릅니다.",
    },
    {
      id: 'vein_vs_venous_blood',
      title: '정맥 vs 정맥혈',
      conceptA: {
        name: '정맥 (Vein)',
        category: '혈관의 종류',
        criterion: '혈액의 이동 방향 (밖 → 심장)',
        definition: '온몸이나 폐를 거쳐 다시 심방으로 들어오는 혈액이 흐르는 혈관',
        features: [
          '혈압이 낮아 혈관벽이 동맥보다 얇고 탄력이 작음',
          '혈액 역류를 막기 위해 군데군데 판막이 있음',
          '종류: 대정맥, 폐정맥',
        ],
        badgeColor: '#2A6F97',
      },
      conceptB: {
        name: '정맥혈 (Venous Blood)',
        category: '혈액의 상태',
        criterion: '산소(O₂) 함량 (낮음)',
        definition: '조직세포에 산소를 전달하여 산소가 적고 이산화탄소 함량이 상대적으로 높은 혈액',
        features: [
          '산소가 적은 헤모글로빈 때문에 어두운 암적색(푸른빛 강조)을 띰',
          '산소 포화도 약 70~75%',
          '흐르는 곳: 대정맥, 우심방, 우심실, 폐동맥',
        ],
        badgeColor: '#457B9D',
      },
      keyDifference:
        "정맥은 '심장으로 돌아오는 도로', 정맥혈은 '산소를 다 쓰고 남은 혈액'입니다.",
      commonTrap:
        "폐정맥은 심장(좌심방)으로 들어오므로 '정맥'이지만, 폐에서 막 산소를 받아온 직후이므로 '동맥혈'이 흐릅니다.",
    },
  ],
  spotlightException: {
    title: '최고 빈출 주의 구간: 폐동맥(정맥혈) vs 폐정맥(동맥혈)',
    analogy:
      "비유: '공항행 고속도로(혈관 이름)'를 탄다고 해서 무조건 '비행기 화물(혈액 종류)'이 실려 있는 것은 아닙니다. 출발 전 빈 트럭(정맥혈)이 폐(공장)로 갈 수도, 폐에서 물건을 싣고 돌아오는 트럭(동맥혈)이 심장으로 들어올 수도 있습니다.",
    items: [
      {
        nodeId: 'pulmonary_artery',
        vesselName: '폐동맥',
        vesselType: '동맥 (우심실 → 폐)',
        bloodType: '정맥혈 (산소 적음)',
        color: '#457B9D',
        oxygenSaturation: '75%',
        reason:
          "우심실에서 나가는 혈관이라 '폐동맥'이지만, 아직 폐포에서 산소를 공급받기 전이므로 정맥혈이 흐릅니다.",
      },
      {
        nodeId: 'pulmonary_vein',
        vesselName: '폐정맥',
        vesselType: '정맥 (폐 → 좌심방)',
        bloodType: '동맥혈 (산소 풍부)',
        color: '#E63946',
        oxygenSaturation: '98%',
        reason:
          "좌심방으로 들어오는 혈관이라 '폐정맥'이지만, 폐의 모세혈관에서 산소를 가득 흡수한 직후이므로 동맥혈이 흐릅니다.",
      },
    ],
  },
  quickCheckTable: [
    {
      vessel: '대동맥',
      direction: '좌심실 → 온몸 (나감)',
      bloodType: '동맥혈',
      oxygen: '많음 (98%)',
      color: '#E63946',
      isException: false,
    },
    {
      vessel: '폐동맥',
      direction: '우심실 → 폐 (나감)',
      bloodType: '정맥혈',
      oxygen: '적음 (75%)',
      color: '#457B9D',
      isException: true,
    },
    {
      vessel: '대정맥',
      direction: '온몸 → 우심방 (들어옴)',
      bloodType: '정맥혈',
      oxygen: '적음 (75%)',
      color: '#457B9D',
      isException: false,
    },
    {
      vessel: '폐정맥',
      direction: '폐 → 좌심방 (들어옴)',
      bloodType: '동맥혈',
      oxygen: '많음 (98%)',
      color: '#E63946',
      isException: true,
    },
  ],
};

function VesselDiagram({ type }) {
  const isArtery = type === 'artery';
  return (
    <svg
      width="100%"
      height="74"
      viewBox="0 0 240 74"
      role="img"
      aria-label={isArtery ? '동맥 단면 및 흐름 모식도' : '정맥 단면 및 판막 모식도'}
    >
      <rect
        x="10"
        y="6"
        width="220"
        height="44"
        rx="10"
        fill={isArtery ? '#FCA5A5' : '#CBD5E1'}
        stroke={isArtery ? '#B91C1C' : '#475569'}
        strokeWidth="2"
      />
      <rect
        x="10"
        y={isArtery ? 17 : 12}
        width="220"
        height={isArtery ? 22 : 32}
        fill="#FFFFFF"
      />
      {!isArtery && (
        <g stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 92 12 Q 108 23 116 26" />
          <path d="M 92 44 Q 108 33 116 30" />
          <path d="M 164 12 Q 180 23 188 26" />
          <path d="M 164 44 Q 180 33 188 30" />
        </g>
      )}
      <line
        x1="36"
        y1="28"
        x2="196"
        y2="28"
        stroke={isArtery ? '#DC2626' : '#2563EB'}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <polygon
        points="206,28 192,20 192,36"
        fill={isArtery ? '#DC2626' : '#2563EB'}
      />
      <text x="120" y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#334155">
        {isArtery ? '두꺼운 탄력 벽 · 심장 → 밖' : '얇은 벽 · 판막 존재 · 밖 → 심장'}
      </text>
    </svg>
  );
}

function BloodOxygenDiagram({ type }) {
  const isArterial = type === 'arterial';
  const rbcFill = isArterial ? '#E63946' : '#457B9D';
  const rbcStroke = isArterial ? '#991B1B' : '#1E3A8A';
  const o2Positions = isArterial
    ? [
        [45, 19],
        [62, 37],
        [108, 21],
        [126, 37],
        [172, 19],
        [190, 37],
      ]
    : [
        [54, 27],
        [180, 29],
      ];

  return (
    <svg
      width="100%"
      height="74"
      viewBox="0 0 240 74"
      role="img"
      aria-label={isArterial ? '동맥혈 적혈구 산소 모식도' : '정맥혈 적혈구 산소 모식도'}
    >
      <rect
        x="10"
        y="6"
        width="220"
        height="44"
        rx="22"
        fill={isArterial ? '#FEF2F2' : '#EFF6FF'}
        stroke={rbcStroke}
        strokeWidth="1.5"
      />
      {[54, 118, 182].map((cx) => (
        <ellipse
          key={cx}
          cx={cx}
          cy="28"
          rx="18"
          ry="11.5"
          fill={rbcFill}
          stroke={rbcStroke}
          strokeWidth="2"
        />
      ))}
      {o2Positions.map(([x, y], idx) => (
        <g key={idx}>
          <circle cx={x} cy={y} r="6.5" fill="#FACC15" stroke="#854D0E" strokeWidth="1.2" />
          <text x={x} y={y + 3} textAnchor="middle" fontSize="7" fontWeight="900" fill="#422006">
            O₂
          </text>
        </g>
      ))}
      <text x="120" y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#334155">
        {isArterial ? '산소 풍부 (~98%) · 선홍색' : '산소 적음 (~75%) · 암적색'}
      </text>
    </svg>
  );
}

/**
 * Classroom modal clarifying vessel naming (artery/vein by direction & structure)
 * versus blood oxygenation (arterial blood #E63946 / venous blood #457B9D),
 * with a spotlight comparison on pulmonary artery vs pulmonary vein.
 */
export function MisconceptionModal({ isOpen = true, onClose, misconceptionsData }) {
  const [focusView, setFocusView] = useState('all'); // 'all' | 'pulmonary_exception'

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

  const data = misconceptionsData || curriculumData?.misconceptions || FALLBACK_MISCONCEPTIONS;
  const comparisons = data.comparisons || FALLBACK_MISCONCEPTIONS.comparisons;
  const spotlight = data.spotlightException || FALLBACK_MISCONCEPTIONS.spotlightException;
  const quickCheckTable = data.quickCheckTable || FALLBACK_MISCONCEPTIONS.quickCheckTable;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div
      className="tt-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tt-misconception-title"
    >
      <div className="tt-modal">
        <header className="tt-modal-header">
          <div className="tt-modal-title-group">
            <span className="tt-modal-kicker">중2 과학 [9과11-02] 핵심 오개념 비교 팝업</span>
            <h2 id="tt-misconception-title" className="tt-modal-title">
              {data.title || FALLBACK_MISCONCEPTIONS.title}
            </h2>
            <p className="tt-modal-subtitle">
              {data.subtitle || FALLBACK_MISCONCEPTIONS.subtitle}
            </p>
          </div>
          <button
            type="button"
            className="tt-close-btn"
            onClick={onClose}
            aria-label="오개념 비교 팝업 닫기"
          >
            ✕ 닫기 (ESC)
          </button>
        </header>

        <div className="tt-modal-body">
          {/* Core Principle Banner */}
          <div className="tt-rule-banner">
            <div className="tt-rule-banner-text">
              💡 <strong>핵심 구분 원칙:</strong> {data.coreRule || FALLBACK_MISCONCEPTIONS.coreRule}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`tt-btn ${focusView === 'all' ? 'tt-btn--primary' : 'tt-btn--secondary'}`}
                onClick={() => setFocusView('all')}
              >
                전체 비교 보기
              </button>
              <button
                type="button"
                className={`tt-btn ${
                  focusView === 'pulmonary_exception' ? 'tt-btn--accent' : 'tt-btn--secondary'
                }`}
                onClick={() => setFocusView('pulmonary_exception')}
              >
                🔥 폐동맥·폐정맥 집중 보기
              </button>
            </div>
          </div>

          {focusView === 'all' && (
            <>
              {/* 2-Column Visual Comparison Cards */}
              <section aria-label="동맥과 동맥혈, 정맥과 정맥혈 시각 비교">
                <h3 className="tt-section-heading">1. 혈관 종류(구조/흐름 방향) vs 혈액 종류(산소량)</h3>
                <div className="tt-compare-grid">
                  {comparisons.map((comp) => {
                    const isArteryCard = comp.id === 'artery_vs_arterial_blood';
                    const vesselKey = isArteryCard ? 'artery' : 'vein';
                    const bloodKey = isArteryCard ? 'arterial' : 'venous';
                    return (
                      <article
                        key={comp.id}
                        className={`tt-compare-card ${
                          isArteryCard ? 'tt-compare-card--arterial' : 'tt-compare-card--venous'
                        }`}
                      >
                        <div className="tt-compare-card-header">
                          <h4 className="tt-compare-card-title">{comp.title}</h4>
                          <span className="tt-badge tt-badge--warning">
                            {isArteryCard ? '길(방향) ≠ 화물(산소)' : '판막 유무 ≠ 산소량'}
                          </span>
                        </div>

                        <div className="tt-compare-subgrid">
                          {/* Concept A: Vessel Type */}
                          <div className="tt-subbox">
                            <span className="tt-subbox-label">{comp.conceptA.category}</span>
                            <div className="tt-subbox-name">
                              <span className="tt-badge tt-badge--vessel">{comp.conceptA.name}</span>
                            </div>
                            <ul className="tt-subbox-list">
                              <li>
                                <strong>기준:</strong> {comp.conceptA.criterion}
                              </li>
                              {comp.conceptA.features.map((feat, idx) => (
                                <li key={idx}>{feat}</li>
                              ))}
                            </ul>
                            <div className="tt-diagram-strip">
                              <VesselDiagram type={vesselKey} />
                            </div>
                          </div>

                          {/* Concept B: Blood Type */}
                          <div
                            className={`tt-subbox ${
                              isArteryCard ? 'tt-subbox--arterial' : 'tt-subbox--venous'
                            }`}
                          >
                            <span className="tt-subbox-label">{comp.conceptB.category}</span>
                            <div className="tt-subbox-name">
                              <span
                                className={`tt-badge ${
                                  isArteryCard ? 'tt-badge--arterial' : 'tt-badge--venous'
                                }`}
                              >
                                <span
                                  className={`tt-dot ${
                                    isArteryCard ? 'tt-dot--arterial' : 'tt-dot--venous'
                                  }`}
                                />
                                {comp.conceptB.name}
                              </span>
                            </div>
                            <ul className="tt-subbox-list">
                              <li>
                                <strong>기준:</strong> {comp.conceptB.criterion}
                              </li>
                              {comp.conceptB.features.map((feat, idx) => (
                                <li key={idx}>{feat}</li>
                              ))}
                            </ul>
                            <div className="tt-diagram-strip">
                              <BloodOxygenDiagram type={bloodKey} />
                            </div>
                          </div>
                        </div>

                        <p className="tt-spotlight-desc" style={{ marginTop: '2px' }}>
                          <strong>핵심 차이:</strong> {comp.keyDifference}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* 4 Major Vessels Summary Table */}
              <section aria-label="주요 4대 혈관 비교표">
                <h3 className="tt-section-heading">2. 주요 4대 혈관의 이름과 실제 혈액 비교표</h3>
                <div className="tt-table-wrap">
                  <table className="tt-table">
                    <thead>
                      <tr>
                        <th style={{ width: '18%' }}>혈관 이름</th>
                        <th style={{ width: '32%' }}>흐름 방향 (혈관 이름 기준)</th>
                        <th style={{ width: '24%' }}>흐르는 혈액 (산소량 기준)</th>
                        <th style={{ width: '26%' }}>산소 포화도 / 주의</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickCheckTable.map((row) => {
                        const isArterial = row.color === '#E63946';
                        return (
                          <tr key={row.vessel}>
                            <td>
                              <strong>{row.vessel}</strong>
                            </td>
                            <td>{row.direction}</td>
                            <td>
                              <span
                                className={`tt-badge ${
                                  isArterial ? 'tt-badge--arterial' : 'tt-badge--venous'
                                }`}
                              >
                                <span
                                  className={`tt-dot ${
                                    isArterial ? 'tt-dot--arterial' : 'tt-dot--venous'
                                  }`}
                                />
                                {row.bloodType}
                              </span>
                            </td>
                            <td>
                              <span>{row.oxygen}</span>
                              {row.isException && (
                                <span
                                  className="tt-badge tt-badge--warning"
                                  style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 8px' }}
                                >
                                  오개념 주의!
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* #1 Student Misconception Spotlight Box */}
          <section className="tt-spotlight" aria-label="최다 오개념 집중 비교: 폐동맥과 폐정맥">
            <div className="tt-spotlight-header">
              <h3 className="tt-spotlight-title">⚠️ {spotlight.title}</h3>
              <span className="tt-badge tt-badge--warning">
                폐순환에서는 혈관 이름과 혈액 색깔이 반대!
              </span>
            </div>

            <div className="tt-spotlight-cards">
              {(spotlight.items || []).map((item) => {
                const isPulmArtery = item.nodeId === 'pulmonary_artery';
                return (
                  <div
                    key={item.nodeId}
                    className={`tt-spotlight-item ${
                      isPulmArtery
                        ? 'tt-spotlight-item--pulm-artery'
                        : 'tt-spotlight-item--pulm-vein'
                    }`}
                  >
                    <div className="tt-spotlight-item-head">
                      <span className="tt-spotlight-vessel-name">{item.vesselName}</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="tt-badge tt-badge--vessel">
                          혈관: {isPulmArtery ? '동맥' : '정맥'}
                        </span>
                        <span
                          className={`tt-badge ${
                            isPulmArtery ? 'tt-badge--venous' : 'tt-badge--arterial'
                          }`}
                        >
                          <span
                            className={`tt-dot ${
                              isPulmArtery ? 'tt-dot--venous' : 'tt-dot--arterial'
                            }`}
                          />
                          {item.bloodType}
                        </span>
                      </div>
                    </div>

                    <div className="tt-flow-pill-row">
                      <span>{item.vesselType}</span>
                      <span>·</span>
                      <span>산소 포화도 {item.oxygenSaturation}</span>
                    </div>

                    <p className="tt-spotlight-desc">{item.reason}</p>
                  </div>
                );
              })}
            </div>

            <div className="tt-analogy-box">
              <span aria-hidden="true" style={{ fontSize: '22px', lineHeight: 1 }}>
                🚚
              </span>
              <div>{spotlight.analogy}</div>
            </div>
          </section>
        </div>

        <footer className="tt-modal-footer">
          <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
            💡 수업 팁: [동맥혈·정맥혈 하이라이트 모드]를 켜고 폐동맥(정맥혈)과 폐정맥(동맥혈)의 색상을 직접 확인해 보세요.
          </span>
          <button type="button" className="tt-btn tt-btn--primary" onClick={onClose}>
            수업 화면으로 돌아가기
          </button>
        </footer>
      </div>
    </div>
  );
}

export default MisconceptionModal;
