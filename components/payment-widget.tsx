/**
 * @file payment-widget.tsx
 * @description Toss Payments 결제 위젯 컴포넌트
 *
 * Toss Payments 위젯을 렌더링하고 결제 요청을 처리하는 컴포넌트
 *
 * 주요 기능:
 * 1. Toss Payments 위젯 초기화 및 렌더링
 * 2. 결제 요청 처리
 * 3. 결제 승인 Server Action 호출
 * 4. 에러 핸들링 및 로딩 상태 관리
 *
 * 구현 로직:
 * - @tosspayments/payment-widget-sdk를 사용하여 위젯 초기화
 * - 클라이언트 사이드에서 결제 키 받기
 * - 서버 사이드에서 결제 승인 처리
 * - 결제 완료 후 주문 완료 페이지로 리다이렉트
 *
 * @dependencies
 * - @tosspayments/payment-widget-sdk: Toss Payments 위젯 SDK
 * - actions/payments: 결제 승인 Server Action
 * - next/navigation: 리다이렉트
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentWidget } from "@tosspayments/payment-widget-sdk";
import { Button } from "@/components/ui/button";
import { confirmPayment } from "@/actions/payments";

interface PaymentWidgetProps {
  /** 주문 ID */
  orderId: string;
  /** 주문 금액 */
  amount: number;
  /** 주문명 */
  orderName: string;
  /** 고객 이름 */
  customerName: string;
  /** 고객 이메일 */
  customerEmail: string;
}

export function PaymentWidgetComponent({
  orderId,
  amount,
  orderName,
  customerName,
  customerEmail,
}: PaymentWidgetProps) {
  const router = useRouter();
  const paymentWidgetRef = useRef<PaymentWidget | null>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toss Payments 클라이언트 키
  const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;

  useEffect(() => {
    if (!clientKey) {
      console.error(
        "[PaymentWidget] NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY가 설정되지 않음",
      );
      setErrorMessage("결제 설정 오류입니다. 관리자에게 문의해주세요.");
      return;
    }

    console.group("[PaymentWidget] 위젯 초기화 시작");

    // PaymentWidget 인스턴스 생성
    const paymentWidget = PaymentWidget(clientKey, {
      customerKey: customerEmail, // 고객 식별자 (이메일 사용)
    });

    paymentWidgetRef.current = paymentWidget;

    // 결제 수단 위젯 렌더링
    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: amount },
      { variantKey: "DEFAULT" },
    );

    paymentMethodsWidgetRef.current = paymentMethodsWidget;

    // 이용약관 위젯 렌더링 (선택사항)
    paymentWidget.renderAgreement("#agreement", {
      variantKey: "AGREEMENT",
    });

    console.log("[PaymentWidget] 위젯 초기화 완료");
    console.groupEnd();

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log("[PaymentWidget] 위젯 정리");
    };
  }, [clientKey, amount, customerEmail]);

  const handlePayment = async () => {
    console.group("[PaymentWidget] 결제 요청 시작");
    console.log("주문 ID:", orderId);
    console.log("결제 금액:", amount);

    if (!paymentWidgetRef.current) {
      console.error("[PaymentWidget] 위젯이 초기화되지 않음");
      setErrorMessage("결제 위젯을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 결제 요청
      const paymentResult = await paymentWidgetRef.current.requestPayment({
        orderId: orderId,
        orderName: orderName,
        customerName: customerName,
        customerEmail: customerEmail,
        successUrl: `${window.location.origin}/orders/${orderId}?payment=success`,
        failUrl: `${window.location.origin}/orders/${orderId}?payment=fail`,
      });

      console.log("[PaymentWidget] 결제 요청 성공:", {
        결제_키: paymentResult.paymentKey,
      });

      // 결제 승인 처리 (서버 사이드)
      const confirmResult = await confirmPayment(
        paymentResult.paymentKey,
        orderId,
        amount,
      );

      if (confirmResult.success) {
        console.log("[PaymentWidget] 결제 승인 성공");
        console.groupEnd();

        // 주문 완료 페이지로 리다이렉트
        router.push(`/orders/${orderId}?payment=success`);
      } else {
        console.warn("[PaymentWidget] 결제 승인 실패:", confirmResult.message);
        console.groupEnd();
        setErrorMessage(confirmResult.message);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("[PaymentWidget] 결제 요청 에러:", error);
      console.groupEnd();

      // 에러 메시지 처리
      if (error?.message) {
        setErrorMessage(error.message);
      } else if (error?.code === "USER_CANCEL") {
        setErrorMessage("결제가 취소되었습니다.");
      } else {
        setErrorMessage("결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      setIsLoading(false);
    }
  };

  if (!clientKey) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-400">
          결제 설정 오류입니다. 관리자에게 문의해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결제 수단 선택 위젯 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          결제 수단 선택
        </h2>
        <div id="payment-widget" className="min-h-[400px]"></div>
      </div>

      {/* 이용약관 위젯 */}
      <div>
        <div id="agreement"></div>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}

      {/* 결제 버튼 */}
      <Button
        onClick={handlePayment}
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "결제 처리 중..." : `${amount.toLocaleString()}원 결제하기`}
      </Button>
    </div>
  );
}

