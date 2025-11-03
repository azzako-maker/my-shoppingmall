/**
 * @file app/products/[id]/loading.tsx
 * @description 상품 상세 페이지 로딩 상태
 *
 * Next.js App Router의 loading.tsx 파일
 * 상품 상세 정보를 불러오는 동안 자동으로 표시됨
 *
 * @dependencies
 * - components/ui/skeleton: shadcn/ui Skeleton 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        {/* 뒤로가기 버튼 스켈레톤 */}
        <Skeleton className="mb-6 h-9 w-32" />

        {/* 상품 정보 그리드 스켈레톤 */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* 상품 이미지 영역 스켈레톤 */}
          <div className="aspect-square w-full overflow-hidden rounded-xl">
            <Skeleton className="h-full w-full" />
          </div>

          {/* 상품 정보 영역 스켈레톤 */}
          <div className="flex flex-col space-y-6">
            {/* 카테고리 스켈레톤 */}
            <Skeleton className="h-6 w-24 rounded-full" />

            {/* 상품명 스켈레톤 */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full sm:h-12" />
              <Skeleton className="h-8 w-3/4" />
            </div>

            {/* 가격 스켈레톤 */}
            <Skeleton className="h-12 w-48" />

            {/* 상품 설명 스켈레톤 */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* 재고 상태 스켈레톤 */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 dark:border-gray-800"></div>

            {/* 수량 선택 및 장바구니 추가 스켈레톤 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

