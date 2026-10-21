import Link from "next/link";
import Logo from "./Logo";
import { IconArrowLeft } from "./Icons";

// Header — Type=default | root (Design.md 4장)
// root: 좌측 제목(heading/h4) + 우측 Logo
// default: 뒤로 아이콘 + 가운데 제목(subtitle/default) + 우측 균형 공간
type Props = {
  type?: "default" | "root";
  title: string;
  /** default 타입의 뒤로 이동 주소. 목적지가 정해지지 않은 화면은 비워 둠(아이콘만 표시, 이동 없음) */
  backHref?: string;
};

export default function Header({ type = "default", title, backHref }: Props) {
  if (type === "root") {
    return (
      <header className="flex h-56 items-center justify-between gap-12 px-16 py-4 bg-bg-surface">
        <h1 className="text-heading-h4 font-medium text-text-primary">{title}</h1>
        <Logo />
      </header>
    );
  }

  return (
    <header className="flex h-56 items-center gap-8 px-16 py-4 bg-bg-surface">
      {backHref ? (
        <Link href={backHref} aria-label="뒤로" className="flex w-24 h-24 shrink-0 items-center justify-center">
          <IconArrowLeft />
        </Link>
      ) : (
        <span className="flex w-24 h-24 shrink-0 items-center justify-center">
          <IconArrowLeft />
        </span>
      )}
      <h1 className="flex-1 truncate text-center text-subtitle font-semibold text-text-primary">{title}</h1>
      <span className="w-24 h-24 shrink-0" aria-hidden="true" />
    </header>
  );
}
