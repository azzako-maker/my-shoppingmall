/**
 * @file components/checkout-form.tsx
 * @description 주문 정보 입력 폼 컴포넌트
 *
 * 배송지 정보 및 주문 메모를 입력하는 폼 컴포넌트
 *
 * 주요 기능:
 * 1. 배송지 정보 입력 (이름, 전화번호, 우편번호, 주소, 상세주소)
 * 2. 주문 메모 입력 (선택사항)
 * 3. 폼 유효성 검사 (react-hook-form + Zod)
 * 4. 주문 생성 Server Action 호출
 * 5. 성공 시 주문 완료 페이지로 리다이렉트
 * 6. 에러 메시지 표시
 *
 * 구현 로직:
 * - react-hook-form과 zodResolver를 사용한 폼 관리
 * - shadcn/ui Form 컴포넌트 활용
 * - 전화번호 및 우편번호 형식 검증
 * - 필수 필드 검증
 * - createOrder Server Action 호출
 * - 로딩 상태 및 에러 상태 관리
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: Zod resolver
 * - @/components/ui/form: shadcn/ui Form 컴포넌트
 * - @/lib/schemas/checkout: Zod 검증 스키마
 * - @/actions/orders: 주문 생성 Server Action
 * - next/navigation: 리다이렉트
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  checkoutFormSchema,
  type CheckoutFormData,
} from "@/lib/schemas/checkout";
import { createOrder } from "@/actions/orders";

interface CheckoutFormProps {
  onSubmit?: (data: CheckoutFormData) => void | Promise<void>;
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        name: "",
        phone: "",
        postcode: "",
        address: "",
        detailAddress: "",
      },
      order_note: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    console.group("[CheckoutForm] 폼 제출 시작");
    console.log("입력된 배송지 정보:", data.shippingAddress);
    console.log("주문 메모:", data.order_note || "(없음)");

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 커스텀 onSubmit 핸들러가 있으면 실행 (추후 확장용)
      if (onSubmit) {
        await onSubmit(data);
      }

      // Server Action 호출
      const result = await createOrder(
        data.shippingAddress,
        data.order_note || null,
      );

      if (result.success && result.orderId) {
        console.log("[CheckoutForm] 주문 생성 성공, 주문 ID:", result.orderId);
        console.groupEnd();

        // 주문 완료 페이지로 리다이렉트
        router.push(`/orders/${result.orderId}`);
      } else {
        console.warn("[CheckoutForm] 주문 생성 실패:", result.message);
        console.groupEnd();
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[CheckoutForm] 예외 발생:", error);
      console.groupEnd();
      setErrorMessage(
        "주문을 생성하는 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
      setIsLoading(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 배송지 정보 섹션 */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            배송지 정보
          </h2>

          <div className="space-y-4">
            {/* 받는 사람 이름 */}
            <FormField
              control={form.control}
              name="shippingAddress.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>받는 사람 이름 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="홍길동"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 전화번호 */}
            <FormField
              control={form.control}
              name="shippingAddress.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="010-1234-5678"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 우편번호 */}
            <FormField
              control={form.control}
              name="shippingAddress.postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우편번호 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 기본주소 (도로명 주소) */}
            <FormField
              control={form.control}
              name="shippingAddress.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기본주소 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="서울특별시 강남구 테헤란로 123"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 상세주소 */}
            <FormField
              control={form.control}
              name="shippingAddress.detailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세주소 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123동 456호"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* 주문 메모 섹션 */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            주문 메모
          </h2>

          <FormField
            control={form.control}
            name="order_note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>배송 요청사항 (선택사항)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="배송 시 요청사항을 입력해주세요. (예: 문 앞에 놓아주세요)"
                    rows={4}
                    {...field}
                    value={field.value || ""}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        {/* 폼 제출 버튼 */}
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "주문하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

