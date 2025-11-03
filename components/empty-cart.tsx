/**
 * @file empty-cart.tsx
 * @description 빈 장바구니 상태 UI 컴포넌트
 *
 * 장바구니가 비어있을 때 표시되는 컴포넌트
 */

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
      <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-500" />
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        장바구니가 비어있습니다
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        쇼핑을 시작하고 원하는 상품을 장바구니에 추가해보세요.
      </p>
      <Link href="/products" className="mt-6">
        <Button>쇼핑 계속하기</Button>
      </Link>
    </div>
  );
}
