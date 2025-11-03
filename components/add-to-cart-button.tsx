/**
 * @file add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 사용하는 장바구니 추가 버튼
 * - Clerk 인증 확인
 * - 수량 선택 컴포넌트와 연동
 * - 성공/실패 피드백
 *
 * @dependencies
 * - actions/cart: 장바구니 추가 Server Action
 * - components/ui/button: shadcn/ui Button 컴포넌트
 * - @clerk/nextjs: Clerk 인증 확인
 */

"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProductQuantitySelector } from "@/components/product-quantity-selector";
import { AddToCartDialog } from "@/components/add-to-cart-dialog";
import { addToCart } from "@/actions/cart";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";

interface AddToCartButtonProps {
  productId: string;
  product: Product; // Dialog에 표시하기 위한 상품 정보
  maxQuantity: number;
  disabled?: boolean;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 */
export function AddToCartButton({
  productId,
  product,
  maxQuantity,
  disabled = false,
}: AddToCartButtonProps) {
  const { isSignedIn } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const [showDialog, setShowDialog] = useState(false);

  /**
   * 장바구니 추가 핸들러
   */
  const handleAddToCart = async () => {
    if (disabled || isLoading) return;

    // 미로그인 사용자 처리
    if (!isSignedIn) {
      setMessage("로그인 후 장바구니에 추가할 수 있습니다.");
      setMessageType("error");
      // 메시지 5초 후 자동 제거
      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      console.log("[AddToCartButton] 장바구니 추가 시도:", {
        productId,
        quantity,
      });

      const result = await addToCart(productId, quantity);

      if (result.success) {
        console.log("[AddToCartButton] 장바구니 추가 성공");
        // Dialog 표시
        setShowDialog(true);
      } else {
        setMessage(result.message);
        setMessageType("error");
        console.warn("[AddToCartButton] 장바구니 추가 실패:", result.message);

        // 에러 메시지 5초 후 자동 제거
        setTimeout(() => {
          setMessage(null);
          setMessageType(null);
        }, 5000);
      }
    } catch (error) {
      console.error("[AddToCartButton] 예외 발생:", error);
      setMessage("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setMessageType("error");

      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 수량 선택 */}
      <div>
        <ProductQuantitySelector
          min={1}
          max={maxQuantity}
          defaultValue={quantity}
          onQuantityChange={setQuantity}
          disabled={disabled}
        />
      </div>

      {/* 장바구니 추가 버튼 */}
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        size="lg"
        className="w-full text-lg"
      >
        {isLoading ? (
          <>
            <span className="mr-2">추가 중...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            장바구니에 추가
          </>
        )}
      </Button>

      {/* 피드백 메시지 */}
      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* 미로그인 안내 */}
      {!isSignedIn && !message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          로그인 후 장바구니에 추가할 수 있습니다.
        </p>
      )}

      {/* 장바구니 추가 성공 Dialog */}
      <AddToCartDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        product={product}
        quantity={quantity}
      />
    </div>
  );
}

