/**
 * @file app/checkout/page.tsx
 * @description 주문 페이지
 *
 * 장바구니에서 주문하기를 진행하는 페이지
 *
 * 주요 기능:
 * 1. Clerk 인증 확인 (미로그인 시 리다이렉트)
 * 2. 장바구니 아이템 조회 및 표시
 * 3. 빈 장바구니 처리 (장바구니 페이지로 리다이렉트)
 * 4. 주문 정보 입력 폼 (배송지 정보 및 주문 메모)
 * 5. 주문 요약 표시
 *
 * 구현 로직:
 * - Server Component로 장바구니 데이터 조회
 * - 빈 장바구니 확인 및 처리
 * - 주문 정보 입력 폼 컴포넌트 통합
 *
 * @dependencies
 * - actions/cart: 장바구니 조회 Server Actions
 * - components/cart-summary: 주문 요약 컴포넌트 (재사용)
 * - components/checkout-form: 주문 정보 입력 폼 컴포넌트 (Server Action 호출 포함)
 */

import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getCartItems, getCartTotal } from "@/actions/cart";
import { CartSummary } from "@/components/cart-summary";
import { CartItemCard } from "@/components/cart-item-card";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  try {
    console.group("[CheckoutPage] 주문 페이지 렌더링 시작");

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn(
        "[CheckoutPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트",
      );
      console.groupEnd();
      redirect("/sign-in");
    }

    // 장바구니 아이템 조회
    const cartItems = await getCartItems();

    console.log("[CheckoutPage] 장바구니 아이템 개수:", cartItems.length);

    // 빈 장바구니 처리
    if (cartItems.length === 0) {
      console.warn("[CheckoutPage] 장바구니가 비어있음, 장바구니 페이지로 리다이렉트");
      console.groupEnd();
      redirect("/cart");
    }

    // 총액 계산
    const cartTotal = await getCartTotal();
    const totalAmount = cartTotal.subtotal;

    // Clerk 사용자 정보 조회 (이메일, 이름)
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const customerEmail =
      clerkUser.emailAddresses[0]?.emailAddress || "customer@example.com";
    const customerName =
      clerkUser.fullName ||
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "고객";

    console.log("[CheckoutPage] 고객 정보:", {
      이메일: customerEmail,
      이름: customerName,
      총액: totalAmount,
    });
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* 페이지 헤더 */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
              주문하기
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              주문 정보를 입력하고 결제를 진행하세요.
            </p>
          </div>

          {/* 주문 정보 입력 폼 및 주문 요약 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 주문 정보 입력 폼 (왼쪽) */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <CheckoutForm
                  totalAmount={totalAmount}
                  customerName={customerName}
                  customerEmail={customerEmail}
                />
              </div>

              {/* 주문 상품 목록 */}
              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  주문 상품
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* 주문 요약 (오른쪽) */}
            <div className="lg:col-span-1">
              <CartSummary items={cartItems} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[CheckoutPage] 에러 발생:", error);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 dark:text-red-400">
              주문 페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
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
