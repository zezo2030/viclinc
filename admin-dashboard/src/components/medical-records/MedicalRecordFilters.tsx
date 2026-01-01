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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
        <h3 className="text-lg font-bold text-[#213F6A]">البحث والتصفية</h3>
        <div className="h-0.5 flex-1 bg-[#D62828] opacity-20"></div>
      </div>
      <div className="flex flex-col gap-4">
        {/* First Row: Dropdowns */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Patient Filter */}
          <div className="w-full md:w-48">
            <select
              value={filters.patientId || 'ALL'}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
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
              className="flex items-center gap-2 px-5 py-3 bg-[#213F6A] text-white rounded-xl font-semibold hover:bg-[#1e3a8a] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#213F6A]/30"
            >
              <X className="w-4 h-4" />
              <span>إعادة التعيين</span>
            </button>
          )}
        </div>

        {/* Second Row: Date Range */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-[#333333] mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-[#333333] mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                onFiltersChange({ ...filters, dateTo: e.target.value || undefined })
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

