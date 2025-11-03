/**
 * @file lib/utils/orders.ts
 * @description 주문 관련 유틸리티 함수
 *
 * 주문 상태 관리 및 변환 관련 유틸리티 함수
 */

import { OrderStatus } from "@/types/order";

/**
 * 주문 상태 변경 가능 여부 확인
 * @param currentStatus 현재 주문 상태
 * @param newStatus 변경하려는 주문 상태
 * @returns 변경 가능 여부
 */
export function canUpdateOrderStatus(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean {
  // 같은 상태로 변경 불가
  if (currentStatus === newStatus) {
    return false;
  }

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [], // 완료된 주문은 변경 불가
    cancelled: [], // 취소된 주문은 변경 불가
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * 주문 상태 한글 레이블 변환
 * @param status 주문 상태
 * @returns 한글 레이블
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const statusLabels: Record<OrderStatus, string> = {
    pending: "주문 대기중",
    confirmed: "주문 확인됨",
    shipped: "배송중",
    delivered: "배송완료",
    cancelled: "주문 취소됨",
  };

  return statusLabels[status] || status;
}

/**
 * 주문 상태별 뱃지 색상 클래스
 * @param status 주문 상태
 * @returns Tailwind CSS 클래스
 */
export function getOrderStatusBadgeClass(status: OrderStatus): string {
  const statusClasses: Record<OrderStatus, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return statusClasses[status] || "";
}

