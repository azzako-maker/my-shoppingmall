/**
 * @file app/orders/[id]/page.tsx
 * @description 주문 완료 페이지
 *
 * 주문 생성 후 주문 상세 정보를 표시하는 페이지
 *
 * 주요 기능:
 * 1. 주문 정보 조회 및 표시
 * 2. 주문 번호, 날짜, 상태 표시
 * 3. 배송지 정보 표시
 * 4. 주문 상품 목록 표시
 * 5. 총액 표시
 *
 * 구현 로직:
 * - Server Component로 주문 데이터 조회
 * - URL 파라미터에서 주문 ID 추출
 * - 본인 주문만 조회 가능 (보안)
 * - 주문이 없으면 404 페이지 표시
 *
 * @dependencies
 * - actions/orders: 주문 조회 Server Action
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { OrderStatus } from "@/types/order";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 주문 상태별 뱃지 스타일
 */
function getStatusBadge(status: OrderStatus) {
  const statusConfig = {
    pending: {
      label: "주문 대기중",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    confirmed: {
      label: "주문 확인됨",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    shipped: {
      label: "배송중",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
    delivered: {
      label: "배송완료",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    cancelled: {
      label: "주문 취소됨",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/**
 * 날짜 포맷팅 (한국 시간)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * 주문 번호 포맷팅 (UUID 일부만 표시)
 */
function formatOrderId(orderId: string): string {
  return `ORD-${orderId.substring(0, 8).toUpperCase()}`;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  try {
    console.group("[OrderDetailPage] 주문 상세 페이지 렌더링 시작");

    // URL 파라미터에서 주문 ID 추출
    const { id } = await params;
    console.log("[OrderDetailPage] 주문 ID:", id);

    // 주문 정보 조회
    const order = await getOrderById(id);

    if (!order) {
      console.warn("[OrderDetailPage] 주문을 찾을 수 없음:", id);
      console.groupEnd();
      notFound();
    }

    console.log("[OrderDetailPage] 주문 조회 완료:", {
      주문_ID: order.id,
      총액: order.total_amount,
      상품_개수: order.order_items.length,
    });
    console.groupEnd();

    const formattedOrderId = formatOrderId(order.id);
    const formattedDate = formatDate(order.created_at);
    const formattedTotal = new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(order.total_amount);

    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* 뒤로가기 버튼 */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </Link>

          {/* 주문 완료 헤더 */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
              주문이 완료되었습니다
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              주문하신 내역은 아래와 같습니다.
            </p>
          </div>

          {/* 주문 정보 카드 */}
          <div className="space-y-6">
            {/* 주문 기본 정보 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                주문 정보
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    주문 번호
                  </span>
                  <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formattedOrderId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    주문 날짜
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formattedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    주문 상태
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>

            {/* 배송지 정보 */}
            {order.shipping_address && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  배송지 정보
                </h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      받는 사람:
                    </span>{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      {order.shipping_address.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      전화번호:
                    </span>{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      {order.shipping_address.phone}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      우편번호:
                    </span>{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      {order.shipping_address.postcode}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      주소:
                    </span>{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      {order.shipping_address.address}{" "}
                      {order.shipping_address.detailAddress}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 주문 메모 */}
            {order.order_note && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  주문 메모
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {order.order_note}
                </p>
              </div>
            )}

            {/* 주문 상품 목록 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                주문 상품
              </h2>
              <div className="space-y-4">
                {order.order_items.map((item) => {
                  const itemSubtotal = item.price * item.quantity;
                  const formattedPrice = new Intl.NumberFormat("ko-KR", {
                    style: "currency",
                    currency: "KRW",
                  }).format(item.price);
                  const formattedSubtotal = new Intl.NumberFormat("ko-KR", {
                    style: "currency",
                    currency: "KRW",
                  }).format(itemSubtotal);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                        >
                          {item.product_name}
                        </Link>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {formattedPrice} × {item.quantity}개
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {formattedSubtotal}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 총액 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  총액
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formattedTotal}
                </span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button className="w-full" size="lg" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  홈으로 돌아가기
                </Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button className="w-full" size="lg">
                  쇼핑 계속하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[OrderDetailPage] 에러 발생:", error);
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-bold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 dark:text-red-400">
              주문 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {error instanceof Error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-500">
                {error.message}
              </p>
            )}
            <div className="mt-6">
              <Link href="/">
                <Button variant="outline">홈으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

