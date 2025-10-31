/**
 * @file page.tsx
 * @description 홈페이지
 *
 * 쇼핑몰 홈페이지로, 최신 상품과 전체 상품 미리보기를 표시합니다.
 *
 * 주요 기능:
 * 1. 최신 상품 섹션 (8개 제한)
 * 2. 전체 상품 미리보기 섹션 (12개 제한)
 * 3. 전체 상품 보기 링크
 *
 * 구현 로직:
 * - Server Component로 상품 데이터 조회
 * - 반응형 그리드 레이아웃
 * - 에러 핸들링 및 로딩 상태 처리
 *
 * @dependencies
 * - actions/get-products: 상품 데이터 조회 Server Actions
 * - components/product-card: 상품 카드 컴포넌트
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getLatestProducts, getAllProducts } from "@/actions/get-products";

export default async function Home() {
  try {
    console.group("[Home] 홈페이지 상품 데이터 조회 시작");

    // 최신 상품과 전체 상품을 병렬로 조회
    const [latestProducts, allProducts] = await Promise.all([
      getLatestProducts(8),
      getAllProducts(12),
    ]);

    console.log("[Home] 최신 상품 개수:", latestProducts.length);
    console.log("[Home] 전체 상품 개수:", allProducts.length);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl space-y-16">
          {/* 최신 상품 섹션 */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">최신 상품</h2>
            </div>
            {latestProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  등록된 상품이 없습니다.
                </p>
              </div>
            )}
          </section>

          {/* 전체 상품 미리보기 섹션 */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">전체 상품</h2>
              <Link href="/products">
                <Button variant="outline" size="sm">
                  전체 상품 보기
                </Button>
              </Link>
            </div>
            {allProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  등록된 상품이 없습니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[Home] 에러 발생:", error);
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
