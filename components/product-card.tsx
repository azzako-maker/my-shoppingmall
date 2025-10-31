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
      className="group block h-full rounded-lg border bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-950"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
        {/* 이미지 플레이스홀더 - 향후 실제 이미지로 대체 가능 */}
        <div className="flex h-full items-center justify-center">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* 재고 상태 뱃지 */}
        {isOutOfStock && (
          <div className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
            품절
          </div>
        )}
      </div>

      <div className="p-4">
        {/* 카테고리 */}
        {product.category && (
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            {product.category}
          </p>
        )}

        {/* 상품명 */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {product.name}
        </h3>

        {/* 설명 (있는 경우) */}
        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {/* 가격 */}
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formattedPrice}
          </span>

          {/* 재고 정보 */}
          {!isOutOfStock && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              재고 {product.stock_quantity}개
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

