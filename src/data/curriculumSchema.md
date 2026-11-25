# Curriculum Data Schema (`curriculumData.json`)

대한민국 중학교 2학년 과학 `[9과11-02] 혈액의 순환 경로와 기능` 인터랙티브 웹 시뮬레이션을 위한 표준 JSON 데이터 스키마 명세서입니다.

---

## 1. Top-Level Structure

```json
{
  "meta": { ... },
  "nodes": { "<canonicalNodeId>": { ... } },
  "misconceptions": { ... },
  "microViews": {
    "pulmonary_capillaries": { ... },
    "systemic_capillaries": { ... }
  },
  "quizzes": [ ... ]
}
```

---

## 2. `meta` (교육과정 메타데이터 및 순환 순서)

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | 시뮬레이션 상단 타이틀 |
| `unit` | `string` | 단원명 (`동물과 에너지 - 혈액의 순환`) |
| `achievementStandard` | `string` | 교육과정 성취기준 (`"[9과11-02]"`) |
| `achievementDescription` | `string` | 성취기준 상세 설명 |
| `gradeLevel` | `string` | 대상 학년 (`"중학교 2학년"`) |
| `colors` | `object` | 표준 색상 팔레트 (`arterial: "#E63946"`, `venous: "#457B9D"`, `exchange: "#7B5EA7"`, `valve: "#F4A261"`) |
| `stepOrder` | `string[]` | 전체 순환 경로의 표준 14개 노드 순서 (`right_ventricle` → ... → `tricuspid_valve`) |
| `loops` | `object` | `pulmonary` / `systemic` 순환별 요약 및 핵심 단계 ID 목록 |

### Canonical Node IDs (14개 고정 ID)
* **Chambers (4):** `right_atrium`, `right_ventricle`, `left_atrium`, `left_ventricle`
* **Valves (4):** `tricuspid_valve`, `pulmonary_valve`, `bicuspid_valve`, `aortic_valve`
* **Pulmonary Vessels (3):** `pulmonary_artery`, `pulmonary_capillaries`, `pulmonary_vein`
* **Systemic Vessels (3):** `aorta`, `systemic_capillaries`, `vena_cava`

---

## 3. `nodes` (14개 해부학적 노드 사전)

`nodes`는 위 14개 Canonical ID를 Key로 가지는 객체(Map)입니다.

| Field | Type | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Canonical Node ID | 노드 고유 식별자 (SVG `<g id="...">`와 일치) |
| `nameKo` | `string` | Korean label | 학생·교사용 한국어 명칭 (`Blind Mode` 마스킹 대상) |
| `nameEn` | `string` | English label | 영문 해부학 명칭 |
| `category` | `string` | `"chamber" \| "valve" \| "artery" \| "vein" \| "capillary"` | 해부학적 구조 분류 |
| `loop` | `string` | `"heart" \| "pulmonary" \| "systemic"` | 소속 순환/부위 구분 |
| `circulationTags` | `string[]` | `["pulmonary"] \| ["systemic"] \| ["pulmonary", "systemic"]` | 집중 모드(Focus Mode) 필터링용 순환 소속 태그 |
| `bloodType` | `string` | `"arterial" \| "venous" \| "gas_exchange" \| "material_exchange" \| "valve"` | 혈액 상태 및 기능 구분 (`gas_exchange`·`material_exchange`는 모세혈관 교환 구간) |
| `passingBloodType` | `string?` | `"arterial" \| "venous"` | (`bloodType === "valve"`인 판막에만 존재) 해당 판막을 통과하는 혈액의 종류 |
| `bloodTypeLabel` | `string` | Korean badge string | UI 배지 표시용 텍스트 (예: `"동맥혈"`, `"정맥혈"`, `"기체 교환 (정맥혈 → 동맥혈)"`) |
| `color` | `string` | Hex color (`"#E63946"`, `"#457B9D"`, `"#7B5EA7"`) | 대표 표시 색상 |
| `gradient` | `string[]?` | `[fromHex, toHex]` | 모세혈관 구간 전용 색상 전환 그라데이션 |
| `oxygenSaturation` | `string` | `"98%" \| "75%" \| "75% → 98%" \| "98% → 75%"` | 산소 포화도 수치 또는 변화 |
| `directionText` | `string` | Arrow sequence string | 혈액 이동 방향 요약 |
| `wallThicknessNote` | `string` | Korean string | 혈관벽/심장 근육벽 두께 및 압력 특징 (`left_ventricle`은 최두께 근육벽 명시) |
| `studentSummary` | `string` | Korean string | 학생 눈높이 핵심 요약 |
| `teacherExplanation` | `string` | Korean string | 교사용 심화 해설 텍스트 |
| `exchangePrinciple` | `string` | Korean string | 물질·기체 교환 또는 수송·역류 방지 원리 |
| `classroomTip` | `string` | Korean question string | 수업 중 학생에게 던질 수 있는 발문 팁 |
| `galleryIllustrationId` | `string` | `"heart_cross_section" \| "alveolus_gas_exchange" \| "tissue_material_exchange" \| "vessel_comparison" \| "rbc_oxygen" \| "circulation_overview"` | `AnatomicalGallerySVG`의 6종 확대 모식도 매핑 ID |

