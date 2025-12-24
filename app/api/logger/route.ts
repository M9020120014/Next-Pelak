
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
  
    const { type, location, message, details } = body as Readonly<{ type: string, location: string, message: string, details: Record<string, string> }>
    await SubmitLogServer(
      type || 'error',
      location || 'client',
      message || 'Unknown error',
      details
    )

    return NextResponse.json(
      {
        success: true,
        title: "Error logged successfully",
        message: "خطا با موفقیت ثبت شد"
      },
      { status: 200 }
    )

  } catch (error) {
    await SubmitLogServer(
      'error',
      'api/logger',
      error instanceof Error ? error.name : 'Failed to log error',
      { details: error instanceof Error ? error.message || 'No message available' : String(error) || 'Unknown error' }
    )
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
