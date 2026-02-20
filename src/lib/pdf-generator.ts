import jsPDF from 'jspdf'
import { RiskAnalysisResult } from './contract-risk-analyzer'

interface PDFGeneratorOptions {
  title?: string
  includeWatermark?: boolean
  isFreeUser?: boolean
}

// Generate PDF report from risk analysis
export async function generatePDFReport(
  analysis: RiskAnalysisResult,
  contractText: string,
  options: PDFGeneratorOptions = {}
): Promise<Buffer> {
  const {
    title = 'Contract Risk Analysis Report',
    includeWatermark = false,
    isFreeUser = false,
  } = options

  try {
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Add watermark for free tier
    if (isFreeUser && includeWatermark) {
      doc.setTextColor(200, 200, 200)
      doc.setFontSize(60)
      doc.text('FREE TIER', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      })
      doc.setTextColor(0, 0, 0)
    }

    // Header
    doc.setFontSize(24)
    doc.setTextColor(15, 23, 42) // slate-900
    doc.text(title, 20, yPosition)
    yPosition += 15

    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition)
    yPosition += 10

    // Risk Score Section
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('Risk Assessment', 20, yPosition)
    yPosition += 8

    // Risk meter visualization (text-based)
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text(`Overall Risk Score: ${analysis.overallRisk}%`, 20, yPosition)
    yPosition += 6

    doc.setFontSize(11)
    const riskColor =
      analysis.overallRisk < 30
        ? [34, 197, 94] // green
        : analysis.overallRisk < 70
          ? [217, 119, 6] // amber
          : [220, 38, 38] // red

    doc.setTextColor(...riskColor)
    doc.text(`Risk Level: ${analysis.riskLevel}`, 20, yPosition)
    yPosition += 6

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(10)
    doc.text(`Confidence Score: ${analysis.confidence}%`, 20, yPosition)
    yPosition += 12

    // Red Flags Section
    if (analysis.redFlags.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(220, 38, 38) // red
      doc.text(`🔴 Red Flags (${analysis.redFlags.length})`, 20, yPosition)
      yPosition += 6

      analysis.redFlags.forEach(flag => {
        doc.setFontSize(10)
        doc.setTextColor(15, 23, 42)
        doc.text(`• ${flag.clause} (Section ${flag.section})`, 25, yPosition)
        yPosition += 4

        doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        const issueLines = doc.splitTextToSize(`Issue: ${flag.issue}`, pageWidth - 50)
        doc.text(issueLines, 30, yPosition)
        yPosition += issueLines.length * 3 + 2

        const suggestionLines = doc.splitTextToSize(`Suggestion: ${flag.suggestion}`, pageWidth - 50)
        doc.text(suggestionLines, 30, yPosition)
        yPosition += suggestionLines.length * 3 + 4

        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
      })

      yPosition += 4
    }

    // Warnings Section
    if (analysis.warnings.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(217, 119, 6) // amber
      doc.text(`🟡 Warnings (${analysis.warnings.length})`, 20, yPosition)
      yPosition += 6

      analysis.warnings.forEach(warning => {
        doc.setFontSize(10)
        doc.setTextColor(15, 23, 42)
        doc.text(`• ${warning.clause} (Section ${warning.section})`, 25, yPosition)
        yPosition += 4

        doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        const issueLines = doc.splitTextToSize(`Issue: ${warning.issue}`, pageWidth - 50)
        doc.text(issueLines, 30, yPosition)
        yPosition += issueLines.length * 3 + 2

        const suggestionLines = doc.splitTextToSize(`Suggestion: ${warning.suggestion}`, pageWidth - 50)
        doc.text(suggestionLines, 30, yPosition)
        yPosition += suggestionLines.length * 3 + 4

        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
      })

      yPosition += 4
    }

    // Suggested Revisions Section
    if (analysis.suggestedRevisions.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setTextColor(34, 197, 94) // green
      doc.text('✓ Suggested Revisions', 20, yPosition)
      yPosition += 6

      analysis.suggestedRevisions.forEach((revision, index) => {
        doc.setFontSize(10)
        doc.setTextColor(15, 23, 42)
        const revisionLines = doc.splitTextToSize(`${index + 1}. ${revision}`, pageWidth - 40)
        doc.text(revisionLines, 25, yPosition)
        yPosition += revisionLines.length * 4 + 2

        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
      })
    }

    // Footer
    if (yPosition > pageHeight - 20) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('This report is generated by LAW.AI Contract Risk Analyzer', 20, pageHeight - 10)
    doc.text('For professional legal advice, consult with a qualified attorney', 20, pageHeight - 5)

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return pdfBuffer
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

// Generate PDF with custom styling
export async function generateStyledPDFReport(
  analysis: RiskAnalysisResult,
  contractText: string,
  options: PDFGeneratorOptions = {}
): Promise<Buffer> {
  // For now, use the basic generator
  // In production, could use more advanced libraries like pdfkit or puppeteer
  return generatePDFReport(analysis, contractText, options)
}

// Generate PDF filename
export function generatePDFFilename(contractType: string = 'contract'): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${contractType}-risk-analysis-${timestamp}.pdf`
}
