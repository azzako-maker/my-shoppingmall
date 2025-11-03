/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니 아이템을 표시하는 페이지
 *
 * 주요 기능:
 * 1. 장바구니 아이템 조회 및 표시
 * 2. 빈 장바구니 상태 처리
 * 3. 장바구니 아이템 목록 표시
 *
 * 구현 로직:
 * - Server Component로 장바구니 데이터 조회
 * - Clerk 인증 확인 (미로그인 시 처리)
 * - 에러 핸들링 및 로딩 상태 처리
 *
 * @dependencies
 * - actions/cart: 장바구니 조회 Server Actions
 * - components/cart-item-list: 장바구니 아이템 목록 컴포넌트 (일괄 삭제 기능 포함)
 * - components/empty-cart: 빈 장바구니 UI 컴포넌트
 * - components/cart-summary: 장바구니 총액 요약 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart";
import { CartItemList } from "@/components/cart-item-list";
import { EmptyCart } from "@/components/empty-cart";
import { CartSummary } from "@/components/cart-summary";

export default async function CartPage() {
  try {
    console.group("[CartPage] 장바구니 페이지 렌더링 시작");

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[CartPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트");
      console.groupEnd();
      redirect("/sign-in");
    }

    // 장바구니 아이템 조회
    const cartItems = await getCartItems();

    console.log("[CartPage] 장바구니 아이템 개수:", cartItems.length);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* 페이지 헤더 */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
              장바구니
            </h1>
            {cartItems.length > 0 && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                총 {cartItems.length}개의 상품
              </p>
            )}
          </div>

          {/* 장바구니 아이템 목록 및 총액 */}
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 장바구니 아이템 목록 */}
              <div className="lg:col-span-2">
                <CartItemList items={cartItems} />
              </div>

              {/* 총액 요약 */}
              <div className="lg:col-span-1">
                <CartSummary items={cartItems} />
              </div>
            </div>
          ) : (
            <EmptyCart />
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("[CartPage] 에러 발생:", error);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 dark:text-red-400">
              장바구니를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {error instanceof Error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-500">
                {error.message}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }
}
