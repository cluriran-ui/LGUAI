// 요금제 데이터 (실습용 가상 데이터)
// 원본: harness/out/01-rules.json plans + docs/PRD.md 4장 요금제 데이터 표(데이터량·할인 기간)

export type Plan = {
  id: string;
  name: string;
  /** 매달 내는 금액(원) */
  monthly_price: number;
  /** 할인 종료 후 월 요금(원). 할인 없으면 null */
  price_after_discount: number | null;
  /** 할인 기간(개월). 할인 없으면 null */
  discount_months: number | null;
  /** 기본 데이터량 */
  data: string;
  /** 소진 후 속도 문구 */
  throttle_text: string;
  has_unlimited_name: boolean;
  description: string;
  /**
   * 추천 Tag 표시 여부. true일 때만 Tag 표시
   * 확인 필요: 추천 대상: p02 (사용자 결정, 추천 기준은 여전히 확인 필요)
   */
  recommended: boolean;
};

export const plans: Plan[] = [
  {
    id: "p01",
    name: "슬림 10GB",
    monthly_price: 39000,
    price_after_discount: null,
    discount_months: null,
    data: "10GB",
    throttle_text: "소진 후 1Mbps로 제한",
    has_unlimited_name: false,
    description: "출퇴근 영상 시청이 적은 고객용 기본 요금제",
    recommended: false,
  },
  {
    id: "p02",
    name: "데일리 50GB",
    monthly_price: 52000,
    price_after_discount: null,
    discount_months: null,
    data: "50GB",
    throttle_text: "소진 후 1Mbps로 제한",
    has_unlimited_name: false,
    description: "출퇴근길 영상을 월말까지 보고 싶은 고객용",
    recommended: true,
  },
  {
    id: "p03",
    name: "무제한 라이트",
    monthly_price: 59000,
    price_after_discount: 69000,
    discount_months: 24,
    data: "기본 100GB",
    throttle_text: "소진 후 5Mbps로 제한",
    has_unlimited_name: true,
    description: "이름은 무제한이지만 기본 데이터 소진 후 속도가 제한됨",
    recommended: false,
  },
  {
    id: "p04",
    name: "무제한 프리",
    monthly_price: 75000,
    price_after_discount: null,
    discount_months: null,
    data: "무제한",
    throttle_text: "속도 제한 없음",
    has_unlimited_name: true,
    description: "데이터를 다 써도 속도 제한이 없는 요금제",
    recommended: false,
  },
];

export function findPlan(id: string | null | undefined): Plan | undefined {
  return plans.find((p) => p.id === id);
}

/** 39000 → "39,000원" */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 할인 종료 후 금액 문구. 할인 없는 요금제는 null */
export function priceAfterText(plan: Plan): string | null {
  if (plan.price_after_discount === null || plan.discount_months === null) return null;
  return `${plan.discount_months + 1}개월째부터 ${formatWon(plan.price_after_discount)}`;
}

/** 상세·신청 이동 주소 (01-rules.json params) */
export const detailHref = (id: string) => `/plans/${id}`;
export const applyHref = (id: string) => `/apply?plan=${id}`;
export const COMPLETE_ROUTE = "/complete";
