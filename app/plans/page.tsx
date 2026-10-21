// [기획] 요금제 목록 화면: 요금제 4개를 카드로 보여주고, '자세히'를 누르면 요금제 상세로 이동함
// [기획] 관련: PRD 4-1 · screens.md 요금제 목록 · US1 ~ US4 · 들어오는 곳: 진입 · 나가는 곳: 요금제 상세
import type { Metadata } from "next";
import Header from "../_components/Header";
import FilterChip from "../_components/FilterChip";
import CardPlan from "../_components/CardPlan";
import { plans } from "../_data/plans";

export const metadata: Metadata = {
  title: "요금제 | 요금제 추천·구독",
};

// 1. 요금제 목록 (/plans) — PRD 4-1
// 확인 필요: 요금제 목록 기본 정렬 (실습에서는 매달 내는 금액이 낮은 순으로 둠)
// [기획] 카드 순서: 매달 내는 금액이 낮은 요금제부터 보여줌 (PRD 4-1 실습 기준)
const sortedPlans = [...plans].sort((a, b) => a.monthly_price - b.monthly_price);
const SORT_LABEL = "매달 내는 금액 낮은 순";

// 확인 필요: 요금제 필터 칩 항목 (예: 데이터량 구간, 속도 제한 여부)
// 항목이 정해지기 전까지 기본 상태('전체' 선택, 카드 4개 표시)만 둠
const FILTERS = [{ key: "all", label: "전체" }];

// 확인 필요: 추천 대상: p02 (사용자 결정, 추천 기준은 여전히 확인 필요)
// Tag는 app/_data/plans.ts recommended: true인 요금제(p02) 1개에만 붙음

// 확인 필요: 요금제 목록 로딩·빈·에러 상태 (screens.md에 정의되지 않음)

export default function PlansPage() {
  return (
    <>
      {/* [기획] 화면 위쪽 제목줄: 첫 화면이라 뒤로 아이콘 없이 '요금제' 제목과 로고를 보여줌 (screens.md 요금제 목록) */}
      <Header type="root" title="요금제" />
      <main className="flex flex-1 flex-col gap-24 p-24">
        <section className="flex flex-col gap-8">
          <h2 className="text-heading-h3 font-bold text-text-primary">나에게 맞는 요금제를 골라보세요</h2>
          <p className="text-body-small font-medium text-text-secondary">
            중요하게 보는 조건을 고르면 추천해 드려요
          </p>
        </section>

        {/* [기획] 조건 고르기 칩: 지금은 '전체' 1개만 있고, 카드 4개가 모두 보임 (PRD 4-1 · US2) */}
        <div role="group" aria-label="요금제 조건" className="flex gap-8 overflow-x-auto">
          {FILTERS.map((f) => (
            <FilterChip key={f.key} label={f.label} selected={f.key === "all"} />
          ))}
        </div>

        <section aria-labelledby="plan-list-summary" className="flex flex-col gap-16">
          {/* [기획][확인 필요] screens.md는 "추천순 · 4개"인데, 화면은 "매달 내는 금액 낮은 순 · 4개"로 보여줌 */}
          <p id="plan-list-summary" className="text-body-small font-medium text-text-secondary">
            {SORT_LABEL} · {sortedPlans.length}개
          </p>
          {/* [기획] 요금제 카드: 이름·기본 데이터·소진 후 속도·매달 내는 금액을 한 장에 보여줌. 추천 표시는 p02에만 (PRD 4-1 · US1·US3·US4) */}
          <ul className="flex flex-col gap-16">
            {sortedPlans.map((plan) => (
              <li key={plan.id}>
                <CardPlan plan={plan} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
