/**
 * @file app/products/[id]/page.tsx
 * @description 상품 상세 페이지
 *
 * 상품의 상세 정보를 표시하고 장바구니에 추가할 수 있는 페이지
 *
 * 주요 기능:
 * 1. 상품 상세 정보 표시 (이름, 가격, 설명, 재고)
 * 2. 수량 선택 UI
 * 3. 장바구니 추가 기능
 * 4. 반응형 레이아웃
 *
 * 구현 로직:
 * - Server Component로 상품 데이터 조회
 * - URL 파라미터에서 상품 ID 추출
 * - 에러 처리 (상품 없음, 비활성화된 상품)
 *
 * @dependencies
 * - actions/get-products: 상품 조회 Server Action
 * - components/product-quantity-selector: 수량 선택 컴포넌트
 * - components/AddToCartButton: 장바구니 추가 버튼 컴포넌트
 * - components/product-breadcrumb: 브레드크럼 네비게이션 컴포넌트
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/actions/get-products";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductBreadcrumb } from "@/components/product-breadcrumb";
import { Button } from "@/components/ui/button";
import { getCategoryName, CATEGORIES } from "@/constants/categories";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  try {
    console.group("[ProductDetailPage] 상품 상세 페이지 렌더링 시작");

    // URL 파라미터에서 상품 ID 추출
    const { id } = await params;
    console.log("[ProductDetailPage] 상품 ID:", id);

    // 상품 정보 조회
    const product = await getProductById(id);

    if (!product) {
      console.warn("[ProductDetailPage] 상품을 찾을 수 없음:", id);
      console.groupEnd();
      notFound();
    }

    console.log("[ProductDetailPage] 상품 조회 완료:", {
      상품명: product.name,
      가격: product.price,
      재고: product.stock_quantity,
    });
    console.groupEnd();

    const formattedPrice = new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(product.price);

    const isOutOfStock = product.stock_quantity === 0;
    const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* 브레드크럼 네비게이션 */}
          <div className="mb-6">
            <ProductBreadcrumb
              productName={product.name}
              category={product.category as keyof typeof CATEGORIES | null}
            />
          </div>

          {/* 상품 정보 그리드 */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* 상품 이미지 영역 */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {/* 이미지 플레이스홀더 - 향후 실제 이미지로 대체 가능 */}
              <div className="flex h-full items-center justify-center">
                <svg
                  className="h-32 w-32 text-gray-400 dark:text-gray-500"
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
                <div className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                  품절
                </div>
              )}
            </div>

            {/* 상품 정보 영역 */}
            <div className="flex flex-col space-y-6">
              {/* 카테고리 */}
              {product.category && (
                <div>
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {getCategoryName(product.category as keyof typeof CATEGORIES | null)}
                  </span>
                </div>
              )}

              {/* 상품명 */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                  {product.name}
                </h1>
              </div>

              {/* 가격 */}
              <div>
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {formattedPrice}
                </p>
              </div>

              {/* 상품 설명 */}
              {product.description && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    상품 설명
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* 재고 상태 */}
              <div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  재고 상태
                </h2>
                {isOutOfStock ? (
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    품절
                  </p>
                ) : isLowStock ? (
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                    재고 부족 ({product.stock_quantity}개 남음)
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    재고 있음 ({product.stock_quantity}개)
                  </p>
                )}
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-200 dark:border-gray-800"></div>

              {/* 수량 선택 및 장바구니 추가 */}
              <div className="space-y-4">
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    수량 선택 및 장바구니 추가
                  </h2>
                  <AddToCartButton
                    productId={product.id}
                    product={product}
                    maxQuantity={product.stock_quantity}
                    disabled={isOutOfStock}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[ProductDetailPage] 에러 발생:", error);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 dark:text-red-400">
              상품 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {error instanceof Error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-500">
                {error.message}
              </p>
            )}
            <div className="mt-6">
              <Link href="/products">
                <Button variant="outline">상품 목록으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

