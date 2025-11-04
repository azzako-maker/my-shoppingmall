/**
 * @file order-list.tsx
 * @description 주문 목록 컴포넌트
 *
 * 주문 목록을 표시하고 필터링할 수 있는 컴포넌트
 *
 * 주요 기능:
 * 1. 주문 목록 표시
 * 2. 주문 상태별 필터링
 * 3. 빈 상태 처리
 * 4. 반응형 디자인
 *
 * @dependencies
 * - components/order-card: 주문 카드 컴포넌트
 * - actions/orders: 주문 목록 조회 Server Action
 */

"use client";

import { useState, useEffect } from "react";
import { OrderCard } from "@/components/order-card";
import { Order, OrderStatus } from "@/types/order";
import { getOrders } from "@/actions/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrderStatusLabel } from "@/lib/utils/orders";

interface OrderListProps {
  initialOrders?: Order[];
}

export function OrderList({ initialOrders = [] }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(false);

  // 필터 변경 시 주문 목록 다시 조회
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        console.group("[OrderList] 주문 목록 조회 시작");
        console.log("필터 상태:", statusFilter);

        const filteredOrders = await getOrders(
          statusFilter === "all" ? undefined : statusFilter,
        );

        console.log("[OrderList] 주문 목록 조회 완료:", {
          주문_개수: filteredOrders.length,
          필터_상태: statusFilter,
        });
        console.groupEnd();

        setOrders(filteredOrders);
      } catch (error) {
        console.error("[OrderList] 주문 목록 조회 에러:", error);
        console.groupEnd();
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          주문 내역 ({orders.length}개)
        </h2>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">
              {getOrderStatusLabel("pending")}
            </SelectItem>
            <SelectItem value="confirmed">
              {getOrderStatusLabel("confirmed")}
            </SelectItem>
            <SelectItem value="shipped">
              {getOrderStatusLabel("shipped")}
            </SelectItem>
            <SelectItem value="delivered">
              {getOrderStatusLabel("delivered")}
            </SelectItem>
            <SelectItem value="cancelled">
              {getOrderStatusLabel("cancelled")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 주문 목록 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            {statusFilter === "all"
              ? "주문 내역이 없습니다"
              : `${getOrderStatusLabel(statusFilter)} 상태의 주문이 없습니다`}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {statusFilter === "all"
              ? "상품을 구매하면 주문 내역이 여기에 표시됩니다."
              : "다른 상태 필터를 선택해보세요."}
          </p>
        </div>
      )}
    </div>
  );
}

