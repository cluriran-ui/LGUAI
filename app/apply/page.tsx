import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../_components/Header";
import ApplyForm from "./ApplyForm";

// 3. 구독 신청 (/apply?plan={id}) — PRD 4-3
// 쿼리(plan)는 클라이언트에서 useSearchParams로 읽음. cacheComponents 환경이라 Suspense로 감쌈
export const metadata: Metadata = {
  title: "구독 신청 | 요금제 추천·구독",
};

// 확인 필요: 구독 신청 로딩 상태 (screens.md에 정의되지 않음). 쿼리를 읽기 전에는 제목줄만 표시

export default function ApplyPage() {
  return (
    <Suspense fallback={<Header title="구독 신청" />}>
      <ApplyForm />
    </Suspense>
  );
}
