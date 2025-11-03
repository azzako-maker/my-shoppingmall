/**
 * @file cart-summary.tsx
 * @description 장바구니 총액 요약 컴포넌트
 *
 * 장바구니 아이템의 총액을 계산하고 표시하는 컴포넌트
 * - 상품 합계 표시
 * - 총액 강조 표시
 * - 주문하기 버튼 (추후 구현)
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartItemWithProduct } from "@/types/cart";

interface CartSummaryProps {
  items: CartItemWithProduct[];
}

export function CartSummary({ items }: CartSummaryProps) {
  // 총액 계산
  const subtotal = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        주문 요약
      </h2>

      <div className="space-y-3">
        {/* 상품 개수 */}
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>상품 개수</span>
          <span>{itemCount}개</span>
        </div>

        {/* 상품 합계 */}
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>상품 합계</span>
          <span>{subtotal.toLocaleString("ko-KR")}원</span>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-800" />

        {/* 총액 */}
        <div className="flex justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            총액
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {subtotal.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>

      {/* 주문하기 버튼 */}
      <div className="mt-6">
        <Link href="/checkout">
          <Button className="w-full" size="lg" disabled={items.length === 0}>
            주문하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
