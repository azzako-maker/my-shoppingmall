/**
 * @file cart-item-list.tsx
 * @description 장바구니 아이템 목록 컴포넌트 (일괄 삭제 기능 포함)
 *
 * 장바구니 아이템 목록을 표시하고 일괄 삭제 기능을 제공하는 Client Component
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시
 * 2. 체크박스를 통한 아이템 선택
 * 3. 전체 선택/해제 기능
 * 4. 선택된 아이템 일괄 삭제
 * 5. 일괄 삭제 확인 모달
 *
 * 구현 로직:
 * - 체크박스 선택 상태를 useState로 관리
 * - 전체 선택 시 모든 아이템 선택, 해제 시 모두 해제
 * - 선택된 아이템 ID 배열을 관리
 * - removeCartItems() Server Action 호출하여 일괄 삭제
 * - 삭제 후 페이지 새로고침
 *
 * @dependencies
 * - components/cart-item-card: 개별 아이템 카드 컴포넌트
 * - components/ui/checkbox: 체크박스 컴포넌트
 * - components/ui/button: 버튼 컴포넌트
 * - components/ui/dialog: 확인 모달 컴포넌트
 * - actions/cart: 장바구니 일괄 삭제 Server Action
 * - next/navigation: 페이지 새로고침
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CartItemCard } from "@/components/cart-item-card";
import { CartItemWithProduct } from "@/types/cart";
import { removeCartItems } from "@/actions/cart";

interface CartItemListProps {
  items: CartItemWithProduct[];
}

export function CartItemList({ items }: CartItemListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 전체 선택 여부 계산
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        // 모든 아이템 선택
        setSelectedIds(new Set(items.map((item) => item.id)));
      } else {
        // 모든 아이템 해제
        setSelectedIds(new Set());
      }
    },
    [items],
  );

  /**
   * 개별 아이템 선택/해제 핸들러
   */
  const handleItemCheckedChange = useCallback(
    (itemId: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });
    },
    [],
  );

  /**
   * 일괄 삭제 핸들러
   */
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    setErrorMessage(null);

    const itemIdsArray = Array.from(selectedIds);
    const result = await removeCartItems(itemIdsArray);

    if (result.success) {
      setShowDeleteDialog(false);
      setSelectedIds(new Set());
      router.refresh(); // 페이지 새로고침으로 장바구니 목록 업데이트
    } else {
      setErrorMessage(result.message);
    }

    setIsDeleting(false);
  };

  // 아이템이 변경되면 선택 상태 초기화
  useEffect(() => {
    setSelectedIds(new Set());
  }, [items.length]);

  return (
    <div className="space-y-4">
      {/* 전체 선택 및 일괄 삭제 버튼 */}
      {items.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="전체 선택"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedIds.size > 0
                ? `${selectedIds.size}개 선택됨`
                : "전체 선택"}
            </span>
          </div>

          {/* 일괄 삭제 버튼 */}
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              선택 삭제 ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* 장바구니 아이템 목록 */}
      <div className="space-y-4">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            checked={selectedIds.has(item.id)}
            onCheckedChange={(checked) =>
              handleItemCheckedChange(item.id, checked)
            }
          />
        ))}
      </div>

      {/* 일괄 삭제 확인 Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>선택한 상품 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedIds.size}개의 상품을 장바구니에서 삭제하시겠습니까?
              이 작업은 취소할 수 없습니다.
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
              onClick={handleBatchDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

