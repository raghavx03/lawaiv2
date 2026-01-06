export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json()
    
    if (!content || !title) {
      return NextResponse.json({ error: 'Content and title required' }, { status: 400 })
    }

    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .document-title {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .content {
            white-space: pre-wrap;
            text-align: justify;
        }
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .witness-section {
            margin-top: 30px;
            page-break-inside: avoid;
        }
        @media print {
            body { print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`

    // Return HTML that will be converted to PDF on client side
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.html"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}