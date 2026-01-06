// Client-side PDF generation utilities

export function downloadAsPDF(content: string, filename: string) {
  // Create HTML content with proper styling for PDF
  const htmlContent = `
<!DOCTYPE html>
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
        h1, h2, h3 {
            text-align: center;
            margin: 20px 0;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            display: inline-block;
            margin: 0 10px;
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
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  // Create temporary link and click it
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename.replace(/[^a-zA-Z0-9]/g, '_')}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
  
  // Show instructions to user
  alert('HTML file downloaded! Open it in your browser and use Ctrl+P (Cmd+P on Mac) to save as PDF.')
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