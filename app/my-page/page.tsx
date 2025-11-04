/**
 * @file app/my-page/page.tsx
 * @description 마이페이지
 *
 * 사용자의 주문 내역을 조회할 수 있는 페이지
 *
 * 주요 기능:
 * 1. Clerk 인증 확인 (미로그인 시 리다이렉트)
 * 2. 주문 목록 조회 및 표시
 * 3. 주문 상태별 필터링
 * 4. 주문 상세 페이지로 이동
 *
 * 구현 로직:
 * - Server Component로 초기 주문 목록 조회
 * - Client Component로 필터링 및 동적 업데이트
 * - 본인 주문만 조회 가능 (보안)
 *
 * @dependencies
 * - actions/orders: 주문 목록 조회 Server Action
 * - components/order-list: 주문 목록 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrders } from "@/actions/orders";
import { OrderList } from "@/components/order-list";

export default async function MyPage() {
  try {
    console.group("[MyPage] 마이페이지 렌더링 시작");

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn(
        "[MyPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트",
      );
      console.groupEnd();
      redirect("/sign-in");
    }

    // 초기 주문 목록 조회 (전체 주문)
    const initialOrders = await getOrders();

    console.log("[MyPage] 초기 주문 목록 조회 완료:", {
      주문_개수: initialOrders.length,
    });
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
              마이페이지
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              주문 내역을 확인하고 관리하세요.
            </p>
          </div>

          {/* 주문 목록 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <OrderList initialOrders={initialOrders} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[MyPage] 에러 발생:", error);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 dark:text-red-400">
              마이페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
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

