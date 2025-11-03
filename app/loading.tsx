/**
 * @file app/loading.tsx
 * @description 홈페이지 로딩 상태
 *
 * Next.js App Router의 loading.tsx 파일
 * 홈페이지 데이터를 불러오는 동안 자동으로 표시됨
 *
 * @dependencies
 * - components/product-card-skeleton: 상품 카드 스켈레톤 컴포넌트
 * - components/ui/skeleton: shadcn/ui Skeleton 컴포넌트
 */

import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* 최신 상품 섹션 스켈레톤 */}
        <section>
          <div className="mb-6">
            <Skeleton className="h-8 w-32 md:h-10 md:w-40" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={`latest-${index}`} />
            ))}
          </div>
        </section>

        {/* 인기 상품 섹션 스켈레톤 */}
        <section>
          <div className="mb-6">
            <Skeleton className="h-8 w-32 md:h-10 md:w-40" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={`popular-${index}`} />
            ))}
          </div>
        </section>

        {/* 전체 상품 섹션 스켈레톤 */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-32 md:h-10 md:w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={`all-${index}`} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

