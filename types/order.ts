/**
 * @file order.ts
 * @description 주문 관련 타입 정의
 *
 * Supabase orders 및 order_items 테이블 스키마에 맞춘 TypeScript 타입 정의
 */

import type { PaymentMethod, PaymentStatus, PaymentInfo } from "./payment";

/**
 * 배송지 정보
 */
export interface ShippingAddress {
  name: string; // 받는 사람 이름
  phone: string; // 전화번호
  postcode: string; // 우편번호
  address: string; // 기본주소 (도로명 주소)
  detailAddress: string; // 상세주소
}

/**
 * 주문 상태
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/**
 * 주문 (orders 테이블)
 */
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  // 결제 관련 필드
  payment_id: string | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus | null;
  paid_at: string | null;
  payment_info: PaymentInfo | null;
  created_at: string;
  updated_at: string;
}

/**
 * 주문 아이템 (order_items 테이블)
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

/**
 * 주문 + 주문 아이템들 (JOIN 결과)
 */
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

