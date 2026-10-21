import Link from "next/link";
import type { ReactNode } from "react";

// Button — Type=Primary | Secondary, Size=sm | lg | xl, State=Default | Hover | Disabled (Design.md 4장)
type Props = {
  children: ReactNode;
  variant?: "Primary" | "Secondary";
  size?: "sm" | "lg" | "xl";
  /** 주어지면 링크로 렌더링 */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
  testId?: string;
};

// 원본 높이: sm 40 · lg 48 · xl 52
// xl 52에 맞는 spacing 토큰이 없어 lg와 같은 h-48을 씀 (보고함)
const SIZE = {
  sm: "h-40 px-24",
  lg: "h-48 px-24",
  xl: "h-48 px-24",
} as const;

const VARIANT = {
  Primary: "bg-fill-primary text-text-on-dark hover:bg-fill-primary-hover font-semibold",
  Secondary:
    "bg-surface-default text-text-primary border border-border-default hover:bg-bg-subtle font-semibold",
} as const;

const DISABLED = {
  Primary: "bg-fill-disabled text-text-on-disabled font-medium cursor-not-allowed",
  Secondary: "bg-fill-disabled text-text-on-disabled border border-border-default font-semibold cursor-not-allowed",
} as const;

export default function Button({
  children,
  variant = "Primary",
  size = "xl",
  href,
  type = "button",
  disabled = false,
  onClick,
  fullWidth = false,
  testId,
}: Props) {
  const cls = [
    "inline-flex items-center justify-center rounded-8 text-body",
    SIZE[size],
    disabled ? DISABLED[variant] : VARIANT[variant],
    fullWidth ? "w-full" : "",
  ].join(" ");

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} data-testid={testId}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} data-testid={testId}>
      {children}
    </button>
  );
}
