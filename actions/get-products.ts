/**
 * @file get-products.ts
 * @description 상품 데이터 조회 Server Actions
 *
 * Supabase에서 상품 데이터를 조회하는 Server Actions
 * - 최신 상품 조회 (created_at 기준 내림차순)
 * - 전체 상품 조회 (활성화된 상품만)
 * - 카테고리별 상품 조회
 * - 인기 상품 조회 (주문량 기준)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import { isValidCategory } from "@/constants/categories";

/**
 * 최신 상품 조회
 * @param limit 조회할 상품 개수 (기본값: 8)
 * @returns 최신 상품 배열
 */
export async function getLatestProducts(
  limit: number = 8,
): Promise<Product[]> {
  try {
    console.group("[getLatestProducts] 최신 상품 조회 시작");
    console.log("조회 개수:", limit);

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getLatestProducts] 에러:", error);
      throw error;
    }

    console.log("[getLatestProducts] 조회 성공, 상품 개수:", data?.length || 0);
    console.groupEnd();

    return (data as Product[]) || [];
  } catch (error) {
    console.error("[getLatestProducts] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 전체 상품 조회 (활성화된 상품만)
 * @param limit 조회할 상품 개수 (기본값: 12)
 * @returns 활성화된 상품 배열
 */
export async function getAllProducts(limit: number = 12): Promise<Product[]> {
  try {
    console.group("[getAllProducts] 전체 상품 조회 시작");
    console.log("조회 개수:", limit);

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .limit(limit);

    if (error) {
      console.error("[getAllProducts] 에러:", error);
      throw error;
    }

    console.log("[getAllProducts] 조회 성공, 상품 개수:", data?.length || 0);
    console.groupEnd();

    return (data as Product[]) || [];
  } catch (error) {
    console.error("[getAllProducts] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 카테고리별 상품 조회
 * @param category 카테고리 ID (null이면 전체 상품 조회)
 * @param limit 조회할 상품 개수 (기본값: 12)
 * @returns 카테고리별 상품 배열
 */
export async function getProductsByCategory(
  category: string | null,
  limit: number = 12,
): Promise<Product[]> {
  try {
    console.group("[getProductsByCategory] 카테고리별 상품 조회 시작");
    console.log("카테고리:", category || "전체");
    console.log("조회 개수:", limit);

    const supabase = createClerkSupabaseClient();

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    // 카테고리가 유효한 경우 필터링
    if (category && isValidCategory(category)) {
      query = query.eq("category", category);
      console.log("[getProductsByCategory] 카테고리 필터 적용:", category);
    } else if (category && !isValidCategory(category)) {
      console.warn(
        "[getProductsByCategory] 유효하지 않은 카테고리 ID, 전체 상품 조회:",
        category,
      );
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);

    if (error) {
      console.error("[getProductsByCategory] 에러:", error);
      throw error;
    }

    console.log(
      "[getProductsByCategory] 조회 성공, 상품 개수:",
      data?.length || 0,
    );
    console.groupEnd();

    return (data as Product[]) || [];
  } catch (error) {
    console.error("[getProductsByCategory] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 인기 상품 조회 (주문량 기준)
 * @param limit 조회할 상품 개수 (기본값: 6)
 * @returns 주문량 기준 인기 상품 배열
 */
export async function getPopularProducts(
  limit: number = 6,
): Promise<Product[]> {
  try {
    console.group("[getPopularProducts] 인기 상품 조회 시작");
    console.log("조회 개수:", limit);

    const supabase = createClerkSupabaseClient();

    // 1. 모든 활성화된 상품 조회
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true);

    if (productsError || !products || products.length === 0) {
      console.warn(
        "[getPopularProducts] 활성화된 상품 없음, 최신 상품으로 대체",
      );
      return getLatestProducts(limit);
    }

    const productIds = products.map((p) => p.id);
    console.log("[getPopularProducts] 조회할 상품 개수:", productIds.length);

    // 2. order_items에서 각 상품별 주문 수량 합계 조회
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity");

    // 주문 데이터가 없으면 최신 상품으로 대체
    if (orderItemsError || !orderItems || orderItems.length === 0) {
      console.log(
        "[getPopularProducts] 주문 데이터 없음, 최신 상품으로 대체",
      );
      return getLatestProducts(limit);
    }

    // 3. 상품별 주문량 계산
    const salesMap = new Map<string, number>();
    for (const item of orderItems) {
      const current = salesMap.get(item.product_id) || 0;
      salesMap.set(item.product_id, current + (item.quantity || 0));
    }

    console.log(
      "[getPopularProducts] 주문량이 있는 상품 개수:",
      salesMap.size,
    );

    // 4. 주문량 기준으로 정렬된 상품 ID 배열 생성
    const sortedProductIds = Array.from(salesMap.entries())
      .sort((a, b) => {
        // 주문량 내림차순
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        return 0;
      })
      .map(([productId]) => productId)
      .slice(0, limit);

    // 5. 정렬된 상품 ID로 상품 정보 조회
    if (sortedProductIds.length === 0) {
      console.log(
        "[getPopularProducts] 정렬된 상품 없음, 최신 상품으로 대체",
      );
      return getLatestProducts(limit);
    }

    const { data: popularProducts, error: popularError } = await supabase
      .from("products")
      .select("*")
      .in("id", sortedProductIds)
      .eq("is_active", true);

    if (popularError) {
      console.error("[getPopularProducts] 상품 조회 에러:", popularError);
      return getLatestProducts(limit);
    }

    // 6. 주문량 순서대로 재정렬
    const orderedProducts = sortedProductIds
      .map((id) => popularProducts?.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    console.log(
      "[getPopularProducts] 조회 성공, 상품 개수:",
      orderedProducts.length,
    );
    console.log(
      "[getPopularProducts] 주문량 정보:",
      orderedProducts.map((p) => ({
        name: p.name,
        total_sold: salesMap.get(p.id) || 0,
      })),
    );
    console.groupEnd();

    return orderedProducts;
  } catch (error) {
    console.error("[getPopularProducts] 예외 발생:", error);
    console.groupEnd();
    // 예외 발생 시 최신 상품으로 대체
    console.warn("[getPopularProducts] 예외 발생, 최신 상품으로 대체");
    return getLatestProducts(limit);
  }
}

