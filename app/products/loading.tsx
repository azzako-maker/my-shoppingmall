/**
 * @file app/products/loading.tsx
 * @description 상품 목록 페이지 로딩 상태
 *
 * Next.js App Router의 loading.tsx 파일
 * 상품 목록을 불러오는 동안 자동으로 표시됨
 *
 * @dependencies
 * - components/product-card-skeleton: 상품 카드 스켈레톤 컴포넌트
 */

import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 스켈레톤 */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32 sm:h-10 md:h-12 md:w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </div>

        {/* 상품 그리드 스켈레톤 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

