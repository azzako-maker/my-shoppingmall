/**
 * @file orders.ts
 * @description 주문 관련 Server Actions
 *
 * 주문 생성, 조회, 상태 변경 기능을 제공하는 Server Actions
 * - Clerk 인증 확인
 * - 장바구니 아이템 기반 주문 생성
 * - 트랜잭션 처리
 * - 주문 상태 관리
 * - 주문 목록 조회
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getCartItems } from "@/actions/cart";
import {
  ShippingAddress,
  OrderWithItems,
  Order,
  OrderStatus,
} from "@/types/order";
import { canUpdateOrderStatus, getOrderStatusLabel } from "@/lib/utils/orders";

/**
 * 주문 생성 결과
 */
export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  message: string;
}

/**
 * 주문 생성
 * @param shippingAddress 배송지 정보
 * @param orderNote 주문 메모 (선택사항)
 * @returns 주문 생성 결과
 */
export async function createOrder(
  shippingAddress: ShippingAddress,
  orderNote?: string | null,
): Promise<CreateOrderResult> {
  try {
    console.group("[createOrder] 주문 생성 시작");
    console.log("배송지 정보:", shippingAddress);
    console.log("주문 메모:", orderNote || "(없음)");

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[createOrder] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다. 로그인 후 주문할 수 있습니다.",
      };
    }

    // 장바구니 아이템 조회
    const cartItems = await getCartItems();

    console.log("[createOrder] 장바구니 아이템 개수:", cartItems.length);

    // 빈 장바구니 확인
    if (cartItems.length === 0) {
      console.warn("[createOrder] 장바구니가 비어있음");
      console.groupEnd();
      return {
        success: false,
        message: "장바구니가 비어있습니다. 상품을 추가한 후 주문해주세요.",
      };
    }

    // 유효성 검증: 각 장바구니 아이템 확인
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      // 상품 존재 및 활성화 확인
      if (!product || !product.is_active) {
        console.warn("[createOrder] 비활성화된 상품 발견:", {
          productId: cartItem.product_id,
          productName: product?.name,
        });
        console.groupEnd();
        return {
          success: false,
          message: `"${product?.name || "알 수 없는 상품"}"은 현재 판매 중이 아닙니다. 장바구니에서 제거 후 다시 시도해주세요.`,
        };
      }

      // 재고 수량 확인
      if (product.stock_quantity < cartItem.quantity) {
        console.warn("[createOrder] 재고 부족:", {
          productId: cartItem.product_id,
          productName: product.name,
          요청_수량: cartItem.quantity,
          현재_재고: product.stock_quantity,
        });
        console.groupEnd();
        return {
          success: false,
          message: `"${product.name}"의 재고가 부족합니다. (요청: ${cartItem.quantity}개, 재고: ${product.stock_quantity}개)`,
        };
      }
    }

    // 총액 계산
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    console.log("[createOrder] 총액 계산:", {
      아이템_개수: cartItems.length,
      총액: totalAmount,
    });

    const supabase = getServiceRoleClient();

    // 1단계: orders 테이블 INSERT
    console.log("[createOrder] 1단계: orders 테이블 INSERT 시작");
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: userId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress as any, // JSONB 타입으로 저장
        order_note: orderNote || null,
      })
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("[createOrder] orders 테이블 INSERT 에러:", orderError);
      console.groupEnd();
      return {
        success: false,
        message: "주문을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    const orderId = orderData.id;
    console.log("[createOrder] 주문 생성 완료, 주문 ID:", orderId);

    // 2단계: order_items 테이블 INSERT (여러 개)
    console.log("[createOrder] 2단계: order_items 테이블 INSERT 시작");
    const orderItems = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("[createOrder] order_items 테이블 INSERT 에러:", orderItemsError);
      console.groupEnd();
      // 주문은 이미 생성되었으므로, 주문 삭제 시도 (선택사항)
      // 실제 운영에서는 더 정교한 롤백 처리가 필요할 수 있음
      return {
        success: false,
        message: "주문 상품 정보를 저장하는 중 오류가 발생했습니다. 고객센터로 문의해주세요.",
      };
    }

    console.log("[createOrder] 주문 상품 저장 완료:", orderItems.length, "개");

    // 3단계: cart_items 테이블 DELETE (장바구니 비우기)
    console.log("[createOrder] 3단계: 장바구니 비우기 시작");
    const { error: deleteCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", userId);

    if (deleteCartError) {
      console.error("[createOrder] cart_items 테이블 DELETE 에러:", deleteCartError);
      // 주문은 이미 생성되었으므로, 장바구니 삭제 실패는 경고만 남김
      console.warn(
        "[createOrder] 주문은 생성되었지만 장바구니 비우기 실패. 주문 ID:",
        orderId,
      );
    } else {
      console.log("[createOrder] 장바구니 비우기 완료");
    }

    console.log("[createOrder] 주문 생성 성공 완료:", {
      주문_ID: orderId,
      총액: totalAmount,
      상품_개수: cartItems.length,
    });
    console.groupEnd();

    return {
      success: true,
      orderId,
      message: "주문이 성공적으로 생성되었습니다.",
    };
  } catch (error) {
    console.error("[createOrder] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "주문을 생성하는 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

/**
 * 주문 조회 (본인 주문만 조회 가능)
 * @param orderId 주문 ID
 * @returns 주문 정보 (주문 아이템 포함) 또는 null
 */
export async function getOrderById(
  orderId: string,
): Promise<OrderWithItems | null> {
  try {
    console.group("[getOrderById] 주문 조회 시작");
    console.log("주문 ID:", orderId);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[getOrderById] 인증되지 않은 사용자");
      console.groupEnd();
      return null;
    }

    // UUID 형식 검증 (선택사항)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      console.warn("[getOrderById] 잘못된 주문 ID 형식:", orderId);
      console.groupEnd();
      return null;
    }

    const supabase = getServiceRoleClient();

    // 1단계: orders 테이블에서 주문 조회
    console.log("[getOrderById] 1단계: orders 테이블 조회 시작");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("clerk_id", userId) // 본인 주문만 조회
      .single();

    if (orderError || !order) {
      console.warn("[getOrderById] 주문을 찾을 수 없음:", {
        orderId,
        error: orderError?.message,
      });
      console.groupEnd();
      return null;
    }

    console.log("[getOrderById] 주문 조회 완료:", {
      주문_ID: order.id,
      총액: order.total_amount,
      상태: order.status,
    });

    // 2단계: order_items 테이블에서 주문 상품 조회
    console.log("[getOrderById] 2단계: order_items 테이블 조회 시작");
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (orderItemsError) {
      console.error("[getOrderById] order_items 조회 에러:", orderItemsError);
      console.groupEnd();
      return null;
    }

    console.log("[getOrderById] 주문 상품 조회 완료:", {
      상품_개수: orderItems?.length || 0,
    });

    // 주문 정보와 주문 아이템 합치기
    const orderWithItems: OrderWithItems = {
      ...order,
      order_items: orderItems || [],
      shipping_address: order.shipping_address as ShippingAddress | null,
    };

    console.log("[getOrderById] 주문 조회 성공 완료");
    console.groupEnd();

    return orderWithItems;
  } catch (error) {
    console.error("[getOrderById] 예외 발생:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 주문 상태 변경 (본인 주문만 변경 가능)
 * @param orderId 주문 ID
 * @param status 변경할 주문 상태
 * @returns 상태 변경 결과
 */
export interface UpdateOrderStatusResult {
  success: boolean;
  message: string;
}


export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  try {
    console.group("[updateOrderStatus] 주문 상태 변경 시작");
    console.log("주문 ID:", orderId, "변경할 상태:", status);

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[updateOrderStatus] 인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      console.warn("[updateOrderStatus] 잘못된 주문 ID 형식:", orderId);
      console.groupEnd();
      return {
        success: false,
        message: "올바르지 않은 주문 번호입니다.",
      };
    }

    const supabase = getServiceRoleClient();

    // 1단계: 주문 조회 및 권한 확인
    console.log("[updateOrderStatus] 1단계: 주문 조회 및 권한 확인 시작");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, clerk_id, status")
      .eq("id", orderId)
      .eq("clerk_id", userId) // 본인 주문만 조회
      .single();

    if (orderError || !order) {
      console.warn("[updateOrderStatus] 주문을 찾을 수 없거나 권한 없음:", {
        orderId,
        error: orderError?.message,
      });
      console.groupEnd();
      return {
        success: false,
        message: "주문을 찾을 수 없거나 접근 권한이 없습니다.",
      };
    }

    console.log("[updateOrderStatus] 현재 주문 상태:", order.status);

    // 2단계: 상태 변경 가능 여부 확인
    if (order.status === status) {
      console.log("[updateOrderStatus] 이미 해당 상태입니다.");
      console.groupEnd();
      return {
        success: false,
        message: "이미 해당 상태로 설정되어 있습니다.",
      };
    }

    if (!canUpdateOrderStatus(order.status, status)) {
      console.warn("[updateOrderStatus] 상태 변경 불가:", {
        현재_상태: order.status,
        변경하려는_상태: status,
      });
      console.groupEnd();
      return {
        success: false,
        message: `"${getOrderStatusLabel(order.status)}" 상태에서는 "${getOrderStatusLabel(status)}" 상태로 변경할 수 없습니다.`,
      };
    }

    // 3단계: 주문 상태 업데이트
    console.log("[updateOrderStatus] 2단계: 주문 상태 업데이트 시작");
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("clerk_id", userId); // 이중 확인 (보안)

    if (updateError) {
      console.error("[updateOrderStatus] 상태 업데이트 에러:", updateError);
      console.groupEnd();
      return {
        success: false,
        message: "주문 상태를 변경하는 중 오류가 발생했습니다.",
      };
    }

    console.log("[updateOrderStatus] 주문 상태 변경 성공:", {
      주문_ID: orderId,
      이전_상태: order.status,
      새_상태: status,
    });
    console.groupEnd();

    return {
      success: true,
      message: `주문 상태가 "${getOrderStatusLabel(status)}"로 변경되었습니다.`,
    };
  } catch (error) {
    console.error("[updateOrderStatus] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      message: "주문 상태를 변경하는 중 예상치 못한 오류가 발생했습니다.",
    };
  }
}

/**
 * 주문 목록 조회 (본인 주문만 조회 가능)
 * @param status 주문 상태 필터 (선택사항)
 * @returns 주문 목록
 */
export async function getOrders(
  status?: OrderStatus,
): Promise<Order[]> {
  try {
    console.group("[getOrders] 주문 목록 조회 시작");
    console.log("필터 상태:", status || "전체");

    // Clerk 사용자 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[getOrders] 인증되지 않은 사용자");
      console.groupEnd();
      return [];
    }

    const supabase = getServiceRoleClient();

    // 주문 목록 조회
    let query = supabase
      .from("orders")
      .select("*")
      .eq("clerk_id", userId) // 본인 주문만
      .order("created_at", { ascending: false }); // 최신순

    // 상태 필터 적용
    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("[getOrders] 주문 목록 조회 에러:", error);
      console.groupEnd();
      return [];
    }

    console.log("[getOrders] 주문 목록 조회 완료:", {
      주문_개수: orders?.length || 0,
      필터_상태: status || "전체",
    });
    console.groupEnd();

    // shipping_address를 ShippingAddress 타입으로 변환
    const typedOrders: Order[] = (orders || []).map((order) => ({
      ...order,
      shipping_address: order.shipping_address as ShippingAddress | null,
    }));

    return typedOrders;
  } catch (error) {
    console.error("[getOrders] 예외 발생:", error);
    console.groupEnd();
    return [];
  }
}


