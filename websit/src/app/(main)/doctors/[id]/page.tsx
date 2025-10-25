'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DoctorProfile } from '@/components/doctors/DoctorProfile';

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = parseInt(params.id as string);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorProfile doctorId={doctorId} />
    </div>
  );
}
