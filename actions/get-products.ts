/**
 * @file get-products.ts
 * @description 상품 데이터 조회 Server Actions
 *
 * Supabase에서 상품 데이터를 조회하는 Server Actions
 * - 최신 상품 조회 (created_at 기준 내림차순)
 * - 전체 상품 조회 (활성화된 상품만)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";

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

