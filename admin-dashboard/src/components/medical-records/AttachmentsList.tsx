import { FileText, Image, File, Download, ExternalLink } from 'lucide-react'
import type { Attachment } from '@/types'

interface AttachmentsListProps {
  attachments: Attachment[]
}

export default function AttachmentsList({ attachments }: AttachmentsListProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>لا توجد مرفقات</p>
      </div>
    )
  }

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-5 h-5" />
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 text-gray-600">{getFileIcon(attachment.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{attachment.type}</span>
                {attachment.size && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{formatFileSize(attachment.size)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
              title="فتح في نافذة جديدة"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

