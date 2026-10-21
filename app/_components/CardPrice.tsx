// Card/Price — 월 요금 요약 카드 (Design.md 4장, PRD 4-2)
// 주요 금액 heading/h2, 라벨·부가 설명 caption/medium + text/tertiary
type Props = {
  label: string;
  /** 매달 내는 금액 문구. 예: "59,000원" */
  amount: string;
  /** 할인 종료 후 금액 문구. 할인 없으면 비움 */
  afterText?: string | null;
  amountTestId?: string;
  afterTestId?: string;
};

export default function CardPrice({ label, amount, afterText, amountTestId, afterTestId }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-12 bg-bg-default p-20">
      <span className="text-caption font-medium text-text-tertiary">{label}</span>
      <span className="text-heading-h2 font-bold text-text-primary">
        월 <span data-testid={amountTestId}>{amount}</span>
      </span>
      {afterText && (
        <span className="text-caption font-medium text-text-tertiary" data-testid={afterTestId}>
          {afterText}
        </span>
      )}
    </section>
  );
}
