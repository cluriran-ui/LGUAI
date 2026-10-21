@AGENTS.md

# 화면 구현 하네스 — 오케스트레이터 규칙

## 역할
- 메인 대화는 오케스트레이터 역할만 함
  - 앱 코드·규칙 파일·명세를 직접 쓰지 않음
  - 에이전트를 부르고, 게이트 스크립트를 실행하고, 결과를 보고함
- 직접 편집 가능한 파일: `harness/state.json` 1개뿐

## 부르는 말
| 말 | 동작 |
|---|---|
| 화면 만들어줘 | 1단계부터 시작. `harness/state.json`이 있으면 처음부터/이어서 중 질문 |
| 이어서 해줘 | `state.json`의 다음 단계부터 진행 |
| N단계부터 다시 | N단계와 그 뒤 단계 재실행 |
| 검증만 해줘 | 5단계(G4 ~ G9)만 실행 |
| 승인 / 반려: {이유} | 사람 승인 지점의 답 |

## 파이프라인
| # | 단계 | 실행 주체 | 출력 | 게이트 | 실패 시 |
|---|---|---|---|---|---|
| 1 | PRD 읽기 | `rules-reader` 에이전트 | `harness/out/01-rules.json` | G1 | 1단계 |
| 2 | 페이지 나누기 | `screen-spec` 에이전트 (결과 파일 있으면 건너뜀) | `docs/screen-spec.md` | G2 | 2단계 |
| 3 | 토큰 적용 | `node harness/scripts/build-tokens.mjs` | `app/tokens.css` | G3 | 3단계 |
| 4 | 화면 구현 | `screen-builder` 에이전트 × 화면 4번 | `app/` 라우트 4개 | G4 · G5 (화면마다) | 4단계 |
| 5 | 검증 | `verifier` 에이전트 → `node harness/scripts/verify.mjs` | `harness/out/05-verify.json` | G4 ~ G9 | 표의 실패 지점 |
| 5+ | 기획 주석 | 사람이 `/planner-comments app` 실행 | `[기획]` 주석 | G6 재실행 | 4단계 |
| 6 | 사람 승인 | 스크린샷 4장 + Figma 시안 대조 | 승인/반려 | — | 지적 단계 (없으면 4단계) |

- 4단계 호출 시 `[화면]`으로 화면 이름·라우트 1개를 넘김. 첫 호출에는 "공통 부품 포함"을 함께 넘김
- 5+ 단계: planner-comments 스킬은 사람만 실행 가능함. 오케스트레이터는 실행을 안내하고 끝나면 G6만 다시 돌림
- 6단계 스크린샷: Claude Browser 미리보기(`.claude/launch.json`)로 4개 라우트를 찍어 Figma 시안과 나란히 보여줌

## 게이트 (모두 `node harness/scripts/gate.mjs G{n}` 으로 실행)
| 게이트 | 통과 조건 | 막는 것 |
|---|---|---|
| G1 | 화면 수 = PRD 화면 표 줄 수, 규칙 7개, A·B 존재 | 규칙 누락 |
| G2 | screen-spec 4화면 × 4칸 = 16칸 | 명세 빈칸 |
| G3 | tokens.json 재변환 결과와 tokens.css 차이 0줄 | 토큰 손편집·불일치 |
| G4 | 규칙 파일 라우트 = `app/**/page.tsx` 라우트 (`/` 제외) | 화면 누락·추가 |
| G5 | 색 직접 입력·Tailwind 임의값 `[...]`·style 숫자 0건 (훅 + 스크립트) | 토큰 밖 값 |
| G6 | `npm run build`·`npm run lint` 종료 코드 0 | 깨진 코드 |
| G7 ★ | 금액 ≤ 2개/카드·상세, 할인 후 금액 p03만, 취소선 0, p03·p04 속도 문구 각 1개 | 가격·"무제한" 혼동 |
| G8 | 카드 4, 추천 Tag 1, 빈 입력 시 신청 비활성, 완료 값 = 신청 값 | PRD 규칙 1·2·6·7 위반 |
| G9 | 이메일 모양 0, 전화번호 모양(숫자 10 ~ 11자리) 0 | 개인정보 노출 |

- G7·G8의 서비스 값(요금제 id·문구 패턴)은 스크립트가 아니라 `harness/out/01-rules.json`에서 읽음

## 진행 규칙
- 단계 통과마다 커밋 1개: `[하네스] N단계 {단계명} 통과` + `state.json`에 단계·커밋 해시 기록
- push는 사람이 "push"라고 할 때만 수행
- 4단계 자동 재시도는 최대 3번. 넘으면 실패 게이트·위반 위치(파일:줄)를 보고하고 멈춤
- 게이트 통과는 `05-verify.json` 또는 스크립트 종료 코드로만 인정. 실행하지 않은 게이트는 "확인 못 함"으로 보고

`harness/state.json` 형식:

```json
{
  "last_passed_step": 0,
  "steps": { "1": { "status": "pass", "commit": "(해시)", "at": "(ISO 시각)" } },
  "retries": { "G7": 0 },
  "waiting_for": null
}
```

## 지킬 것
- 원본 보호: `docs/`·`reference/`는 읽기만 함 (예외: `screen-spec` 에이전트의 `docs/screen-spec.md`)
- 단일 출처: 디자인 값은 `docs/tokens.json`만 사용. 없는 값이 필요하면 멈추고 질문
- 자료 우선순위: PRD.md > screens.md > Figma 화면 링크 > flow.png (Make 링크는 사용 안 함)
- PRD의 "확인 필요" 항목은 임의로 정하지 않고 빈칸·가는 곳 없음 + `확인 필요` 주석으로 남김
- 하네스 안에 서비스 값(요금제 이름, id 등)을 직접 적지 않음. 서비스 값은 `01-rules.json`에서만 읽음
- 응답·보고에 고객 개인정보를 넣지 않음
- 에이전트 호출 시 `model` 파라미터 생략
