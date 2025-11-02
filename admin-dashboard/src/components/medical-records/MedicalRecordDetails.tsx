import { X, Calendar, User, Stethoscope, Activity, FileText, Heart, Thermometer, Gauge, Ruler } from 'lucide-react'
import type { MedicalRecordDetailsProps } from '@/types'
import { format } from 'date-fns'
import AttachmentsList from './AttachmentsList'

export default function MedicalRecordDetails({
  record,
  isOpen,
  onClose,
  onViewAudit,
}: MedicalRecordDetailsProps) {
  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">تفاصيل السجل الطبي</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <section className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">المريض</p>
                  <p className="font-medium text-gray-900">
                    {record.patient?.name || `Patient ${record.patientId.slice(0, 8)}`}
                  </p>
                  {record.patient?.email && (
                    <p className="text-sm text-gray-500">{record.patient.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">الطبيب</p>
                  <p className="font-medium text-gray-900">
                    {record.doctor?.name || `Doctor ${record.doctorId.slice(0, 8)}`}
                  </p>
                  {record.doctor?.email && (
                    <p className="text-sm text-gray-500">{record.doctor.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">آخر تحديث</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(record.updatedAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Diagnosis */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">التشخيص</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{record.diagnosis}</p>
            </div>
          </section>

          {/* Vital Signs */}
          {record.vitalSigns && (
            <section className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                العلامات الحيوية
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {record.vitalSigns.bloodPressure && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-500">ضغط الدم</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.bloodPressure}</p>
                  </div>
                )}
                {record.vitalSigns.temperature && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-500">درجة الحرارة</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.temperature}°C</p>
                  </div>
                )}
                {record.vitalSigns.heartRate && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-sm text-gray-500">معدل النبض</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.heartRate} BPM</p>
                  </div>
                )}
                {record.vitalSigns.weight && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-500">الوزن</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.weight} kg</p>
                  </div>
                )}
                {record.vitalSigns.height && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-500">الطول</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{record.vitalSigns.height} cm</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Prescription */}
          {record.prescription && record.prescription.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">الوصفة الطبية</h3>
              <div className="space-y-2">
                {record.prescription.map((item, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.medication}</p>
                        <p className="text-sm text-gray-600">
                          {item.dosage} • {item.duration}
                        </p>
                      </div>
                    </div>
                    {item.instructions && (
                      <p className="text-sm text-gray-700 mt-2">{item.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {record.notes && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">ملاحظات إضافية</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{record.notes}</p>
              </div>
            </section>
          )}

          {/* Attachments */}
          {record.attachments && record.attachments.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">المرفقات</h3>
              <AttachmentsList attachments={record.attachments} />
            </section>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            {onViewAudit && (
              <button
                onClick={() => onViewAudit(record.id)}
                className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                عرض سجل التدقيق
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

