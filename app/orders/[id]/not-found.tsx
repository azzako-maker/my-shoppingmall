import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function OrderNotFound() {
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            주문을 찾을 수 없습니다
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            요청하신 주문이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/">
              <Button size="lg" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

