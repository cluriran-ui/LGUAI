import { redirect } from "next/navigation";

// 이 세그먼트는 렌더하지 않고 바로 보내므로 instant 검증에서 제외함
// (route-segment-config/instant: `instant = false`는 세그먼트를 검증에서 완전히 제외)
export const instant = false;

// 서비스 진입 → entry_route(요금제 목록)로 보냄
export default function Home() {
  redirect("/plans");
}
