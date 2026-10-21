// icon/arrowLeft · icon/check · icon/doneMark (Design.md 4장 아이콘)

export function IconArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`w-24 h-24 text-icon-default ${className}`}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`w-24 h-24 text-icon-default ${className}`}>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDoneMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={`w-64 h-64 ${className}`}>
      <circle cx="32" cy="32" r="32" className="fill-fill-primary" />
      <path
        d="M20 33l8 8 16-17"
        fill="none"
        className="stroke-icon-on-dark"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
