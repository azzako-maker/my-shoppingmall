/**
 * @file category-filter.tsx
 * @description 카테고리 필터 컴포넌트
 *
 * 상품 목록 페이지에서 사용하는 카테고리 드롭다운 필터
 * - URL 쿼리 파라미터와 연동
 * - 카테고리 선택 시 URL 변경
 *
 * 주요 기능:
 * 1. 카테고리 드롭다운 표시
 * 2. 현재 선택된 카테고리 표시 (URL 기반)
 * 3. 카테고리 변경 시 URL 업데이트
 *
 * @dependencies
 * - components/ui/select: shadcn/ui Select 컴포넌트
 * - constants/categories: 카테고리 상수 정의
 * - next/navigation: Next.js 라우팅
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_IDS, getCategoryName } from "@/constants/categories";

/**
 * 카테고리 필터 컴포넌트
 * URL 쿼리 파라미터를 사용하여 카테고리 선택 상태 관리
 */
export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || null;

  /**
   * 카테고리 변경 핸들러
   * 선택된 카테고리에 따라 URL을 업데이트
   */
  const handleCategoryChange = (categoryId: string) => {
    console.log("[CategoryFilter] 카테고리 변경:", categoryId);
    
    // "전체" 선택 시 (value가 "all"인 경우)
    if (categoryId === "all" || categoryId === "") {
      router.push("/products");
      console.log("[CategoryFilter] 전체 상품으로 이동");
    } else {
      // 특정 카테고리 선택 시
      router.push(`/products?category=${categoryId}`);
      console.log("[CategoryFilter] 카테고리 페이지로 이동:", categoryId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category-filter" className="text-sm font-medium">
        카테고리:
      </label>
      <Select
        value={currentCategory || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger id="category-filter" className="w-[180px]">
          <SelectValue placeholder="전체" />
        </SelectTrigger>
        <SelectContent>
          {/* 전체 옵션 */}
          <SelectItem value="all">전체</SelectItem>
          {/* 각 카테고리 옵션 */}
          {CATEGORY_IDS.map((categoryId) => (
            <SelectItem key={categoryId} value={categoryId}>
              {getCategoryName(categoryId)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

