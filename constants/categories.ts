/**
 * @file categories.ts
 * @description 카테고리 상수 정의
 *
 * 쇼핑몰에서 사용하는 상품 카테고리 목록과 타입 정의
 * update_shopping_mall_schema.sql의 샘플 데이터에서 사용된 카테고리 기준
 */

/**
 * 카테고리 ID와 표시명 매핑
 */
export const CATEGORIES = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
} as const;

/**
 * 카테고리 ID 타입
 */
export type CategoryId = keyof typeof CATEGORIES | null;

/**
 * 카테고리 표시명 조회
 * @param categoryId 카테고리 ID (null이면 "전체" 반환)
 * @returns 카테고리 표시명
 */
export function getCategoryName(categoryId: CategoryId): string {
  if (categoryId === null) {
    return "전체";
  }
  return CATEGORIES[categoryId] || categoryId;
}

/**
 * 유효한 카테고리 ID인지 확인
 * @param categoryId 확인할 카테고리 ID
 * @returns 유효한 카테고리인지 여부
 */
export function isValidCategory(
  categoryId: string | null | undefined,
): categoryId is keyof typeof CATEGORIES {
  if (!categoryId || categoryId === "null") {
    return false;
  }
  return categoryId in CATEGORIES;
}

/**
 * 모든 카테고리 ID 배열
 */
export const CATEGORY_IDS = Object.keys(CATEGORIES) as Array<
  keyof typeof CATEGORIES
>;

