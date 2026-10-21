// FilterChip — State=default | selected (Design.md 4장)
// 한 선택 그룹에서 selected는 1개. 선택 상태는 분홍색이 아니라 회색조로 표현
type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function FilterChip({ label, selected = false, onClick }: Props) {
  const cls = selected
    ? "bg-fill-secondary text-text-on-dark border-fill-secondary font-semibold"
    : "bg-bg-surface text-text-primary border-border-default font-medium";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-40 shrink-0 items-center rounded-full border px-16 py-8 text-body-small ${cls}`}
    >
      {label}
    </button>
  );
}
