# 쇼핑 sudden MVP 개발 TODO

## Phase 1: 기본 인프라 (1주) - ✅ 완료

- [x] Next.js 프로젝트 셋업
- [x] Supabase 프로젝트 생성
- [x] Clerk 연동 (회원가입/로그인)
  - [x] ClerkProvider 설정
  - [x] SyncUserProvider 구현
  - [x] 사용자 동기화 API
- [x] 기본 레이아웃 및 라우팅
  - [x] RootLayout 설정
  - [x] Navbar 컴포넌트
- [x] Supabase 데이터베이스 스키마 적용
  - [x] `update_shopping_mall_schema.sql` 작성 완료
  - [x] 스키마 파일에 샘플 데이터 포함 완료
  - [ ] 마이그레이션 파일 실행 (Supabase Dashboard 또는 CLI) - 다음 단계 필요
  - [ ] 테이블 및 샘플 데이터 확인 - 다음 단계 필요
- [x] Supabase 클라이언트 설정 확인
  - [x] `lib/supabase/clerk-client.ts` (Client Component용)
  - [x] `lib/supabase/server.ts` (Server Component용)
  - [x] `lib/supabase/service-role.ts` (관리자 권한용)
  - [x] `lib/supabase/client.ts` (공개 데이터용)
  - [ ] 각 클라이언트 테스트 - 다음 단계 필요

## Phase 2: 상품 기능 (1주) - 진행 중

- [x] 홈페이지
  - [x] 상품 목록 표시 (최신 상품 또는 전체 상품 미리보기)
  - [x] 반응형 레이아웃
  - [x] 카테고리 카다로그 기능 (카테고리별 상품 조회 및 네비게이션)
  - [ ] 인기 상품 섹션 (주문량 또는 조회수 기준 인기 상품 표시)
- [x] 상품 타입 정의
  - [x] `types/product.ts` 생성 완료
- [x] 상품 조회 Server Action
  - [x] `actions/get-products.ts` 구현 완료
  - [x] `getLatestProducts()` 함수 (최신 상품 조회)
  - [x] `getAllProducts()` 함수 (전체 상품 조회)
  - [x] `getProductsByCategory()` 함수 (카테고리별 상품 조회)
- [x] 상품 카드 컴포넌트
  - [x] `components/product-card.tsx` 구현 완료
  - [x] 상품 정보 표시 (이름, 가격, 카테고리)
  - [x] 재고 상태 표시
  - [x] 상품 상세 페이지 링크
- [x] 상품 목록 페이지 (`/products`)
  - [x] 페이지 라우트 생성
  - [x] 상품 목록 조회 Server Action
  - [ ] 페이지네이션 또는 무한 스크롤
  - [x] 에러 핸들링
  - [x] 카테고리 필터 UI 통합
- [x] 카테고리 필터링
  - [x] 카테고리 상수 정의 (`constants/categories.ts`)
  - [x] 카테고리 필터 UI 컴포넌트 (`components/category-filter.tsx`)
  - [x] 필터링 로직 구현 (`getProductsByCategory()`)
  - [x] URL 쿼리 파라미터 연동
  - [x] 필터 상태 관리
- [ ] 상품 상세 페이지 (`/products/[id]`)
  - [ ] 동적 라우트 생성
  - [ ] 상품 상세 정보 조회 API/Server Action
  - [ ] 상품 이미지 표시 (필요 시)
  - [ ] 장바구니 추가 버튼
  - [ ] 수량 선택 UI
  - [ ] 재고 상태 표시
- [ ] 어드민 상품 등록 가이드
  - [ ] Supabase Dashboard 사용 가이드 문서
  - [ ] 상품 등록 시 필수 필드 안내

## Phase 3: 장바구니 & 주문 (1주)

- [ ] 장바구니 기능
  - [ ] 장바구니 페이지 (`/cart`)
    - [ ] 페이지 라우트 생성
    - [ ] 장바구니 아이템 조회 API/Server Action
    - [ ] 장바구니 아이템 표시
  - [ ] 장바구니 추가 기능
    - [ ] `cart_items` 테이블 INSERT Server Action
    - [ ] 중복 상품 처리 (수량 증가)
    - [ ] 재고 확인 로직
    - [ ] 성공/실패 피드백 UI
  - [ ] 장바구니 수량 변경
    - [ ] 수량 업데이트 Server Action
    - [ ] 수량 변경 UI (증가/감소 버튼)
    - [ ] 재고 한도 확인
  - [ ] 장바구니 아이템 삭제
    - [ ] 삭제 Server Action
    - [ ] 삭제 확인 모달
  - [ ] 장바구니 총액 계산
    - [ ] 서버/클라이언트 총액 계산 로직
    - [ ] 총액 표시 UI
