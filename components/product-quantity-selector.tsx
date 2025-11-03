/**
 * @file product-quantity-selector.tsx
 * @description 상품 수량 선택 컴포넌트
 *
 * 상품 상세 페이지에서 사용하는 수량 선택 UI 컴포넌트
 * - 수량 증가/감소 버튼
 * - 숫자 입력 필드 (직접 입력 가능)
 * - 재고 한도 확인
 * - 반응형 디자인
 *
 * @dependencies
 * - components/ui/button: shadcn/ui Button 컴포넌트
 * - components/ui/input: shadcn/ui Input 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface ProductQuantitySelectorProps {
  /** 최소 수량 (기본값: 1) */
  min?: number;
  /** 최대 수량 (재고 수량) */
  max: number;
  /** 초기 수량 (기본값: 1) */
  defaultValue?: number;
  /** 수량 변경 핸들러 */
  onQuantityChange?: (quantity: number) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 상품 수량 선택 컴포넌트
 */
export function ProductQuantitySelector({
  min = 1,
  max,
  defaultValue = 1,
  onQuantityChange,
  disabled = false,
}: ProductQuantitySelectorProps) {
  const [quantity, setQuantity] = useState<number>(
    Math.max(min, Math.min(defaultValue, max)),
  );

  // 초기값이 변경되면 상태 업데이트
  useEffect(() => {
    const initialValue = Math.max(min, Math.min(defaultValue, max));
    setQuantity(initialValue);
  }, [defaultValue, min, max]);

  // 수량 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(quantity);
    }
  }, [quantity, onQuantityChange]);

  /**
   * 수량 증가
   */
  const handleIncrement = () => {
    if (disabled) return;
    const newQuantity = Math.min(quantity + 1, max);
    setQuantity(newQuantity);
  };

  /**
   * 수량 감소
   */
  const handleDecrement = () => {
    if (disabled) return;
    const newQuantity = Math.max(quantity - 1, min);
    setQuantity(newQuantity);
  };

  /**
   * 직접 입력 핸들러
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const value = e.target.value;

    // 빈 문자열 허용 (사용자가 지우는 중일 수 있음)
    if (value === "") {
      setQuantity(min);
      return;
    }

    // 숫자만 허용
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      return;
    }

    // 범위 내로 제한
    const clampedValue = Math.max(min, Math.min(numValue, max));
    setQuantity(clampedValue);
  };

  /**
   * 포커스 아웃 시 유효성 검사
   */
  const handleBlur = () => {
    if (quantity < min) {
      setQuantity(min);
    } else if (quantity > max) {
      setQuantity(max);
    }
  };

  const isDecrementDisabled = disabled || quantity <= min;
  const isIncrementDisabled = disabled || quantity >= max;
  const isOutOfStock = max === 0;

  if (isOutOfStock) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          품절
        </p>
        <div className="flex items-center gap-2 opacity-50">
          <Button variant="outline" size="icon" disabled>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={0}
            disabled
            className="w-20 text-center"
          />
          <Button variant="outline" size="icon" disabled>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          aria-label="수량 감소"
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          disabled={disabled}
          className="w-20 text-center text-lg font-semibold"
          aria-label="수량 입력"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          aria-label="수량 증가"
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {max < 10 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          재고가 부족합니다 ({max}개 남음)
        </p>
      )}
    </div>
  );
}

