import { useState } from 'react'
import { X } from 'lucide-react'
import type { MedicalRecordsFilters, MedicalRecordFiltersProps } from '@/types'

export default function MedicalRecordFilters({
  filters,
  onFiltersChange,
  onReset,
  patients = [],
  doctors = [],
}: MedicalRecordFiltersProps) {
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '')
  const [dateTo, setDateTo] = useState(filters.dateTo || '')

  const handlePatientChange = (patientId: string) => {
    onFiltersChange({
      ...filters,
      patientId: patientId === 'ALL' ? undefined : patientId,
    })
  }

  const handleDoctorChange = (doctorId: string) => {
    onFiltersChange({
      ...filters,
      doctorId: doctorId === 'ALL' ? undefined : doctorId,
    })
  }

  const handleReset = () => {
    setDateFrom('')
    setDateTo('')
    onReset()
  }

  const hasActiveFilters = filters.patientId || filters.doctorId || filters.dateFrom || filters.dateTo

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* First Row: Dropdowns */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Patient Filter */}
          <div className="w-full md:w-48">
            <select
              value={filters.patientId || 'ALL'}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">جميع المرضى</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="w-full md:w-48">
            <select
              value={filters.doctorId || 'ALL'}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">جميع الأطباء</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>إعادة التعيين</span>
            </button>
          )}
        </div>

        {/* Second Row: Date Range */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                onFiltersChange({ ...filters, dateTo: e.target.value || undefined })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

