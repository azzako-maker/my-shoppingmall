/**
 * @file order-card.tsx
 * @description 주문 카드 컴포넌트
 *
 * 주문 목록에서 각 주문을 표시하는 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 주문 정보 표시 (주문 번호, 날짜, 상태, 총액)
 * 2. 주문 상세 페이지로 이동하는 링크
 * 3. 반응형 디자인
 *
 * @dependencies
 * - types/order: Order 타입
 * - lib/utils/orders: 주문 상태 유틸리티 함수
 */

import Link from "next/link";
import { Order } from "@/types/order";
import {
  getOrderStatusLabel,
  getOrderStatusBadgeClass,
} from "@/lib/utils/orders";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

/**
 * 주문 번호 포맷팅 (UUID 일부만 표시)
 */
function formatOrderId(orderId: string): string {
  return `ORD-${orderId.substring(0, 8).toUpperCase()}`;
}

/**
 * 날짜 포맷팅 (한국 시간)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function OrderCard({ order }: OrderCardProps) {
  const formattedOrderId = formatOrderId(order.id);
  const formattedDate = formatDate(order.created_at);
  const formattedTotal = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(order.total_amount);

  const statusLabel = getOrderStatusLabel(order.status);
  const statusBadgeClass = getOrderStatusBadgeClass(order.status);

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
        <div className="flex items-start justify-between">
          {/* 왼쪽: 주문 정보 */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formattedOrderId}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-medium">주문일:</span>
                <span>{formattedDate}</span>
              </div>
              {order.payment_status === "success" && order.paid_at && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">결제일:</span>
                  <span>{formatDate(order.paid_at)}</span>
                </div>
              )}
            </div>

            {/* 결제 정보 */}
            {order.payment_method && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">결제 수단:</span>{" "}
                <span>{order.payment_method}</span>
              </div>
            )}
          </div>

          {/* 오른쪽: 총액 및 상세보기 버튼 */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                총액
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formattedTotal}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
            >
              상세보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

