import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'

export interface ExportOptions {
  format: 'csv' | 'pdf'
  startDate?: Date
  endDate?: Date
  dataType: 'queries' | 'analytics' | 'subscriptions' | 'revenue'
}

// Export query logs to CSV
export async function exportQueryLogsCSV(startDate?: Date, endDate?: Date): Promise<string> {
  try {
    const queryLogs = await prisma.queryLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Create CSV header
    const headers = ['User ID', 'Contract Type', 'Risk Score', 'Analysis Time (ms)', 'Red Flags', 'Created At']
    const rows = queryLogs.map(log => [
      log.userId,
      log.contractType,
      log.riskScore,
      log.analysisTime,
      log.redFlagCount,
      log.createdAt.toISOString(),
    ])

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return csv
  } catch (error) {
    console.error('Error exporting query logs:', error)
    throw error
  }
}

// Export analytics events to CSV
export async function exportAnalyticsEventsCSV(startDate?: Date, endDate?: Date): Promise<string> {
  try {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Create CSV header
    const headers = ['User ID', 'Event Type', 'Metadata', 'Created At']
    const rows = events.map(event => [
      event.userId,
      event.eventType,
      JSON.stringify(event.metadata || {}),
      event.createdAt.toISOString(),
    ])

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return csv
  } catch (error) {
    console.error('Error exporting analytics events:', error)
    throw error
  }
}

// Export subscription data to CSV
export async function exportSubscriptionsCSV(): Promise<string> {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Create CSV header
    const headers = ['User ID', 'Tier', 'Status', 'Queries Used', 'Queries Limit', 'Created At', 'Expires At']
    const rows = subscriptions.map(sub => [
      sub.userId,
      sub.tier,
      sub.status,
      sub.queriesUsed,
      sub.queriesLimit,
      sub.createdAt.toISOString(),
      sub.expiresAt?.toISOString() || 'N/A',
    ])

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return csv
  } catch (error) {
    console.error('Error exporting subscriptions:', error)
    throw error
  }
}

// Generate monthly analytics report PDF
export async function generateMonthlyReportPDF(month: number, year: number): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Title
    doc.setFontSize(24)
    doc.setTextColor(15, 23, 42)
    doc.text(`Monthly Analytics Report`, 20, yPosition)
    yPosition += 10

    // Date
    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139)
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
    doc.text(`${monthName}`, 20, yPosition)
    yPosition += 15

    // Get metrics for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const totalQueries = await prisma.queryLog.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const activeUsers = await prisma.queryLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      distinct: ['userId'],
      select: { userId: true },
    })

    const proSubscriptions = await prisma.subscription.count({
      where: {
        tier: 'pro',
        status: 'active',
      },
    })

    const mrr = proSubscriptions * 29

    // Key Metrics Section
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('Key Metrics', 20, yPosition)
    yPosition += 8

    const metrics = [
      { label: 'Total Queries', value: totalQueries.toLocaleString() },
      { label: 'Active Users', value: activeUsers.length.toLocaleString() },
      { label: 'Pro Subscribers', value: proSubscriptions.toLocaleString() },
      { label: 'MRR', value: `$${mrr.toLocaleString()}` },
    ]

    doc.setFontSize(11)
    metrics.forEach(metric => {
      doc.setTextColor(15, 23, 42)
      doc.text(`${metric.label}:`, 25, yPosition)
      doc.setTextColor(79, 70, 229)
      doc.text(metric.value, 100, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // Contract Type Distribution
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('Contract Type Distribution', 20, yPosition)
    yPosition += 8

    const contractTypes = await prisma.queryLog.groupBy({
      by: ['contractType'],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    doc.setFontSize(10)
    contractTypes.forEach(ct => {
      const percentage = totalQueries > 0 ? ((ct._count / totalQueries) * 100).toFixed(1) : '0'
      doc.text(`${ct.contractType}: ${ct._count} (${percentage}%)`, 25, yPosition)
      yPosition += 6
    })

    yPosition += 10

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('Generated by LAW.AI Analytics', 20, pageHeight - 10)

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return pdfBuffer
  } catch (error) {
    console.error('Error generating monthly report:', error)
    throw error
  }
}

// Export data based on options
export async function exportData(options: ExportOptions): Promise<string | Buffer> {
  try {
    const { format, dataType, startDate, endDate } = options

    if (format === 'csv') {
      switch (dataType) {
        case 'queries':
          return await exportQueryLogsCSV(startDate, endDate)
        case 'analytics':
          return await exportAnalyticsEventsCSV(startDate, endDate)
        case 'subscriptions':
          return await exportSubscriptionsCSV()
        default:
          throw new Error('Invalid data type')
      }
    } else if (format === 'pdf') {
      const now = new Date()
      return await generateMonthlyReportPDF(now.getMonth() + 1, now.getFullYear())
    } else {
      throw new Error('Invalid format')
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    throw error
  }
}

// Get export filename
export function getExportFilename(dataType: string, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${dataType}-export-${timestamp}.${format}`
}
