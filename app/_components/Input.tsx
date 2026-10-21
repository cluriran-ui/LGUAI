import type { ChangeEvent, FocusEvent } from "react";

// Input — State=default | caution | disabled | filled | focus (Design.md 4장)
// 입력 영역 높이 58, 입력과 메시지 간격 12, 입력 텍스트 body/strong
type Props = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  /** 비어 있지 않으면 caution 상태로 표시 */
  errorMessage?: string | null;
  disabled?: boolean;
  type?: "text" | "tel";
  inputMode?: "text" | "numeric" | "tel";
  maxLength?: number;
  autoComplete?: string;
  testId?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
};

export default function Input({
  id,
  label,
  value,
  placeholder,
  errorMessage,
  disabled = false,
  type = "text",
  inputMode,
  maxLength,
  autoComplete,
  testId,
  onChange,
  onBlur,
}: Props) {
  const hasError = Boolean(errorMessage);
  const state = disabled
    ? "bg-bg-subtle text-text-on-disabled border-border-default"
    : hasError
      ? "bg-bg-surface text-text-primary border-border-error"
      : "bg-bg-surface text-text-primary border-border-default focus:border-border-focus";

  return (
    <div className="flex flex-col gap-12">
      <label htmlFor={id} className="text-body-small font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        data-testid={testId}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-0 border px-16 py-16 text-body font-semibold outline-none placeholder:text-text-placeholder ${state}`}
      />
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-body-small font-medium text-text-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
