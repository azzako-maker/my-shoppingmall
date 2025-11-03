/**
 * @file cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 장바구니 추가, 수량 변경, 삭제 등의 기능을 제공하는 Server Actions
 * - Clerk 인증 확인
 * - 재고 확인
 * - cart_items 테이블 조작
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getProductById } from "@/actions/get-products";

/**
 * 장바구니에 상품 추가
 * @param productId 상품 ID
 * @param quantity 추가할 수량
 * @returns 성공 여부와 메시지
 */
export async function addToCart(
  productId: string,
  quantity: number,
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("[addToCart] 장바구니 추가 시작");
    console.log("상품 ID:", productId, "수량:", quantity);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[addToCart] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다. 로그인 후 장바구니에 추가할 수 있습니다.",
      };
    }

    // 수량 유효성 검사
    if (!quantity || quantity < 1) {
      console.warn("[addToCart] 잘못된 수량:", quantity);
      console.groupEnd();
      return {
        success: false,
        message: "수량은 1개 이상이어야 합니다.",
      };
    }

    // 상품 존재 및 활성화 확인
    const product = await getProductById(productId);

    if (!product) {
      console.warn("[addToCart] 상품을 찾을 수 없음:", productId);
      console.groupEnd();
      return {
        success: false,
        message: "상품을 찾을 수 없거나 현재 판매 중이 아닙니다.",
      };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      console.warn("[addToCart] 재고 부족:", {
        요청_수량: quantity,
        현재_재고: product.stock_quantity,
      });
      console.groupEnd();
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 장바구니에 이미 같은 상품이 있는지 확인
    const supabase = getServiceRoleClient();

    const { data: existingCartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116은 레코드를 찾을 수 없음 (정상 케이스)
      console.error("[addToCart] 장바구니 조회 에러:", fetchError);
      console.groupEnd();
      return {
        success: false,
        message: "장바구니를 불러오는 중 오류가 발생했습니다.",
      };
    }

    let newQuantity = quantity;

    if (existingCartItem) {
      // 이미 장바구니에 있는 경우: 수량 증가
      newQuantity = existingCartItem.quantity + quantity;

      // 재고 확인 (기존 수량 + 새로 추가할 수량)
      if (product.stock_quantity < newQuantity) {
        console.warn("[addToCart] 재고 부족 (기존 수량 포함):", {
          기존_수량: existingCartItem.quantity,
          추가_수량: quantity,
          총_수량: newQuantity,
          현재_재고: product.stock_quantity,
        });
        console.groupEnd();
        return {
          success: false,
          message: `재고가 부족합니다. 장바구니에 이미 ${existingCartItem.quantity}개가 있습니다. (현재 재고: ${product.stock_quantity}개)`,
        };
      }

      // 수량 업데이트
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingCartItem.id);

      if (updateError) {
        console.error("[addToCart] 장바구니 업데이트 에러:", updateError);
        console.groupEnd();
        return {
          success: false,
          message: "장바구니에 추가하는 중 오류가 발생했습니다.",
        };
      }

      console.log("[addToCart] 장바구니 수량 업데이트 완료:", {
        기존_수량: existingCartItem.quantity,
        새_수량: newQuantity,
      });
      console.groupEnd();

      return {
        success: true,
        message: `장바구니에 추가되었습니다. (총 ${newQuantity}개)`,
      };
    } else {
      // 장바구니에 없는 경우: 새로 추가
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: userId,
          product_id: productId,
          quantity: quantity,
        });

      if (insertError) {
        console.error("[addToCart] 장바구니 추가 에러:", insertError);
        console.groupEnd();
        return {
          success: false,
          message: "장바구니에 추가하는 중 오류가 발생했습니다.",
        };
      }

      console.log("[addToCart] 장바구니에 상품 추가 완료:", {
        상품명: product.name,
        수량: quantity,
      });
      console.groupEnd();

      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
      };
    }
  } catch (error) {
    console.error("[addToCart] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

