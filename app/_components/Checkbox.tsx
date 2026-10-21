import type { ReactNode } from "react";

// Checkbox — State=default | active, 24×24 (Design.md 4장)
// active는 fill/primary로 표시. 설명 텍스트는 바깥 레이아웃에서 함께 배치
type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  testId?: string;
  describedBy?: string;
};

export default function Checkbox({ id, checked, onChange, children, testId, describedBy }: Props) {
  return (
    <div className="flex items-center gap-8">
      <input
        id={id}
        type="checkbox"
        data-testid={testId}
        checked={checked}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.checked)}
        className="w-24 h-24 shrink-0 accent-fill-primary"
      />
      <label htmlFor={id} className="text-body-small font-medium text-text-primary">
        {children}
      </label>
    </div>
  );
}
