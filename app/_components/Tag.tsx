// Tag — 추천 등 짧은 상태 표시 (Design.md 4장)
// 배경 border/subtle, 글자 text/secondary, caption/bold, 모서리 999
type Props = {
  label: string;
  testId?: string;
};

export default function Tag({ label, testId }: Props) {
  return (
    <span
      data-testid={testId}
      className="inline-flex shrink-0 items-center rounded-999 bg-border-subtle px-12 py-4 text-caption font-bold text-text-secondary"
    >
      {label}
    </span>
  );
}
