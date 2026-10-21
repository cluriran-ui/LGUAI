import Button from "./Button";
import Chip from "./Chip";
import Tag from "./Tag";
import { type Plan, detailHref, formatWon, priceAfterText } from "../_data/plans";

// Card/Plan — 요금제 카드 (Design.md 4장, PRD 4-1)
// 금액은 "매달 내는 금액" 1개 + "할인 종료 후 금액"(할인 요금제만) 최대 1개. 정가·할인율·취소선 표시 안 함
type Props = {
  plan: Plan;
  selected?: boolean;
};

export default function CardPlan({ plan, selected = false }: Props) {
  const after = priceAfterText(plan);
  const border = selected ? "border-2 border-border-medium" : "border border-border-default";

  return (
    <article
      data-testid="plan-card"
      data-plan-id={plan.id}
      aria-labelledby={`plan-name-${plan.id}`}
      className={`flex flex-col gap-8 rounded-16 bg-bg-surface p-20 ${border}`}
    >
      <div className="flex flex-wrap items-center gap-8">
        <h2 id={`plan-name-${plan.id}`} className="text-subtitle font-bold text-text-primary">
          {plan.name}
        </h2>
        {plan.recommended === true && <Tag label="추천" testId="tag-recommend" />}
        {plan.discount_months !== null && <Chip type="sale" label={`${plan.discount_months}개월 할인`} />}
      </div>

      <dl className="flex flex-col gap-4 text-body-small font-medium">
        <div className="flex gap-8">
          <dt className="text-text-secondary">기본 데이터</dt>
          <dd className="text-text-primary">{plan.data}</dd>
        </div>
        <div className="flex gap-8">
          <dt className="text-text-secondary">소진 후 속도</dt>
          <dd className="text-text-primary" data-testid="throttle">
            {plan.throttle_text}
          </dd>
        </div>
      </dl>

      <div className="flex items-end justify-between gap-12">
        <div className="flex flex-col gap-2">
          <span className="text-caption font-medium text-text-tertiary">매달 내는 금액</span>
          <span className="text-subtitle font-bold text-text-primary">
            월 <span data-testid="price-monthly">{formatWon(plan.monthly_price)}</span>
          </span>
          {after && (
            <span className="text-caption font-medium text-text-tertiary" data-testid="price-after">
              {after}
            </span>
          )}
        </div>
        <Button variant="Secondary" size="sm" href={detailHref(plan.id)} testId="btn-detail">
          자세히
        </Button>
      </div>
    </article>
  );
}
