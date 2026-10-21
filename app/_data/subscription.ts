// 구독 신청 1건 (PRD 5장 Subscription)
// 서버·DB 없이 브라우저 localStorage에만 1건 저장함

export type Subscription = {
  id: string;
  name: string;
  phone: string;
  plan_id: string;
  monthly_price: number;
  agreed_privacy: boolean;
  created_at: string;
};

export const SUBSCRIPTION_KEY = "subscription";

/** 휴대폰 번호 형식: 숫자 11자리 */
export const isPhoneValid = (v: string) => /^\d{11}$/.test(v);

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 신청 1건 저장. 실패하면 예외를 던짐 */
export function saveSubscription(input: Omit<Subscription, "id" | "created_at">): Subscription {
  if (!input.agreed_privacy) throw new Error("agreed_privacy must be true");
  const sub: Subscription = { id: newId(), ...input, created_at: new Date().toISOString() };
  window.localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return sub;
}

/** 저장된 신청 1건. 없거나 읽기 실패면 null */
export function loadSubscription(): Subscription | null {
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_KEY);
    return raw ? (JSON.parse(raw) as Subscription) : null;
  } catch {
    return null;
  }
}
