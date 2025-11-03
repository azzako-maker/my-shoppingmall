/**
 * @file product-breadcrumb.tsx
 * @description 상품 상세 페이지용 브레드크럼 네비게이션 컴포넌트
 *
 * 상품 상세 페이지에 사용되는 브레드크럼 네비게이션으로,
 * 사용자가 현재 위치를 파악하고 쉽게 이전 단계로 이동할 수 있도록 합니다.
 *
 * 주요 기능:
 * 1. 홈 링크 (항상 표시)
 * 2. 카테고리/상품 목록 링크 (카테고리가 있으면 카테고리 필터링 링크, 없으면 전체 상품 목록)
 * 3. 현재 상품명 (클릭 불가)
 *
 * 브레드크럼 구조:
 * - 홈 > 카테고리 > 상품명 (카테고리가 있는 경우)
 * - 홈 > 상품 목록 > 상품명 (카테고리가 없는 경우)
 *
 * @dependencies
 * - components/ui/breadcrumb: shadcn/ui Breadcrumb 컴포넌트
 * - constants/categories: 카테고리 상수 및 유틸리티 함수
 * - lucide-react: 아이콘
 * - next/link: Next.js 라우팅
 */

import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCategoryName, type CategoryId } from "@/constants/categories";

interface ProductBreadcrumbProps {
  /**
   * 현재 상품명
   */
  productName: string;
  /**
   * 상품 카테고리 ID (null이면 카테고리 링크 없음)
   */
  category?: CategoryId;
}

export function ProductBreadcrumb({
  productName,
  category,
}: ProductBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* 홈 */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>홈</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* 카테고리 또는 상품 목록 */}
        <BreadcrumbItem>
          {category ? (
            <BreadcrumbLink asChild>
              <Link href={`/products?category=${category}`}>
                {getCategoryName(category)}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/products">상품 목록</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* 현재 상품명 */}
        <BreadcrumbItem>
          <BreadcrumbPage>{productName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

