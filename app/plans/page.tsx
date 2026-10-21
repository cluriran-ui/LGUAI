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
      <Header type="root" title="요금제" />
      <main className="flex flex-1 flex-col gap-24 p-24">
        <section className="flex flex-col gap-8">
          <h2 className="text-heading-h3 font-bold text-text-primary">나에게 맞는 요금제를 골라보세요</h2>
          <p className="text-body-small font-medium text-text-secondary">
            중요하게 보는 조건을 고르면 추천해 드려요
          </p>
        </section>

        <div role="group" aria-label="요금제 조건" className="flex gap-8 overflow-x-auto">
          {FILTERS.map((f) => (
            <FilterChip key={f.key} label={f.label} selected={f.key === "all"} />
          ))}
        </div>

        <section aria-labelledby="plan-list-summary" className="flex flex-col gap-16">
          <p id="plan-list-summary" className="text-body-small font-medium text-text-secondary">
            {SORT_LABEL} · {sortedPlans.length}개
          </p>
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
