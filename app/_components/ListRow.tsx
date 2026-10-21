import type { ReactNode } from "react";

// List/Row — Type=default | check (Design.md 4장)
// 라벨 body/small-medium, 값 body/small-strong. check의 값은 text/accent
type Props = {
  label: string;
  value: ReactNode;
  type?: "default" | "check";
  valueTestId?: string;
  /** 이름표·값을 줄바꿈 없이 한 줄로 표시 */
  noWrap?: boolean;
};

export default function ListRow({ label, value, type = "default", valueTestId, noWrap = false }: Props) {
  return (
    <div className="flex items-start justify-between gap-12 border-b border-border-subtle px-4 py-12">
      <dt className={`flex items-center gap-8 text-body-small font-medium text-text-secondary ${noWrap ? "shrink-0 whitespace-nowrap" : ""}`}>
        {type === "check" && <span aria-hidden="true" className="w-6 h-6 shrink-0 rounded-full bg-icon-accent" />}
        {label}
      </dt>
      <dd
        data-testid={valueTestId}
        className={`text-right text-body-small font-semibold ${noWrap ? "whitespace-nowrap" : ""} ${type === "check" ? "text-text-accent" : "text-text-primary"}`}
      >
        {value}
      </dd>
    </div>
  );
}
