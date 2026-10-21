// [기획] 구독 신청 화면: 이름·휴대폰 번호·동의를 받아 신청 1건을 저장하고 신청 완료로 이동함
// [기획] 관련: PRD 4-3 · screens.md 구독 신청 · US4·US5 · 들어오는 곳: 요금제 상세 · 나가는 곳: 신청 완료, 요금제 상세
"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../_components/Header";
import ListRow from "../_components/ListRow";
import Input from "../_components/Input";
import Checkbox from "../_components/Checkbox";
import BottomCTA from "../_components/BottomCTA";
import Button from "../_components/Button";
import { findPlan, formatWon, priceAfterText, detailHref, COMPLETE_ROUTE } from "../_data/plans";
import { saveSubscription, isPhoneValid } from "../_data/subscription";

// PRD 4-3 오류 상황과 안내 문구 (문구 그대로 사용)
// [기획] 안내 문구 4개: PRD 4-3 오류 상황 표의 문구를 그대로 씀
const MSG = {
  name: "이름을 입력해 주세요.",
  phone: "휴대폰 번호 11자리를 숫자로 입력해 주세요.",
  agree: "개인정보 수집·이용에 동의해야 신청할 수 있어요.",
  save: "신청을 저장하지 못했어요. 다시 시도해 주세요.",
} as const;

