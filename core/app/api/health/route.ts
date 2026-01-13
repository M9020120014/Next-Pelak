// Health check endpoint for monitoring and load balancer
// Returns service status and basic system information

import { NextRequest, NextResponse } from 'next/server'
import { isRedisAvailable } from '@/core/lib/security/rate-limit-redis'
import { ENV } from '@/core/config/env'
import { NODE_ENV } from '@/core/config/core'
import { withErrorHandlingAndTracking } from '@/core/lib/performance/monitoring'

async function GETHandler(_request: NextRequest) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'next-pelak',
      version: '0.1.6',
      checks: {
        redis: isRedisAvailable() ? 'connected' : 'disconnected',
        environment: NODE_ENV,
      },
    }

    // Determine overall health status
    // Service is considered healthy if Redis is available (or not required)
    const isHealthy = health.checks.redis === 'connected' || !ENV.REDIS_URL

    return NextResponse.json(
      {
        ...health,
        status: isHealthy ? 'healthy' : 'degraded',
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/health')

