/**
 * @file cart-content.tsx
 * @description 장바구니 컨텐츠 컴포넌트 (실시간 업데이트 기능 포함)
 *
 * 장바구니 아이템 목록과 주문 요약을 관리하는 Client Component
 *
 * 주요 기능:
 * 1. 장바구니 아이템 상태 관리 (실시간 업데이트)
 * 2. 수량 변경 시 즉시 총액 업데이트 (Optimistic Update)
 * 3. CartItemList와 CartSummary 렌더링
 *
 * 구현 로직:
 * - items 상태를 useState로 관리 (초기값: props.items)
 * - props.items 변경 시 상태 동기화 (useEffect)
 * - handleItemQuantityChange: 수량 변경 시 상태 즉시 업데이트
 * - Optimistic Update 패턴 적용
 *
 * @dependencies
 * - components/cart-item-list: 장바구니 아이템 목록 컴포넌트
 * - components/cart-summary: 장바구니 총액 요약 컴포넌트
 * - types/cart: 장바구니 타입 정의
 */

"use client";

import { useState, useEffect } from "react";
import { CartItemList } from "@/components/cart-item-list";
import { CartSummary } from "@/components/cart-summary";
import { CartItemWithProduct } from "@/types/cart";

interface CartContentProps {
  items: CartItemWithProduct[];
}

export function CartContent({ items: initialItems }: CartContentProps) {
  // items 상태 관리 (초기값: props.items)
  const [items, setItems] = useState<CartItemWithProduct[]>(initialItems);

  // props.items가 변경되면 상태 동기화 (외부 변경 대응: 삭제 등)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  /**
   * 아이템 수량 변경 핸들러
   * Optimistic Update: 먼저 상태를 업데이트하고, Server Action은 CartItemCard에서 호출
   */
  const handleItemQuantityChange = (
    itemId: string,
    newQuantity: number,
  ): void => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // TODO: 일괄 삭제 후 상태 업데이트용 (현재는 router.refresh() 사용)
  // const handleItemsDelete = (deletedIds: string[]): void => {
  //   setItems((prevItems) =>
  //     prevItems.filter((item) => !deletedIds.includes(item.id)),
  //   );
  // };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 장바구니 아이템 목록 */}
      <div className="lg:col-span-2">
        <CartItemList
          items={items}
          onItemQuantityChange={handleItemQuantityChange}
        />
      </div>

      {/* 총액 요약 */}
      <div className="lg:col-span-1">
        <CartSummary items={items} />
      </div>
    </div>
  );
}