export default function ApplyForm() {
  const router = useRouter();
  const plan = findPlan(useSearchParams().get("plan"));

  // 기본 상태: 두 입력란 비어 있음, 동의 체크 안 됨
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false, agree: false });
  const [saveFailed, setSaveFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const agreeMsgRef = useRef<HTMLParagraphElement>(null);

  // [기획] 어떤 요금제를 신청하는지 모를 때: 요금제 목록으로 가는 버튼만 보여줌
  if (!plan) {
    // 확인 필요: 쿼리 plan이 없거나 잘못된 경우의 처리 (PRD·screens.md에 정의되지 않음)
    // 정해지기 전까지 요금제 목록으로 가는 안내만 둠. 뒤로 이동 목적지도 비워 둠
    return (
      <>
        <Header title="구독 신청" />
        <main className="flex flex-1 flex-col gap-16 p-24">
          <p className="text-body font-medium text-text-primary">신청할 요금제를 찾지 못했어요.</p>
          <Button href="/plans" variant="Secondary" size="lg">
            요금제 목록 보기
          </Button>
        </main>
      </>
    );
  }

  const nameValid = name.trim().length > 0;
  const phoneValid = isPhoneValid(phone);
  // [기획] 신청하기 버튼은 이름·휴대폰 번호 11자리·동의를 모두 채워야 눌림 (PRD 4-3 · 판정 규칙 6)
  const canSubmit = nameValid && phoneValid && agreed && !submitting;

  const nameError = touched.name && !nameValid ? MSG.name : null;
  const phoneError = touched.phone && !phoneValid ? MSG.phone : null;
  // [기획][확인 필요] PRD는 "동의 없이 신청 시도" 때 안내하지만, 버튼이 안 눌려서 동의를 해제할 때 안내함
  // 버튼이 비활성이라 '동의 없이 신청 시도'는 동의를 해제했을 때 안내함
  // [기획] 사용자 결정: 동의 전에는 처음부터 안내, 비활성 버튼을 누르면 안내로 이동
  const agreeError = !agreed ? MSG.agree : null;

  const after = priceAfterText(plan);

  // 비활성 '신청하기'를 누르려 할 때: 버튼은 disabled 그대로 두고, 안내 문구로 시선을 옮김 (신청은 일어나지 않음)
  function handleBlockedPress() {
    if (!agreed) {
      const el = agreeMsgRef.current;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }
    // 동의는 했지만 다른 입력이 모자랄 때: 해당 입력란 안내를 보여주고 첫 빈칸으로 이동
    setTouched((t) => ({ ...t, name: true, phone: true }));
    const target = !nameValid ? "apply-name" : !phoneValid ? "apply-phone" : null;
    if (target) document.getElementById(target)?.focus();
  }

  function handleSubmit() {
    if (!nameValid || !phoneValid || !agreed || !plan) {
      setTouched({ name: true, phone: true, agree: true });
      return;
    }
    setSubmitting(true);
    setSaveFailed(false);
    try {
      saveSubscription({
        name: name.trim(),
        phone,
        plan_id: plan.id,
        monthly_price: plan.monthly_price,
        agreed_privacy: true,
      });
    } catch {
      setSaveFailed(true);
      setSubmitting(false);
      return;
    }
    router.push(COMPLETE_ROUTE);
  }

  return (
    <>
      {/* 확인 필요: 구독 신청 화면에서 뒤로 이동 시 입력값 유지 여부 (지금은 유지하지 않음) */}
      {/* [기획] 제목줄: 뒤로 아이콘을 누르면 요금제 상세로 돌아감 (PRD 4-3 · flow.png) */}
      <Header title="구독 신청" backHref={detailHref(plan.id)} />

      <main className="flex flex-1 flex-col gap-24 p-24">
        {/* [기획] 선택한 요금제 요약: 이름·매달 내는 금액, 할인 있는 p03만 할인 종료 후 금액 (PRD 4-3 · US4) */}
        <section aria-labelledby="apply-summary-title" className="flex flex-col gap-12">
          <h2 id="apply-summary-title" className="text-subtitle font-semibold text-text-primary">
            선택한 요금제
          </h2>
          <dl className="flex flex-col">
            <ListRow label="요금제" value={plan.name} />
            <ListRow label="매달 내는 금액" value={`월 ${formatWon(plan.monthly_price)}`} />
            {/* 할인 종료 후 금액: 할인 있는 요금제(p03)만. 없으면 줄 자체를 숨김 */}
            {after && <ListRow label="할인 종료 후 금액" value={after} />}
          </dl>
        </section>

        {/* 확인 필요: 신청 안내 문구(신청 내용 확인·자동 갱신 안내) 사용 여부. PRD에 없어 비워 둠 */}

        {/* [기획] 신청 정보 입력: 이름, 휴대폰 번호, 개인정보 수집·이용 동의 (PRD 4-3 · US5) */}
        <section aria-labelledby="apply-form-title" className="flex flex-col gap-16">
          <h2 id="apply-form-title" className="text-subtitle font-semibold text-text-primary">
            신청 정보
          </h2>
          <Input
            id="apply-name"
            label="이름"
            value={name}
            placeholder="이름 입력"
            autoComplete="name"
            testId="input-name"
            errorMessage={nameError}
            onChange={(e) => {
              setName(e.target.value);
              setSaveFailed(false);
            }}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          <Input
            id="apply-phone"
            label="휴대폰 번호"
            type="tel"
            inputMode="numeric"
            value={phone}
            placeholder="숫자 11자리"
            autoComplete="tel"
            testId="input-phone"
            errorMessage={phoneError}
            onChange={(e) => {
              setPhone(e.target.value);
              setSaveFailed(false);
            }}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          />
          <div className="flex flex-col gap-8">
            <Checkbox
              id="apply-agree"
              checked={agreed}
              testId="check-agree"
              describedBy={agreeError ? "apply-agree-error" : undefined}
              onChange={(checked) => {
                setAgreed(checked);
                setTouched((t) => ({ ...t, agree: true }));
                setSaveFailed(false);
              }}
            >
              개인정보 수집·이용 동의 (필수)
            </Checkbox>
            {agreeError && (
              <p
                id="apply-agree-error"
                ref={agreeMsgRef}
                tabIndex={-1}
                aria-live="polite"
                className="text-body-small font-medium text-text-error"
              >
                {agreeError}
              </p>
            )}
          </div>
        </section>
      </main>

      {/* [기획] 하단 버튼: '신청하기'는 저장 후 신청 완료로, '취소'는 요금제 상세로 감. 저장 실패 문구는 버튼 위 (PRD 4-3) */}
      <BottomCTA>
        {saveFailed && (
          <p role="alert" className="text-body-small font-medium text-text-error">
            {MSG.save}
          </p>
        )}
        {/* 비활성일 때만 버튼 위에 투명한 덮개를 두어 누르려는 동작을 받음. 버튼 자체는 disabled 유지 (규칙 6) */}
        <div className="relative flex flex-col">
          <Button fullWidth disabled={!canSubmit} onClick={handleSubmit} testId="btn-submit">
            신청하기
          </Button>
          {!canSubmit && !submitting && (
            <span aria-hidden="true" className="absolute inset-0 cursor-not-allowed" onClick={handleBlockedPress} />
          )}
        </div>
        <Button href={detailHref(plan.id)} variant="Secondary" fullWidth>
          취소
        </Button>
      </BottomCTA>
    </>
  );
}
