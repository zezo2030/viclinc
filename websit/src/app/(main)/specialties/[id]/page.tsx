'use client';

import { useParams } from 'next/navigation';
import { SpecialtyDetails } from '@/components/specialties/SpecialtyDetails';

export default function SpecialtyDetailsPage() {
  const params = useParams();
  const specialtyId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SpecialtyDetails specialtyId={specialtyId} />
    </div>
  );
}