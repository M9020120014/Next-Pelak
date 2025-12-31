// /components/auth/ConnectionError.tsx
// Component for displaying connection errors with retry functionality

'use client'

interface ConnectionErrorProps {
  message?: string
  onRetry: () => void | Promise<void>
  retrying?: boolean
}

export default function ConnectionError({
  message = 'ارتباط با سرور برقرار نشد',
  onRetry,
  retrying = false,
}: ConnectionErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-Background px-012-3">
      <div className="max-w-md w-full text-center">
        <div className="bg-White rounded-lg shadow-lg p-034-7">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-072-9 w-072-9 rounded-full bg-ErrorLight/10 mb-012-3">
            <svg
              className="h-034-7 w-034-7 text-Error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="text-H2 font-bold text-Text mb-008-2">خطا در ارتباط</h2>
          <p className="text-Mid mb-024-5">{message}</p>

          {/* Retry Button */}
          <button
            onClick={onRetry}
            disabled={retrying}
            className="w-full py-010-D px-012-3 bg-Primary text-PrimaryForeground rounded-md hover:bg-PrimaryDark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-008-2"
          >
            {retrying ? (
              <>
                <div className="inline-block animate-spin rounded-full h-014-Z w-014-Z border-b-2 border-PrimaryForeground"></div>
                <span>در حال تلاش مجدد...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-018-4 w-018-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>تلاش مجدد</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
