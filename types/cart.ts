/**
 * @file cart.ts
 * @description 장바구니 관련 타입 정의
 *
 * Supabase cart_items 테이블 스키마에 맞춘 TypeScript 타입 정의
 */

import { Product } from "./product";

/**
 * 장바구니 아이템 (cart_items 테이블)
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * 장바구니 아이템 + 상품 정보 (JOIN 결과)
 */
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * 장바구니 총액 계산 결과
 */
export interface CartTotal {
  subtotal: number; // 상품 합계 (가격 × 수량)
  itemCount: number; // 아이템 개수
}