---

## 4. `misconceptions` (핵심 오개념 비교 모달 데이터)

`MisconceptionModal.jsx`에서 사용하는 구조화 데이터입니다.

* `title`, `subtitle`, `coreRule`: 상단 핵심 규칙 요약 (`혈관 이름 = 이동 방향`, `혈액 종류 = 산소 함량`)
* `comparisons`: 2개의 대조 카드
  1. `artery_vs_arterial_blood` (**동맥 vs 동맥혈**)
  2. `vein_vs_venous_blood` (**정맥 vs 정맥혈**)
  * 각 비교 객체는 `conceptA`, `conceptB` (`name`, `category`, `criterion`, `definition`, `features[]`, `badgeColor`), `keyDifference`, `commonTrap`을 포함합니다.
* `spotlightException`: **폐동맥(정맥혈)** vs **폐정맥(동맥혈)** 집중 비교 블록 (`title`, `analogy`, `items[]` with `nodeId`, `vesselName`, `vesselType`, `bloodType`, `color`, `oxygenSaturation`, `reason`).
* `quickCheckTable`: 4대 혈관(`대동맥`, `폐동맥`, `대정맥`, `폐정맥`) 일람표 (`vessel`, `direction`, `bloodType`, `oxygen`, `color`, `isException`).

---

## 5. `microViews` (모세혈관 미시 확대 뷰 데이터)

`MicroViewModal.jsx` 및 `MicroViewCanvas.jsx`에서 `pulmonary_capillaries` 또는 `systemic_capillaries`를 Key로 조회합니다.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | `"pulmonary_capillaries"` 또는 `"systemic_capillaries"` |
| `title` | `string` | 모달 탭 및 제목 |
| `subtitle` | `string` | 부제목 |
| `diffusionPrinciple` | `string` | 농도 차이에 의한 확산 원리 설명 |
| `bloodTransition` | `object` | `from`, `fromLabel`, `fromColor`, `to`, `toLabel`, `toColor`, `oxygenSaturationChange` |
| `exchanges` | `array` | 이동 물질별 상세 목록 (`substance`, `from`, `to`, `mechanism`, `direction`, `color`, `description`) |
| `structures` | `array` | 해부학적 구조물 안내 (`name`, `role`) |
| `classroomQuestion` | `string` | 미시 뷰 수업 발문 |

---

## 6. `quizzes` (형성평가 미니 퀴즈 5문항)

`FormativeQuizModal.jsx`에서 사용하는 5개 문항 배열입니다.

### 문항 유형 (`type`)
1. `"multiple_choice"` (객관식 4지선다 — `quiz_1`, `quiz_3`, `quiz_4`):
   * `options`: `Array<{ id: string, label: string }>`
   * `correctAnswer`: `string` (`options` 내 정답 항목의 `id`)
2. `"sequence_order"` (순환 경로 순서 맞추기 — `quiz_2`, `quiz_5`):
   * `options`: `Array<{ id: string, label: string }>` (UI에서 클릭하여 순서대로 배치할 후보 항목 목록, 미리 섞여 있음)
   * `correctSequence`: `string[]` (올바른 혈액 이동 순서대로 나열된 `id` 배열)

### 공통 필드
* `id`: `"quiz_1"` ~ `"quiz_5"`
* `number`: `1` ~ `5`
* `type`: `"multiple_choice" | "sequence_order"`
* `category`: 문항 영역명 (`"오개념 점검"`, `"폐순환 경로"`, `"심장의 구조"`, `"모세혈관 물질 교환"`, `"체순환 경로"`)
* `question`: 문제 텍스트
* `explanation`: 정답 제출 후 표시할 상세 생물학적 해설
