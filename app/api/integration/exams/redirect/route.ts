import { NextRequest, NextResponse } from 'next/server'
import { ENV } from '@/core/config/env'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const quizId = searchParams.get('quiz_id')

  if (!quizId) {
    return NextResponse.json(
      { success: false, message: 'quiz_id is required' },
      { status: 400 }
    )
  }

  if (!ENV.EXAM_CLIENT_TOKEN_UUID) {
    return NextResponse.json(
      { success: false, message: 'EXAM_CLIENT_TOKEN_UUID is not configured' },
      { status: 500 }
    )
  }

  const examUrl = `https://app.ayareto.ir/quiz/${quizId}`

  // Since browsers don't allow custom headers in redirects to external URLs,
  // we need to use a different approach. We'll create an HTML page that makes
  // a fetch request with the header, then redirects.
  
  // Create an HTML response that will make a fetch request with the header
  // and then redirect to the exam URL
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>در حال انتقال به آزمون...</title>
      </head>
      <body>
        <script>
          // Make a fetch request with the custom header
          fetch('${examUrl}', {
            method: 'GET',
            headers: {
              'X-Client-Token': 'Token ${ENV.EXAM_CLIENT_TOKEN_UUID}',
            },
            redirect: 'follow',
          })
          .then(() => {
            // After the request, redirect to the exam URL
            window.location.href = '${examUrl}';
          })
          .catch(() => {
            // If fetch fails (likely due to CORS), redirect anyway
            window.location.href = '${examUrl}';
          });
        </script>
        <p>در حال انتقال به آزمون...</p>
      </body>
    </html>
  `

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
