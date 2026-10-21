import type { ReactNode } from "react";

// BottomCTA — Layout=single | double | price (Design.md 4장, 3장 하단 영역)
// single·double: 좌우 16, 상단 12, 하단 32, 내부 간격 8
// price: 좌우 16, 상단 16, 하단 32, 내부 간격 12
type Props = {
  layout?: "single" | "double" | "price";
  /** price 레이아웃의 금액 라벨 */
  amountLabel?: string;
  /** price 레이아웃의 금액 */
  amount?: ReactNode;
  children: ReactNode;
};

export default function BottomCTA({ layout = "single", amountLabel, amount, children }: Props) {
  if (layout === "price") {
    return (
      <div className="flex flex-col gap-12 border-t border-border-subtle bg-bg-surface px-16 pt-16 pb-32">
        <div className="flex items-center justify-between gap-12">
          <span className="text-body-small font-medium text-text-secondary">{amountLabel}</span>
          <span className="text-subtitle font-bold text-text-primary">{amount}</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex gap-8 border-t border-border-subtle bg-bg-surface px-16 pt-12 pb-32 ${
        layout === "double" ? "flex-row" : "flex-col"
      }`}
    >
      {children}
    </div>
  );
}
