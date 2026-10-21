// [기획] 신청 완료 화면의 바깥 틀: 실제 화면은 CompleteView.tsx에 있음
// [기획] 관련: PRD 4-4 · screens.md 신청 완료 · US5
import type { Metadata } from "next";
import CompleteView from "./CompleteView";

// 4. 신청 완료 (/complete) — PRD 4-4
// 신청 1건은 브라우저 localStorage에만 있으므로 클라이언트 컴포넌트에서 읽음
export const metadata: Metadata = {
  title: "신청 완료 | 요금제 추천·구독",
};

export default function CompletePage() {
  return <CompleteView />;
}
