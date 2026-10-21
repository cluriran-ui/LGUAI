// Logo — 32×24, brand/primary (Design.md 4장)
export default function Logo() {
  return (
    <svg viewBox="0 0 32 24" role="img" aria-label="로고" className="w-32 h-24 shrink-0">
      <path
        d="M4 3v10a6 6 0 0012 0V3"
        fill="none"
        className="stroke-brand-primary"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path d="M25 6v10M20 11h10" fill="none" className="stroke-brand-primary" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
