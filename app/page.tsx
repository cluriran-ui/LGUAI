import { redirect } from "next/navigation";

// 서비스 진입 → entry_route(요금제 목록)로 보냄
export default function Home() {
  redirect("/plans");
}
