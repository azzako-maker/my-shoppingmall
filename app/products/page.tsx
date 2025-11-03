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
import { ProductsPagination } from "@/components/products-pagination";
import { getProductsByCategory } from "@/actions/get-products";
import { isValidCategory } from "@/constants/categories";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  try {
    console.group("[ProductsPage] 상품 목록 페이지 렌더링 시작");

    // URL 쿼리 파라미터에서 카테고리 및 페이지 추출
    const params = await searchParams;
    const categoryParam = params.category || null;
    const pageParam = params.page;

    console.log("[ProductsPage] 카테고리 파라미터:", categoryParam);
    console.log("[ProductsPage] 페이지 파라미터:", pageParam);

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

    // 페이지 번호 파싱 및 유효성 검사
    let page = 1;
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      } else {
        console.warn(
          "[ProductsPage] 유효하지 않은 페이지 번호, 1로 조정:",
          pageParam,
        );
      }
    }

    // 카테고리별 상품 조회 (페이지네이션 지원)
    const { products, total, totalPages, currentPage } =
      await getProductsByCategory(category, page, 12);

    console.log(
      "[ProductsPage] 조회 완료:",
      {
        상품_개수: products.length,
        전체_상품_개수: total,
        현재_페이지: currentPage,
        전체_페이지_수: totalPages,
        카테고리: category || "전체",
      },
    );
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* 페이지 헤더 및 카테고리 필터 */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
                상품 목록
              </h1>
              {total > 0 && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  총 {total}개의 상품
                </p>
              )}
            </div>
            <CategoryFilter />
          </div>

          {/* 상품 그리드 */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* 페이지네이션 */}
              <ProductsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
              />
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                {category
                  ? "해당 카테고리에 상품이 없습니다."
                  : "등록된 상품이 없습니다."}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {category
                  ? "다른 카테고리를 선택해보세요."
                  : "곧 새로운 상품이 추가될 예정입니다."}
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

