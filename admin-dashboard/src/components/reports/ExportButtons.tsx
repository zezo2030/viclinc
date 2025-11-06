import { Download, FileText, Table } from 'lucide-react'
import { exportToPDF, exportToExcel, type ExportData } from '@/utils/export'

interface ExportButtonsProps {
  title: string
  headers: string[]
  rows: any[][]
  summary?: Record<string, string | number>
  className?: string
}

export default function ExportButtons({
  title,
  headers,
  rows,
  summary,
  className = '',
}: ExportButtonsProps) {
  const handleExportPDF = () => {
    const exportData: ExportData = { title, headers, rows, summary }
    exportToPDF(exportData)
  }

  const handleExportExcel = () => {
    const exportData: ExportData = { title, headers, rows, summary }
    exportToExcel(exportData)
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <FileText className="h-4 w-4" />
        تصدير PDF
      </button>
      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Table className="h-4 w-4" />
        تصدير Excel
      </button>
    </div>
  )
}








