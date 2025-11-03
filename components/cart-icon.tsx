/**
 * @file cart-icon.tsx
 * @description 장바구니 아이콘 컴포넌트
 *
 * Navbar에서 사용하는 장바구니 아이콘 및 개수 표시
 * - 장바구니 아이템 개수 조회
 * - 뱃지로 개수 표시
 * - 클릭 시 장바구니 페이지로 이동
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartItemsCount } from "@/actions/cart";

export function CartIcon() {
  const [count, setCount] = useState<number>(0);

  // 장바구니 개수 조회
  useEffect(() => {
    const fetchCount = async () => {
      const cartCount = await getCartItemsCount();
      setCount(cartCount);
    };

    fetchCount();

    // 주기적으로 개수 갱신 (간단한 방법)
    const interval = setInterval(fetchCount, 5000); // 5초마다 갱신

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center"
      aria-label="장바구니"
    >
      <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
