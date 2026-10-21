import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../_components/Header";
import CardPrice from "../../_components/CardPrice";
import ListRow from "../../_components/ListRow";
import Tag from "../../_components/Tag";
import BottomCTA from "../../_components/BottomCTA";
import Button from "../../_components/Button";
import { plans, findPlan, formatWon, priceAfterText, applyHref } from "../../_data/plans";

// 2. 요금제 상세 (/plans/[id]) — PRD 4-2
// 4개 요금제(p01 ~ p04)만 미리 만들고, 그 밖의 id는 notFound()로 404
// cacheComponents 환경에서는 dynamicParams를 쓸 수 없음 (Next 16 문서: migrating-to-cache-components)
// 'navigation': 목록에 없는 id도 전체 결과를 다 만든 뒤 응답 → notFound()가 스트리밍 전에 실행되어 404 상태로 나감
export const ensureStatic = "navigation";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return plans.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = findPlan(id);
  return { title: plan ? `${plan.name} | 요금제 추천·구독` : "요금제 상세 | 요금제 추천·구독" };
}

// 확인 필요: 요금제 상세 로딩·빈·에러 상태 (screens.md에 정의되지 않음)

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  const plan = findPlan(id);
  if (!plan) notFound();

  const monthly = formatWon(plan.monthly_price);
  // 할인 종료 후 금액: 할인 있는 요금제(p03)만. 없으면 줄 자체를 숨김
  const after = priceAfterText(plan);

  return (
    <>
      <Header title={plan.name} backHref="/plans" />

      <main className="flex flex-1 flex-col gap-24 p-24">
        {/* 추천 Tag: 목록에서 추천 Tag가 붙은 요금제일 때만 */}
        {/* 확인 필요: 추천 대상: p02 (사용자 결정, 추천 기준은 여전히 확인 필요) */}
        {plan.recommended === true && (
          <div className="flex gap-8">
            <Tag label="추천" testId="tag-recommend" />
          </div>
        )}

        <p className="text-body-small font-medium text-text-secondary">{plan.description}</p>

        {/* Card/Price: 매달 내는 금액 1개 + 할인 종료 후 금액 최대 1개. 정가·할인율·취소선 없음 */}
        <CardPrice
          label="매달 내는 금액"
          amount={monthly}
          afterText={after}
          amountTestId="price-monthly"
          afterTestId="price-after"
        />

        <section aria-labelledby="plan-basic-title" className="flex flex-col gap-12">
          <h2 id="plan-basic-title" className="text-subtitle font-semibold text-text-primary">
            기본 제공
          </h2>
          <dl className="flex flex-col">
            <ListRow label="기본 데이터" value={plan.data} />
            <ListRow label="소진 후 속도" value={plan.throttle_text} valueTestId="throttle" />
            {/* 확인 필요: 요금제 상세 기본 제공 항목 중 통화·문자 등 그 밖의 행 */}
          </dl>
        </section>

        {/* 확인 필요: 요금제 상세 포함 혜택(OptionItem) 내용 (확정 전까지 영역을 비워 둠) */}
      </main>

      <BottomCTA layout="price" amountLabel="매달 내는 금액" amount={`월 ${monthly}`}>
        <Button href={applyHref(plan.id)} fullWidth testId="btn-go-apply">
          구독 신청하기
        </Button>
      </BottomCTA>
    </>
  );
}
