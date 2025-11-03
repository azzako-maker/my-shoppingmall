/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지
 *
 * 전체 상품 또는 카테고리별 상품을 표시하는 페이지
 *
 * 주요 기능:
 * 1. 전체 상품 목록 표시
 * 2. 카테고리별 필터링
 * 3. 카테고리 드롭다운 필터 UI
 * 4. 반응형 그리드 레이아웃
 *
 * 구현 로직:
 * - Server Component로 상품 데이터 조회
 * - URL 쿼리 파라미터(category)로 카테고리 필터링
 * - 카테고리별 상품 조회 Server Action 사용
 * - 에러 핸들링 및 빈 상태 처리
 *
 * @dependencies
 * - actions/get-products: 상품 데이터 조회 Server Actions
 * - components/product-card: 상품 카드 컴포넌트
 * - components/category-filter: 카테고리 필터 컴포넌트
 */

import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { getProductsByCategory } from "@/actions/get-products";
import { isValidCategory } from "@/constants/categories";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  try {
    console.group("[ProductsPage] 상품 목록 페이지 렌더링 시작");

    // URL 쿼리 파라미터에서 카테고리 추출
    const params = await searchParams;
    const categoryParam = params.category || null;

    console.log("[ProductsPage] 카테고리 파라미터:", categoryParam);

    // 유효한 카테고리인지 확인
    const category =
      categoryParam && isValidCategory(categoryParam)
        ? categoryParam
        : null;

    if (categoryParam && !category) {
      console.warn(
        "[ProductsPage] 유효하지 않은 카테고리, 전체 상품 조회:",
        categoryParam,
      );
    }

    // 카테고리별 상품 조회
    const products = await getProductsByCategory(category);

    console.log(
      "[ProductsPage] 조회 완료, 상품 개수:",
      products.length,
      category ? `(카테고리: ${category})` : "(전체)",
    );
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* 페이지 헤더 및 카테고리 필터 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold md:text-4xl">상품 목록</h1>
            <CategoryFilter />
          </div>

          {/* 상품 그리드 */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {category
                  ? "해당 카테고리에 상품이 없습니다."
                  : "등록된 상품이 없습니다."}
              </p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("[ProductsPage] 에러 발생:", error);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 dark:text-red-400">
              상품을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {error instanceof Error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-500">
                {error.message}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }
}

