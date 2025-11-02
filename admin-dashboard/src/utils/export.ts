import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatDate, formatCurrency, formatNumber } from './format'

interface ExportData {
  title: string
  headers: string[]
  rows: any[][]
  summary?: Record<string, string | number>
}

/**
 * تصدير البيانات إلى PDF
 */
export const exportToPDF = (data: ExportData, filename: string = 'report.pdf') => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10

  // إضافة العنوان
  doc.setFontSize(18)
  doc.text(data.title, pageWidth / 2, margin + 10, { align: 'center' })

  // إضافة التاريخ والوقت
  doc.setFontSize(10)
  const now = new Date()
  doc.text(`تاريخ التقرير: ${formatDate(now, 'dd/MM/yyyy HH:mm')}`, margin, margin + 20)

  let startY = margin + 30

  // إضافة الملخص إن وجد
  if (data.summary && Object.keys(data.summary).length > 0) {
    doc.setFontSize(14)
    doc.text('الملخص', margin, startY)
    startY += 10

    doc.setFontSize(10)
    Object.entries(data.summary).forEach(([key, value], index) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      doc.text(`${key}: ${displayValue}`, margin, startY + (index * 7))
    })

    startY += Object.keys(data.summary).length * 7 + 10
  }

  // إضافة الجدول
  const processedRows = data.rows.map(row => 
    row.map(cell => typeof cell === 'object' && cell !== null ? JSON.stringify(cell) : cell)
  )
  
  autoTable(doc, {
    head: [data.headers],
    body: processedRows,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // أزرق
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // رمادي فاتح
    },
    margin: { top: startY, right: margin, bottom: margin, left: margin },
    styles: { direction: 'rtl', fontName: 'Arial' },
  })

  // حفظ الملف
  doc.save(filename)
}

/**
 * تصدير البيانات إلى Excel
 */
export const exportToExcel = (data: ExportData, filename: string = 'report.xlsx') => {
  // إنشاء Workbook جديد
  const workbook = XLSX.utils.book_new()

  // إضافة ورقة العمل الرئيسية
  const worksheetData: any[][] = []
  
  // العنوان
  worksheetData.push([data.title])
  worksheetData.push([`تاريخ التقرير: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`])
  worksheetData.push([])

  // الملخص إن وجد
  if (data.summary && Object.keys(data.summary).length > 0) {
    worksheetData.push(['الملخص'])
    Object.entries(data.summary).forEach(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
      worksheetData.push([key, displayValue])
    })
    worksheetData.push([])
  }

  // رؤوس الجدول
  worksheetData.push(data.headers)

  // بيانات الجدول
  data.rows.forEach((row) => {
    const processedRow = row.map(cell => typeof cell === 'object' && cell !== null ? JSON.stringify(cell) : cell)
    worksheetData.push(processedRow)
  })

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // تحديد عرض الأعمدة
  const maxWidth = data.headers.reduce((max, header) => Math.max(max, header.length), 0)
  worksheet['!cols'] = data.headers.map(() => ({ wch: Math.max(15, maxWidth) }))

  // دمج الخلايا للعنوان
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: data.headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: data.headers.length - 1 } },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'التقرير')

  // حفظ الملف
  XLSX.writeFile(workbook, filename)
}

/**
 * تنسيق الأرقام للنصوص العربية
 */
export const formatNumberForExport = (num: number | string | undefined): string => {
  if (num === undefined || num === null) return '-'
  return typeof num === 'number' ? formatNumber(num) : String(num)
}

/**
 * تنسيق العملة للتصدير
 */
export const formatCurrencyForExport = (amount: number | undefined, currency: string = 'SAR'): string => {
  if (amount === undefined || amount === null) return '-'
  return formatCurrency(amount, currency)
}

/**
 * تصدير تقرير الأداء
 */
export const exportPerformanceReport = (
  title: string,
  headers: string[],
  rows: any[][],
  summary?: Record<string, string | number>,
  format: 'pdf' | 'excel' = 'pdf'
) => {
  const exportData: ExportData = { title, headers, rows, summary }

  const filename = format === 'pdf' 
    ? `${title}_${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`
    : `${title}_${formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`

  if (format === 'pdf') {
    exportToPDF(exportData, filename)
  } else {
    exportToExcel(exportData, filename)
  }
}

