/**
 * @file app/orders/[id]/loading.tsx
 * @description 주문 상세 페이지 로딩 상태
 *
 * Next.js App Router의 loading.tsx 파일
 * 주문 상세 정보를 불러오는 동안 자동으로 표시됨
 *
 * @dependencies
 * - components/ui/skeleton: shadcn/ui Skeleton 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailLoading() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* 뒤로가기 버튼 스켈레톤 */}
        <Skeleton className="mb-6 h-9 w-32" />

        {/* 주문 완료 헤더 스켈레톤 */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto mb-2 h-10 w-64" />
          <Skeleton className="mx-auto h-6 w-48" />
        </div>

        {/* 주문 정보 카드 스켈레톤 */}
        <div className="space-y-6">
          {/* 주문 기본 정보 스켈레톤 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* 배송지 정보 스켈레톤 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>

          {/* 주문 상품 목록 스켈레톤 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* 총액 스켈레톤 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-8 w-40" />
            </div>
          </div>

          {/* 액션 버튼 스켈레톤 */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </main>
  );
}

