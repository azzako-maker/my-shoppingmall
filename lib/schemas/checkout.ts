/**
 * @file lib/schemas/checkout.ts
 * @description 주문 정보 입력 폼 Zod 검증 스키마
 *
 * 배송지 정보 및 주문 메모에 대한 유효성 검사 스키마 정의
 */

import { z } from "zod";

/**
 * 배송지 정보 검증 스키마
 */
export const shippingAddressSchema = z.object({
  name: z
    .string()
    .min(1, "받는 사람 이름을 입력해주세요.")
    .max(50, "이름은 50자 이하여야 합니다."),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)",
    ),
  postcode: z
    .string()
    .min(1, "우편번호를 입력해주세요.")
    .regex(/^\d{5,6}$/, "우편번호는 5자리 또는 6자리 숫자여야 합니다."),
  address: z
    .string()
    .min(1, "기본주소를 입력해주세요.")
    .max(200, "주소는 200자 이하여야 합니다."),
  detailAddress: z
    .string()
    .min(1, "상세주소를 입력해주세요.")
    .max(100, "상세주소는 100자 이하여야 합니다."),
});

/**
 * 주문 폼 전체 검증 스키마
 */
export const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  order_note: z
    .string()
    .max(500, "주문 메모는 500자 이하여야 합니다.")
    .optional()
    .nullable(),
});

/**
 * 주문 폼 타입 추론
 */
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

