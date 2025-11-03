/**
 * @file product-card-skeleton.tsx
 * @description 상품 카드 스켈레톤 컴포넌트
 *
 * 로딩 중 상품 카드의 플레이스홀더를 표시하는 컴포넌트
 * - 상품 카드와 동일한 레이아웃
 * - 애니메이션 효과
 * - 반응형 디자인
 *
 * @dependencies
 * - components/ui/skeleton: shadcn/ui Skeleton 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 상품 카드 스켈레톤 컴포넌트
 * 로딩 중 상품 카드의 플레이스홀더를 표시
 */
export function ProductCardSkeleton() {
  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* 상품 이미지 영역 스켈레톤 */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
        <Skeleton className="h-full w-full" />
      </div>

      {/* 상품 정보 영역 스켈레톤 */}
      <div className="p-4 sm:p-5">
        {/* 카테고리 스켈레톤 */}
        <Skeleton className="mb-1.5 h-3 w-16" />

        {/* 상품명 스켈레톤 */}
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-3 h-4 w-1/2" />

        {/* 가격 및 재고 스켈레톤 */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

