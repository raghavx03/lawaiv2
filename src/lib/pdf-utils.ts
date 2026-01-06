// Client-side PDF generation utilities

export function downloadAsPDF(content: string, filename: string) {
  // Create professional HTML content for PDF
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${filename}</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.8;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
        }
        .document {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .content {
            white-space: pre-wrap;
            text-align: justify;
            font-size: 12pt;
            line-height: 1.8;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin-bottom: 30px;
            text-decoration: underline;
        }
        .signature-section {
            margin-top: 50px;
            page-break-inside: avoid;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            display: inline-block;
            margin: 20px 10px 5px 0;
        }
        @media print {
            body { 
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .document {
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
        }
        @media screen {
            body {
                background: #f5f5f5;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
    </div>
    <script>
        // Auto-print after 1 second
        setTimeout(() => {
            window.print();
        }, 1000);
        
        // Show instructions
        setTimeout(() => {
            if (!window.matchMedia('print').matches) {
                alert('📄 Document ready for PDF download!\n\n1. Use Ctrl+P (Cmd+P on Mac) to print\n2. Select "Save as PDF" as destination\n3. Click Save to download PDF');
            }
        }, 2000);
    </script>
</body>
</html>`

  // Open in new window for better PDF generation
  const newWindow = window.open('', '_blank')
  if (newWindow) {
    newWindow.document.write(htmlContent)
    newWindow.document.close()
  } else {
    // Fallback: download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename.replace(/[^a-zA-Z0-9\s]/g, '_')}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function printDocument(content: string, title: string) {
  // Create a new window with the document content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print the document')
    return
  }

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
            padding: 20px;
            background: white;
        }
        .content {
            white-space: pre-wrap;
            text-align: justify;
        }
        @media print {
            body { 
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}