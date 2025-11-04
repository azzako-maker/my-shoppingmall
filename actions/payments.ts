/**
 * @file payments.ts
 * @description 결제 관련 Server Actions
 *
 * Toss Payments 결제 요청 및 승인 처리
 * - 결제 요청 생성
 * - 결제 승인 처리
 * - 결제 취소 처리
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getOrderById } from "@/actions/orders";
import type {
  PaymentRequestResponse,
  PaymentConfirmRequest,
  PaymentInfo,
  PaymentMethod,
  PaymentStatus,
} from "@/types/payment";

/**
 * Toss Payments API 엔드포인트
 */
const TOSS_PAYMENTS_API_URL = "https://api.tosspayments.com/v1";

/**
 * 결제 요청 생성
 * @param orderId 주문 ID
 * @returns 결제 요청 응답
 */
export async function requestPayment(
  orderId: string,
): Promise<PaymentRequestResponse> {
  try {
    console.group("[requestPayment] 결제 요청 생성 시작");
    console.log("주문 ID:", orderId);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[requestPayment] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 주문 정보 조회
    const order = await getOrderById(orderId);

    if (!order) {
      console.warn("[requestPayment] 주문을 찾을 수 없음:", orderId);
      console.groupEnd();
      return {
        success: false,
        message: "주문을 찾을 수 없습니다.",
      };
    }

    // 본인 주문 확인
    if (order.clerk_id !== userId) {
      console.warn("[requestPayment] 권한 없음:", { orderId, userId });
      console.groupEnd();
      return {
        success: false,
        message: "주문에 접근할 권한이 없습니다.",
      };
    }

    // 이미 결제된 주문 확인
    if (order.payment_status === "success") {
      console.warn("[requestPayment] 이미 결제된 주문:", orderId);
      console.groupEnd();
      return {
        success: false,
        message: "이미 결제가 완료된 주문입니다.",
      };
    }

    // 주문 상태 확인 (pending 상태만 결제 가능)
    if (order.status !== "pending") {
      console.warn("[requestPayment] 결제 불가능한 주문 상태:", order.status);
      console.groupEnd();
      return {
        success: false,
        message: `"${order.status}" 상태의 주문은 결제할 수 없습니다.`,
      };
    }

    // Toss Payments 결제 키 생성
    // 클라이언트 사이드에서 위젯을 통해 결제 키를 받아오므로,
    // 여기서는 주문 정보만 반환
    console.log("[requestPayment] 결제 요청 준비 완료:", {
      주문_ID: order.id,
      총액: order.total_amount,
    });
    console.groupEnd();

    return {
      success: true,
      orderId: order.id,
      message: "결제 요청이 준비되었습니다.",
    };
  } catch (error) {
    console.error("[requestPayment] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 결제 승인 처리
 * @param paymentKey 결제 키 (Toss Payments에서 받은 키)
 * @param orderId 주문 ID
 * @param amount 결제 금액
 * @returns 결제 승인 결과
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("[confirmPayment] 결제 승인 처리 시작");
    console.log("결제 키:", paymentKey);
    console.log("주문 ID:", orderId);
    console.log("결제 금액:", amount);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[confirmPayment] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 주문 정보 조회
    const order = await getOrderById(orderId);

    if (!order) {
      console.warn("[confirmPayment] 주문을 찾을 수 없음:", orderId);
      console.groupEnd();
      return {
        success: false,
        message: "주문을 찾을 수 없습니다.",
      };
    }

    // 본인 주문 확인
    if (order.clerk_id !== userId) {
      console.warn("[confirmPayment] 권한 없음:", { orderId, userId });
      console.groupEnd();
      return {
        success: false,
        message: "주문에 접근할 권한이 없습니다.",
      };
    }

    // 결제 금액 검증
    if (order.total_amount !== amount) {
      console.warn("[confirmPayment] 결제 금액 불일치:", {
        주문_금액: order.total_amount,
        결제_금액: amount,
      });
      console.groupEnd();
      return {
        success: false,
        message: "결제 금액이 일치하지 않습니다.",
      };
    }

    // Toss Payments API로 결제 승인 확인
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;

    if (!secretKey) {
      console.error("[confirmPayment] TOSS_PAYMENTS_SECRET_KEY가 설정되지 않음");
      console.groupEnd();
      return {
        success: false,
        message: "결제 서버 설정 오류입니다. 관리자에게 문의해주세요.",
      };
    }

    // Toss Payments 결제 승인 API 호출
    const response = await fetch(
      `${TOSS_PAYMENTS_API_URL}/payments/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[confirmPayment] Toss Payments API 에러:", errorData);
      console.groupEnd();
      return {
        success: false,
        message: errorData.message || "결제 승인에 실패했습니다.",
      };
    }

    const paymentData = await response.json();
    console.log("[confirmPayment] 결제 승인 성공:", {
      결제_키: paymentData.paymentKey,
      결제_수단: paymentData.method,
    });

    // 결제 정보 추출
    const paymentMethod: PaymentMethod =
      paymentData.method === "카드"
        ? "카드"
        : paymentData.method === "가상계좌"
          ? "가상계좌"
          : paymentData.method === "계좌이체"
            ? "계좌이체"
            : paymentData.method === "휴대폰"
              ? "휴대폰"
              : "카드"; // 기본값

    const paymentInfo: PaymentInfo = {
      amount: paymentData.totalAmount,
      method: paymentMethod,
      paymentKey: paymentData.paymentKey,
      orderId: paymentData.orderId,
      receipt: paymentData.receipt
        ? {
            receiptKey: paymentData.receipt.receiptKey,
            receiptUrl: paymentData.receipt.receiptUrl,
          }
        : undefined,
      fee: paymentData.fee
        ? {
            amount: paymentData.fee.amount,
            payer: paymentData.fee.payer,
          }
        : undefined,
    };

    // 주문 상태 업데이트 (결제 정보 저장)
    const supabase = getServiceRoleClient();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_id: paymentKey,
        payment_method: paymentMethod,
        payment_status: "success" as PaymentStatus,
        paid_at: new Date().toISOString(),
        payment_info: paymentInfo as any, // JSONB 타입으로 저장
        status: "confirmed", // 주문 상태를 'confirmed'로 변경
      })
      .eq("id", orderId)
      .eq("clerk_id", userId); // 이중 확인 (보안)

    if (updateError) {
      console.error("[confirmPayment] 주문 상태 업데이트 에러:", updateError);
      console.groupEnd();
      return {
        success: false,
        message: "결제는 완료되었지만 주문 정보 업데이트에 실패했습니다. 고객센터로 문의해주세요.",
      };
    }

    console.log("[confirmPayment] 결제 승인 처리 완료:", {
      주문_ID: orderId,
      결제_키: paymentKey,
      결제_수단: paymentMethod,
    });
    console.groupEnd();

    return {
      success: true,
      message: "결제가 완료되었습니다.",
    };
  } catch (error) {
    console.error("[confirmPayment] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "결제 승인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 결제 취소 처리
 * @param orderId 주문 ID
 * @returns 결제 취소 결과
 */
export async function cancelPayment(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("[cancelPayment] 결제 취소 처리 시작");
    console.log("주문 ID:", orderId);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[cancelPayment] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 주문 정보 조회
    const order = await getOrderById(orderId);

    if (!order) {
      console.warn("[cancelPayment] 주문을 찾을 수 없음:", orderId);
      console.groupEnd();
      return {
        success: false,
        message: "주문을 찾을 수 없습니다.",
      };
    }

    // 본인 주문 확인
    if (order.clerk_id !== userId) {
      console.warn("[cancelPayment] 권한 없음:", { orderId, userId });
      console.groupEnd();
      return {
        success: false,
        message: "주문에 접근할 권한이 없습니다.",
      };
    }

    // 주문 상태 확인 (pending 또는 confirmed 상태만 취소 가능)
    if (order.status !== "pending" && order.status !== "confirmed") {
      console.warn("[cancelPayment] 취소 불가능한 주문 상태:", order.status);
      console.groupEnd();
      return {
        success: false,
        message: `"${order.status}" 상태의 주문은 취소할 수 없습니다.`,
      };
    }

    // 주문 상태를 'cancelled'로 변경
    const supabase = getServiceRoleClient();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        payment_status: "cancelled" as PaymentStatus,
      })
      .eq("id", orderId)
      .eq("clerk_id", userId); // 이중 확인 (보안)

    if (updateError) {
      console.error("[cancelPayment] 주문 상태 업데이트 에러:", updateError);
      console.groupEnd();
      return {
        success: false,
        message: "주문 취소 중 오류가 발생했습니다.",
      };
    }

    console.log("[cancelPayment] 결제 취소 처리 완료:", {
      주문_ID: orderId,
    });
    console.groupEnd();

    return {
      success: true,
      message: "주문이 취소되었습니다.",
    };
  } catch (error) {
    console.error("[cancelPayment] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "주문 취소 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

