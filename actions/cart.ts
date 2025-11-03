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
import { CartItemWithProduct } from "@/types/cart";

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

/**
 * 장바구니 아이템 조회 (상품 정보 포함)
 * @returns 장바구니 아이템 배열 (상품 정보 JOIN)
 */
export async function getCartItems(): Promise<CartItemWithProduct[]> {
  try {
    console.group("[getCartItems] 장바구니 조회 시작");

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[getCartItems] 인증되지 않은 사용자");
      console.groupEnd();
      return [];
    }

    const supabase = getServiceRoleClient();

    // cart_items와 products 테이블 JOIN
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          description,
          price,
          category,
          stock_quantity,
          is_active,
          created_at,
          updated_at
        )
      `,
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getCartItems] 장바구니 조회 에러:", error);
      console.groupEnd();
      throw error;
    }

    if (!cartItems || cartItems.length === 0) {
      console.log("[getCartItems] 장바구니가 비어있음");
      console.groupEnd();
      return [];
    }

    // 타입 변환 (Supabase JOIN 결과를 CartItemWithProduct로 변환)
    const items: CartItemWithProduct[] = cartItems
      .filter((item) => item.products !== null) // products가 null인 경우 필터링
      .map((item: any) => ({
        id: item.id,
        clerk_id: item.clerk_id,
        product_id: item.product_id,
        quantity: item.quantity,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product: item.products,
      }));

    console.log("[getCartItems] 조회 완료, 아이템 개수:", items.length);
    console.groupEnd();

    return items;
  } catch (error) {
    console.error("[getCartItems] 예외 발생:", error);
    console.groupEnd();
    return [];
  }
}

/**
 * 장바구니 아이템 개수 조회
 * @returns 장바구니 아이템 개수
 */
export async function getCartItemsCount(): Promise<number> {
  try {
    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return 0;
    }

    const supabase = getServiceRoleClient();

    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("clerk_id", userId);

    if (error) {
      console.error("[getCartItemsCount] 장바구니 개수 조회 에러:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[getCartItemsCount] 예외 발생:", error);
    return 0;
  }
}

/**
 * 장바구니 아이템 수량 변경
 * @param cartItemId 장바구니 아이템 ID
 * @param quantity 변경할 수량
 * @returns 성공 여부와 메시지
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("[updateCartItemQuantity] 장바구니 수량 변경 시작");
    console.log("장바구니 아이템 ID:", cartItemId, "변경할 수량:", quantity);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[updateCartItemQuantity] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 수량 유효성 검사
    if (!quantity || quantity < 1) {
      console.warn("[updateCartItemQuantity] 잘못된 수량:", quantity);
      console.groupEnd();
      return {
        success: false,
        message: "수량은 1개 이상이어야 합니다.",
      };
    }

    const supabase = getServiceRoleClient();

    // 장바구니 아이템 조회 (상품 정보 포함)
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        products (
          id,
          name,
          stock_quantity,
          is_active
        )
      `,
      )
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .single();

    if (fetchError || !cartItem) {
      console.error("[updateCartItemQuantity] 장바구니 아이템 조회 에러:", fetchError);
      console.groupEnd();
      return {
        success: false,
        message: "장바구니 아이템을 찾을 수 없습니다.",
      };
    }

    // 상품 정보 확인
    const product = cartItem.products as any;
    if (!product || !product.is_active) {
      console.warn("[updateCartItemQuantity] 상품을 찾을 수 없거나 비활성화됨");
      console.groupEnd();
      return {
        success: false,
        message: "상품을 찾을 수 없거나 현재 판매 중이 아닙니다.",
      };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      console.warn("[updateCartItemQuantity] 재고 부족:", {
        요청_수량: quantity,
        현재_재고: product.stock_quantity,
      });
      console.groupEnd();
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 수량 업데이트
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (updateError) {
      console.error("[updateCartItemQuantity] 수량 업데이트 에러:", updateError);
      console.groupEnd();
      return {
        success: false,
        message: "수량을 변경하는 중 오류가 발생했습니다.",
      };
    }

    console.log("[updateCartItemQuantity] 수량 변경 완료:", {
      상품명: product.name,
      새_수량: quantity,
    });
    console.groupEnd();

    return {
      success: true,
      message: "수량이 변경되었습니다.",
    };
  } catch (error) {
    console.error("[updateCartItemQuantity] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 장바구니 아이템 삭제 (개별)
 * @param cartItemId 장바구니 아이템 ID
 * @returns 성공 여부와 메시지
 */
export async function removeCartItem(
  cartItemId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("[removeCartItem] 장바구니 아이템 삭제 시작");
    console.log("장바구니 아이템 ID:", cartItemId);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[removeCartItem] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = getServiceRoleClient();

    // 장바구니 아이템 삭제
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (error) {
      console.error("[removeCartItem] 삭제 에러:", error);
      console.groupEnd();
      return {
        success: false,
        message: "장바구니에서 삭제하는 중 오류가 발생했습니다.",
      };
    }

    console.log("[removeCartItem] 삭제 완료");
    console.groupEnd();

    return {
      success: true,
      message: "장바구니에서 삭제되었습니다.",
    };
  } catch (error) {
    console.error("[removeCartItem] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 장바구니 아이템 일괄 삭제
 * @param cartItemIds 삭제할 장바구니 아이템 ID 배열
 * @returns 성공 여부와 메시지
 */
export async function removeCartItems(
  cartItemIds: string[],
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("[removeCartItems] 장바구니 일괄 삭제 시작");
    console.log("삭제할 아이템 개수:", cartItemIds.length);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[removeCartItems] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    if (!cartItemIds || cartItemIds.length === 0) {
      console.warn("[removeCartItems] 삭제할 아이템이 없음");
      console.groupEnd();
      return {
        success: false,
        message: "삭제할 아이템을 선택해주세요.",
      };
    }

    const supabase = getServiceRoleClient();

    // 장바구니 아이템 일괄 삭제
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", userId)
      .in("id", cartItemIds);

    if (error) {
      console.error("[removeCartItems] 일괄 삭제 에러:", error);
      console.groupEnd();
      return {
        success: false,
        message: "장바구니에서 삭제하는 중 오류가 발생했습니다.",
      };
    }

    console.log("[removeCartItems] 일괄 삭제 완료:", cartItemIds.length, "개");
    console.groupEnd();

    return {
      success: true,
      message: `${cartItemIds.length}개의 아이템이 삭제되었습니다.`,
    };
  } catch (error) {
    console.error("[removeCartItems] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 장바구니 총액 계산
 * @returns 장바구니 총액 정보
 */
export async function getCartTotal(): Promise<{
  subtotal: number;
  itemCount: number;
}> {
  try {
    console.group("[getCartTotal] 장바구니 총액 계산 시작");

    // 장바구니 아이템 조회
    const cartItems = await getCartItems();

    // 총액 계산
    let subtotal = 0;
    let itemCount = 0;

    for (const item of cartItems) {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      itemCount += item.quantity;
    }

    console.log("[getCartTotal] 계산 완료:", {
      총액: subtotal,
      아이템_개수: itemCount,
    });
    console.groupEnd();

    return {
      subtotal,
      itemCount,
    };
  } catch (error) {
    console.error("[getCartTotal] 예외 발생:", error);
    console.groupEnd();
    return {
      subtotal: 0,
      itemCount: 0,
    };
  }
}

