import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "요금제 추천·구독",
  description: "데이터량·소진 후 속도·매달 내는 금액을 비교해 요금제를 고르고 바로 신청",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-surface text-text-primary font-sans">{children}</body>
    </html>
  );
}
