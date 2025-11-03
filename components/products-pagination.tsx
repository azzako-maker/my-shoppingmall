/**
 * @file products-pagination.tsx
 * @description 상품 목록 페이지네이션 컴포넌트
 *
 * 상품 목록 페이지에서 사용하는 페이지네이션 UI 컴포넌트
 * - 이전/다음 버튼
 * - 페이지 번호 버튼 (현재 페이지 하이라이트)
 * - 첫 페이지/마지막 페이지 이동 버튼
 * - 반응형 디자인 (모바일에서는 간소화)
 * - URL 쿼리 파라미터로 페이지 상태 관리
 *
 * 주요 기능:
 * 1. 페이지 번호 버튼 표시 (현재 페이지 주변만 표시)
 * 2. 이전/다음 페이지 이동
 * 3. 첫 페이지/마지막 페이지 이동
 * 4. URL 쿼리 파라미터와 연동
 *
 * @dependencies
 * - components/ui/button: shadcn/ui Button 컴포넌트
 * - next/navigation: Next.js 라우팅
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

/**
 * 페이지네이션 컴포넌트
 * @param currentPage 현재 페이지 번호
 * @param totalPages 전체 페이지 수
 * @param total 전체 상품 개수
 */
export function ProductsPagination({
  currentPage,
  totalPages,
  total,
}: ProductsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  // 페이지 범위 계산 (현재 페이지 주변만 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 번호 개수

    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변만 표시
      if (currentPage <= 3) {
        // 처음 부분
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 끝 부분
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간 부분
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  /**
   * 페이지 이동 핸들러
   * URL 쿼리 파라미터를 업데이트하여 페이지 이동
   */
  const navigateToPage = (page: number) => {
    console.log("[ProductsPagination] 페이지 이동:", page);

    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      // 첫 페이지면 page 파라미터 제거
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    // 카테고리 파라미터 유지
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";

    router.push(url);
  };

  // 페이지가 1개 이하면 페이지네이션 숨김
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, total);

  return (
    <div className="flex flex-col items-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
      {/* 상품 개수 정보 */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {startItem}-{endItem} / 총 {total}개
      </p>

      {/* 페이지네이션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 첫 페이지로 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
          aria-label="첫 페이지로"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 이전 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 페이지 번호 버튼 */}
        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => navigateToPage(pageNumber)}
                className={`h-9 min-w-9 ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    : ""
                }`}
                aria-label={`${pageNumber}페이지로 이동`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* 모바일: 현재 페이지 표시 */}
        <div className="flex items-center gap-2 sm:hidden">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* 다음 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 마지막 페이지로 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
          aria-label="마지막 페이지로"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

