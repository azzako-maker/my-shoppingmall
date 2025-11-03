/**
 * @file cart-item-skeleton.tsx
 * @description 장바구니 아이템 스켈레톤 컴포넌트
 *
 * 장바구니 페이지 로딩 중 표시되는 스켈레톤 UI
 */

import { Skeleton } from "@/components/ui/skeleton";

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      {/* 체크박스 영역 */}
      <div className="flex-shrink-0 pt-1">
        <Skeleton className="h-5 w-5 rounded" />
      </div>

      {/* 상품 이미지 */}
      <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />

      {/* 상품 정보 */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          {/* 상품명 */}
          <Skeleton className="h-5 w-3/4" />
          {/* 단가 */}
          <Skeleton className="h-4 w-24" />
        </div>

        {/* 수량 선택기 및 소계 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 수량 선택기 */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-20 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            {/* 삭제 버튼 */}
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          {/* 소계 */}
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}
