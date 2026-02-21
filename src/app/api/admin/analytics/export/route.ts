import { NextRequest, NextResponse } from 'next/server'
import { exportData, getExportFilename } from '@/lib/export-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') as 'csv' | 'pdf' || 'csv'
    const dataType = request.nextUrl.searchParams.get('dataType') as 'queries' | 'analytics' | 'subscriptions' | 'revenue' || 'queries'
    const startDateStr = request.nextUrl.searchParams.get('startDate')
    const endDateStr = request.nextUrl.searchParams.get('endDate')

    // Validate format
    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be csv or pdf' },
        { status: 400 }
      )
    }

    // Validate data type
    if (!['queries', 'analytics', 'subscriptions', 'revenue'].includes(dataType)) {
      return NextResponse.json(
        { error: 'Invalid data type' },
        { status: 400 }
      )
    }

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    // Export data
    const data = await exportData({
      format,
      dataType,
      startDate,
      endDate,
    })

    const filename = getExportFilename(dataType, format)

    if (format === 'csv') {
      return new NextResponse(data as string, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    } else {
      return new NextResponse(data as Buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
