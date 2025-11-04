-- ==========================================
-- 결제 관련 필드 추가 마이그레이션
-- orders 테이블에 Toss Payments 결제 정보 저장을 위한 필드 추가
-- ==========================================

-- orders 테이블에 결제 관련 필드 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_info JSONB;

-- 인덱스 생성 (결제 ID로 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id) WHERE payment_id IS NOT NULL;

-- 인덱스 생성 (결제 상태로 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status) WHERE payment_status IS NOT NULL;

