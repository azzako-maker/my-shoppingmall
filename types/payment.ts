/**
 * @file payment.ts
 * @description 결제 관련 타입 정의
 *
 * Toss Payments 연동을 위한 타입 정의
 */

/**
 * 결제 수단
 */
export type PaymentMethod =
  | "카드"
  | "가상계좌"
  | "계좌이체"
  | "휴대폰"
  | "상품권"
  | "도서문화상품권"
  | "게임문화상품권";

/**
 * 결제 상태
 */
export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

/**
 * 결제 상세 정보
 */
export interface PaymentInfo {
  /** 결제 금액 */
  amount: number;
  /** 결제 수단 */
  method: PaymentMethod;
  /** 결제 키 (Toss Payments) */
  paymentKey: string;
  /** 주문 ID (Toss Payments) */
  orderId: string;
  /** 결제 승인 번호 */
  receipt?: {
    receiptKey: string;
    receiptUrl: string;
  };
  /** 수수료 정보 */
  fee?: {
    /** 수수료 금액 */
    amount: number;
    /** 수수료 부담 주체 */
    payer: string;
  };
  /** 결제 실패 정보 */
  failure?: {
    code: string;
    message: string;
  };
  /** 결제 취소 정보 */
  cancels?: Array<{
    cancelAmount: number;
    cancelReason: string;
    cancelledAt: string;
  }>;
}

/**
 * 결제 요청 응답
 */
export interface PaymentRequestResponse {
  success: boolean;
  paymentKey?: string;
  orderId?: string;
  message: string;
}

/**
 * 결제 승인 요청 데이터
 */
export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