- [ ] 주문 프로세스 구현
  - [ ] 주문 페이지 (`/checkout`)
    - [ ] 페이지 라우트 생성
    - [ ] 주문 정보 입력 폼
      - [ ] 배송지 정보 (shipping_address JSONB)
      - [ ] 주문 메모 (order_note)
    - [ ] 주문 요약 (상품 목록, 총액)
    - [ ] 폼 유효성 검사 (react-hook-form + Zod)
  - [ ] 주문 생성 Server Action
    - [ ] `orders` 테이블 INSERT
    - [ ] `order_items` 테이블 INSERT (여러 개)
    - [ ] 트랜잭션 처리 (모두 성공 또는 모두 롤백)
    - [ ] 장바구니 비우기 (주문 성공 시)
  - [ ] 주문 완료 페이지 (`/orders/[id]`)
    - [ ] 주문 완료 확인 페이지
    - [ ] 주문 번호 표시
    - [ ] 주문 상세 정보 표시
- [ ] 주문 테이블 연동
  - [ ] 주문 상태 관리
  - [ ] 주문 조회 기능

## Phase 4: 결제 통합 (1주)

- [ ] Toss Payments MCP 연동
  - [ ] Toss Payments MCP 서버 설정 확인
  - [ ] 결제 API 키 설정 (환경 변수)
  - [ ] 결제 위젯 라이브러리 설치 및 설정
- [ ] 테스트 결제 구현
  - [ ] 결제 버튼 컴포넌트
  - [ ] 결제 요청 API/Server Action
  - [ ] 결제 승인 처리
  - [ ] 결제 실패 처리
  - [ ] 결제 취소 처리
- [ ] 결제 완료 후 주문 저장
  - [ ] 결제 성공 웹훅 처리
  - [ ] 결제 정보를 주문 테이블에 업데이트
  - [ ] 주문 상태를 'confirmed'로 변경
  - [ ] 결제 완료 후 리다이렉트

## Phase 5: 마이페이지 (0.5주)

- [ ] 주문 내역 조회
  - [ ] 마이페이지 (`/my-page` 또는 `/profile`)
    - [ ] 페이지 라우트 생성
    - [ ] 인증 확인 (미로그인 시 리다이렉트)
  - [ ] 주문 목록 조회 API/Server Action
    - [ ] `orders` 테이블에서 `clerk_id`로 필터링
    - [ ] 최신 주문순 정렬
    - [ ] 주문 상태별 필터링
  - [ ] 주문 목록 UI
    - [ ] 주문 카드 컴포넌트
    - [ ] 주문 날짜, 상태, 총액 표시
    - [ ] 주문 상세 보기 링크
- [ ] 주문 상세 보기
  - [ ] 주문 상세 페이지 (`/orders/[id]`)
    - [ ] 동적 라우트 생성
    - [ ] 주문 상세 조회 API/Server Action
      - [ ] `orders` 테이블 조회
      - [ ] `order_items` 테이블 조회 (JOIN)
    - [ ] 주문 정보 표시
      - [ ] 주문 번호, 날짜, 상태
      - [ ] 배송지 정보
      - [ ] 주문 상품 목록
      - [ ] 결제 정보
    - [ ] 본인 주문만 조회 가능하도록 권한 확인

## Phase 6: 테스트 & 배포 (0.5주)

- [ ] 전체 플로우 테스트
  - [ ] 회원가입/로그인 플로우
  - [ ] 상품 조회 및 필터링
  - [ ] 장바구니 추가/수정/삭제
  - [ ] 주문 생성 플로우
  - [ ] 결제 플로우 (테스트 모드)
  - [ ] 주문 내역 조회
- [ ] 버그 수정
  - [ ] 에러 핸들링 개선
  - [ ] UI/UX 개선
  - [ ] 성능 최적화
- [ ] 환경 변수 설정
  - [ ] 프로덕션 환경 변수 확인
  - [ ] Toss Payments API 키 설정
  - [ ] Supabase 프로덕션 URL/키 설정
  - [ ] Clerk 프로덕션 키 설정
- [ ] Vercel 배포
  - [ ] Vercel 프로젝트 생성
  - [ ] 환경 변수 설정
  - [ ] 빌드 테스트
  - [ ] 프로덕션 배포
  - [ ] 배포 후 동작 확인
- [ ] 문서화
  - [ ] README 업데이트
  - [ ] 배포 가이드 작성
  - [ ] API/Server Action 문서화 (필요 시)

## 추가 개선 사항 (MVP 이후)

- [ ] 상품 검색 기능
- [ ] 상품 정렬 기능 (가격순, 인기순 등)
- [ ] 장바구니 아이콘에 개수 표시
- [ ] 주문 상태 변경 알림
- [ ] 반응형 모바일 최적화
- [ ] 접근성 개선 (a11y)
- [ ] SEO 최적화
- [ ] 성능 모니터링 설정
