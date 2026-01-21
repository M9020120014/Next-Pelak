// /app/api/departments/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { validateAPIRequest } from '@/core/lib/security/api-middleware'
import { RATE_LIMIT } from '@/core/config/security'
import { successResponse, serverError } from '@/core/lib/api/response'
import { withErrorHandlingAndTracking } from '@/core/lib/performance/monitoring'

const TOKEN = process.env.POSTGREST_SECRET

async function GETHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/departments'

  const securityCheck = await validateAPIRequest(request, false, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  try {
    const res = await fetch('https://api.htni.ir/get_departmans', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Range-Unit': 'items',
        'x-csrf-token': request.headers.get('x-csrf-token') || '',
        'Authorization': 'Bearer ' + TOKEN
      },
    })

    const data = await res.json()

    if (!res.ok || !Array.isArray(data)) {
      return serverError('خطا در دریافت لیست دپارتمان‌ها')
    }

    const response = successResponse(
      {
        title: 'Departments Retrieved',
        message: 'لیست دپارتمان‌ها با موفقیت دریافت شد.',
        departments: data,
      },
      'لیست دپارتمان‌ها با موفقیت دریافت شد.',
      200,
      securityCheck.rateLimitHeaders
    )

    const duration = Date.now() - startTime
    void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
      trackPerformance(routeEndpoint, request.method, duration, response.status).catch(() => {})
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        title: 'Error',
        message: 'خطا در اتصال به سرویس دپارتمان‌ها',
      },
      { status: 500 }
    )
  }
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/departments')

