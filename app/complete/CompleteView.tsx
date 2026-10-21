"use client";

import { useMemo, useSyncExternalStore } from "react";
import Header from "../_components/Header";
import ListRow from "../_components/ListRow";
import BottomCTA from "../_components/BottomCTA";
import Button from "../_components/Button";
import { IconDoneMark } from "../_components/Icons";
import { findPlan, formatWon } from "../_data/plans";
import { SUBSCRIPTION_KEY, loadSubscription } from "../_data/subscription";

// localStorage 값은 서버에서 알 수 없음 → 서버·첫 렌더는 "읽는 중"(undefined), 브라우저에서 저장값 문자열을 읽음
// 문자열을 스냅샷으로 써서 매 렌더 같은 값이 나오게 함
const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getSnapshot = () => {
  try {
    return window.localStorage.getItem(SUBSCRIPTION_KEY);
  } catch {
    return null;
  }
};
const getServerSnapshot = (): string | null | undefined => undefined;

const pad = (n: number) => String(n).padStart(2, "0");
/** ISO 일시 → "YYYY.MM.DD HH:mm" (사용자 기기 시간 기준) */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CompleteView() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // raw가 바뀔 때만 다시 읽음 (loadSubscription이 파싱 실패를 null로 처리)
  const sub = useMemo(() => (raw ? loadSubscription() : null), [raw]);
  const plan = findPlan(sub?.plan_id);

  // 확인 필요: 신청 완료 화면 뒤로(icon/arrowLeft) 이동 목적지 (기준 흐름에 미정의) → backHref 없이 아이콘만 표시
  const header = <Header title="신청 완료" />;

  if (raw === undefined) {
    // 확인 필요: 신청 완료 로딩 상태 (screens.md에 정의되지 않음). 저장값을 읽기 전에는 제목줄만 표시
    return header;
  }

  if (!sub || !plan) {
    // 확인 필요: 신청 완료 빈·에러 상태 (screens.md에 정의되지 않음)
    // 정해지기 전까지 요금제 목록으로 가는 안내만 둠
    return (
      <>
        {header}
        <main className="flex flex-1 flex-col gap-16 p-24">
          <p className="text-body font-medium text-text-primary">확인할 신청 내역이 없어요.</p>
          <Button href="/plans" variant="Secondary" size="lg">
            요금제 목록 보기
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      {header}

      <main className="flex flex-1 flex-col gap-32 p-24">
        <section className="flex flex-col items-center gap-16 pt-24" aria-live="polite">
          <IconDoneMark />
          <h2 className="text-heading-h3 font-bold text-text-primary text-center">구독 신청이 완료됐어요</h2>
        </section>

        <section aria-labelledby="complete-detail-title" className="flex flex-col gap-12">
          <h2 id="complete-detail-title" className="text-subtitle font-semibold text-text-primary">
            신청 내역
          </h2>
          <dl className="flex flex-col">
            <ListRow label="신청 번호" value={sub.id} />
            <ListRow label="요금제 이름" value={plan.name} valueTestId="complete-plan-name" />
            <ListRow
              label="매달 내는 금액"
              value={formatWon(sub.monthly_price)}
              valueTestId="complete-monthly-price"
            />
            <ListRow label="신청 일시" value={<time dateTime={sub.created_at}>{formatDateTime(sub.created_at)}</time>} />
            {/* 신청자 이름: 저장값 그대로. 휴대폰 번호는 PRD 4-4 표시 항목에 없어 보여주지 않음 */}
            <ListRow label="신청자 이름" value={sub.name} />
          </dl>
        </section>

        {/* 확인 필요: 결과 안내 문구(시안의 이메일 안내) 사용 여부. PRD에 이메일 항목이 없어 비워 둠 */}
      </main>

      <BottomCTA>
        {/* 확인 필요: 신청 완료 화면 '요금제 더 보기' 버튼 이동 목적지 (기준 흐름에 미정의) → 이동 없음 */}
        <Button fullWidth>요금제 더 보기</Button>
      </BottomCTA>
    </>
  );
}
