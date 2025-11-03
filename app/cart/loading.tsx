/**
 * @file app/cart/loading.tsx
 * @description 장바구니 페이지 로딩 상태
 *
 * 장바구니 페이지 로딩 중 표시되는 스켈레톤 UI
 */

import { Skeleton } from "@/components/ui/skeleton";
import { CartItemSkeleton } from "@/components/cart-item-skeleton";

export default function CartLoading() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        {/* 페이지 헤더 */}
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="mt-2 h-5 w-24" />
        </div>

        {/* 장바구니 아이템 목록 및 총액 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 장바구니 아이템 목록 */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CartItemSkeleton key={index} />
              ))}
            </div>
          </div>

          {/* 총액 요약 */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="mb-4 h-6 w-24" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <Skeleton className="mt-6 h-12 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
