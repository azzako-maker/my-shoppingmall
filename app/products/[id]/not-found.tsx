import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            상품을 찾을 수 없습니다
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            요청하신 상품이 존재하지 않거나 현재 판매 중이 아닙니다.
          </p>
          <div className="mt-8">
            <Link href="/products">
              <Button size="lg">상품 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

