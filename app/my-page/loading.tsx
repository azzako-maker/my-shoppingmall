/**
 * @file app/my-page/loading.tsx
 * @description 마이페이지 로딩 스켈레톤
 */

export default function MyPageLoading() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 sm:py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* 페이지 헤더 스켈레톤 */}
        <div className="mb-6 sm:mb-8">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* 주문 목록 스켈레톤 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

