/**
 * @file cart-item-card.tsx
 * @description 장바구니 아이템 카드 컴포넌트
 *
 * 장바구니에 담긴 개별 상품을 표시하는 컴포넌트
 * - 상품 이미지, 이름, 가격, 수량, 소계 표시
 * - 수량 조절 및 삭제 기능
 * - 재고 부족 경고 표시
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductQuantitySelector } from "@/components/product-quantity-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CartItemWithProduct } from "@/types/cart";
import {
  updateCartItemQuantity,
  removeCartItem,
} from "@/actions/cart";

interface CartItemCardProps {
  item: CartItemWithProduct;
  onUpdate?: () => void; // 업데이트 후 콜백
}

export function CartItemCard({ item, onUpdate }: CartItemCardProps) {
  const router = useRouter();
  const { product, quantity, id } = item;
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = product.price * currentQuantity;
  const isLowStock = product.stock_quantity < 10;
  const isOutOfStock = product.stock_quantity === 0;

  /**
   * 수량 변경 핸들러
   */
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === quantity) return; // 변경 없음

    setIsUpdating(true);
    setErrorMessage(null);

    const result = await updateCartItemQuantity(id, newQuantity);

    if (result.success) {
      setCurrentQuantity(newQuantity);
      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } else {
      setErrorMessage(result.message);
      setCurrentQuantity(quantity); // 원래 수량으로 복구
    }

    setIsUpdating(false);
  };

  /**
   * 삭제 핸들러
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    const result = await removeCartItem(id);

    if (result.success) {
      setShowDeleteDialog(false);
      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } else {
      setErrorMessage(result.message);
    }

    setIsDeleting(false);
  };

  return (
    <>
      <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        {/* 체크박스 (일괄 삭제용, 추후 구현) */}
        <div className="flex-shrink-0 pt-1">
          {/* TODO: 체크박스 추가 */}
        </div>

        {/* 상품 이미지 (플레이스홀더) */}
        <Link
          href={`/products/${product.id}`}
          className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
        >
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
            이미지
          </div>
          {/* 재고 부족 뱃지 */}
          {isOutOfStock && (
            <div className="absolute top-1 right-1 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              품절
            </div>
          )}
        </Link>

        {/* 상품 정보 */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            {/* 상품명 */}
            <Link
              href={`/products/${product.id}`}
              className="text-base font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            >
              {product.name}
            </Link>

            {/* 단가 */}
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {product.price.toLocaleString("ko-KR")}원
            </p>

            {/* 재고 상태 */}
            {isLowStock && !isOutOfStock && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                재고 부족 ({product.stock_quantity}개 남음)
              </p>
            )}
          </div>

          {/* 수량 선택기 및 소계 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProductQuantitySelector
                min={1}
                max={product.stock_quantity}
                defaultValue={currentQuantity}
                onQuantityChange={handleQuantityChange}
                disabled={isUpdating || isOutOfStock}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="h-10 w-10 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="장바구니에서 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {subtotal.toLocaleString("ko-KR")}원
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* 삭제 확인 Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>장바구니에서 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 상품을 장바구니에서 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
