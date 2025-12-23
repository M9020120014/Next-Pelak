
/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogServer } from '@/lib/log/logger'
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Log Error (Client-side) -------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid request body",
          message: "متن درخواست نامعتبر است"
        },
        { status: 400 }
      )
    }

    // Extract data from request (sent from SubmitLogClient)
    const { type, location, message, error } = body

    // Parse error object (can be Error object or string)
    let errorObj: Error
    if (error) {
      if (typeof error === 'object' && error !== null) {
        errorObj = new Error(error.message || String(error) || 'Unknown error')
        errorObj.name = error.name || 'Error'
        errorObj.stack = error.stack || 'No stack trace'
      } else {
        errorObj = new Error(String(error))
      }
    } else {
      errorObj = new Error(message || 'Unknown error')
    }

    // Log using SubmitLogServer
    await SubmitLogServer(type || 'error', location || 'client', message || 'Unknown error', errorObj)

    return NextResponse.json(
      {
        success: true,
        title: "Error logged successfully",
        message: "خطا با موفقیت ثبت شد"
      },
      { status: 200 }
    )
  } catch (error) {
    await SubmitLogServer('error', 'api/logger', 'Failed to log error', error as Error)
    return NextResponse.json(
      {
        success: false,
        title: "Failed to log error",
        message: "خطا در ثبت خطا"
      },
      { status: 500 }
    )
  }
}
