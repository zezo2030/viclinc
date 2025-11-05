'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DoctorProfile } from '@/components/doctors/DoctorProfile';

export default function DoctorProfilePage() {
  const params = useParams();
  // Accept both string (MongoDB ObjectId) and number IDs
  const doctorId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorProfile doctorId={doctorId} />
    </div>
  );
}
