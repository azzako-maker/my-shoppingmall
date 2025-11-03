/**
 * @file add-to-cart-dialog.tsx
 * @description 장바구니 추가 후 Dialog 컴포넌트
 *
 * 장바구니 추가 성공 시 표시되는 Dialog
 * - 추가된 상품 정보 표시
 * - "장바구니로 이동" 버튼 (클릭 시 /cart로 이동)
 * - "쇼핑 계속하기" 버튼 (클릭 시 /products로 이동)
 */

"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  quantity: number;
}

export function AddToCartDialog({
  open,
  onOpenChange,
  product,
  quantity,
}: AddToCartDialogProps) {
  const router = useRouter();
  const totalPrice = product.price * quantity;

  const handleGoToCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
    router.push("/products");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle>장바구니에 추가되었습니다</DialogTitle>
          </div>
          <DialogDescription>
            선택하신 상품이 장바구니에 추가되었습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 추가된 상품 정보 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {product.name}
            </p>
            <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>수량: {quantity}개</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {totalPrice.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleContinueShopping}
            className="w-full sm:w-auto"
          >
            쇼핑 계속하기
          </Button>
          <Button
            onClick={handleGoToCart}
            className="w-full sm:w-auto"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            장바구니로 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
