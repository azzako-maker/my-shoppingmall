/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 상품 정보를 카드 형태로 표시하는 컴포넌트
 * - 상품명, 가격, 카테고리 표시
 * - 재고 상태 표시
 * - 상품 상세 페이지 링크
 * - 반응형 레이아웃
 */

import Link from "next/link";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0;
  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(product.price);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900"
    >
      {/* 상품 이미지 영역 */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {/* 이미지 플레이스홀더 - 향후 실제 이미지로 대체 가능 */}
        <div className="flex h-full items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <svg
            className="h-16 w-16 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* 재고 상태 뱃지 */}
        {isOutOfStock && (
          <div className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
            품절
          </div>
        )}
      </div>

      {/* 상품 정보 영역 */}
      <div className="p-4 sm:p-5">
        {/* 카테고리 */}
        {product.category && (
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {product.category}
          </p>
        )}

        {/* 상품명 */}
        <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-tight text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
          {product.name}
        </h3>

        {/* 설명 (있는 경우) */}
        {product.description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        )}

        <div className="flex items-end justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          {/* 가격 */}
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formattedPrice}
            </span>
            {/* 재고 정보 */}
            {!isOutOfStock && (
              <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                재고 {product.stock_quantity}개
              </span>
            )}
          </div>

          {/* 더보기 아이콘 */}
          <svg
            className="h-5 w-5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

