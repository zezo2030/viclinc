import { Doctor } from '@/types';

// بيانات وهمية للأطباء - حل مؤقت حتى إنشاء API endpoint
export const mockDoctors: Doctor[] = [
  {
    id: '1',
    userId: 101,
    clinicId: 1,
    departmentId: 1,
    specialtyId: 1,
    specialization: 'أمراض القلب والشرايين',
    licenseNumber: 'CARD-001-2024',
    experience: 12,
    consultationFee: 200,
    isAvailable: true,
    avatar: '/images/doctors/dr-ahmed-ali.jpg',
    user: {
      id: 101,
      email: 'ahmed.ali@clinic.com',
      profile: {
        firstName: 'أحمد',
        lastName: 'محمد العلي',
        phone: '+966501234567'
      }
    },
    clinic: {
      id: '1',
      name: 'مستشفى الرياض التخصصي',
      address: 'الرياض، حي العليا، شارع الملك فهد'
    },
    department: {
      id: '1',
      name: 'أمراض القلب'
    },
    specialty: {
      id: '1',
      name: 'أمراض القلب والشرايين'
    }
  },
  {
    id: '2',
    userId: 102,
    clinicId: 1,
    departmentId: 2,
    specialtyId: 2,
    specialization: 'طب الأطفال',
    licenseNumber: 'PED-002-2024',
    experience: 8,
    consultationFee: 150,
    isAvailable: true,
    avatar: '/images/doctors/dr-fatima-saad.jpg',
    user: {
      id: 102,
      email: 'fatima.saad@clinic.com',
      profile: {
        firstName: 'فاطمة',
        lastName: 'السعد',
        phone: '+966501234568'
      }
    },
    clinic: {
      id: '1',
      name: 'مستشفى الرياض التخصصي',
      address: 'الرياض، حي العليا، شارع الملك فهد'
    },
    department: {
      id: '2',
      name: 'طب الأطفال'
    },
    specialty: {
      id: '2',
      name: 'طب الأطفال'
    }
  },
  {
    id: '3',
    userId: 103,
    clinicId: 1,
    departmentId: 3,
    specialtyId: 3,
    specialization: 'الأمراض الجلدية',
    licenseNumber: 'DER-003-2024',
    experience: 10,
    consultationFee: 180,
    isAvailable: true,
    avatar: '/images/doctors/dr-khalid-hassan.jpg',
    user: {
      id: 103,
      email: 'khalid.hassan@clinic.com',
      profile: {
        firstName: 'خالد',
        lastName: 'حسن الزهراني',
        phone: '+966501234569'
      }
    },
    clinic: {
      id: '1',
      name: 'مستشفى الرياض التخصصي',
      address: 'الرياض، حي العليا، شارع الملك فهد'
    },
    department: {
      id: '3',
      name: 'الأمراض الجلدية'
    },
    specialty: {
      id: '3',
      name: 'الأمراض الجلدية'
    }
  },
  {
    id: '4',
    userId: 104,
    clinicId: 1,
    departmentId: 4,
    specialtyId: 4,
    specialization: 'جراحة العظام',
    licenseNumber: 'ORT-004-2024',
    experience: 15,
    consultationFee: 250,
    isAvailable: true,
    avatar: '/images/doctors/dr-nora-ahmed.jpg',
    user: {
      id: 104,
      email: 'nora.ahmed@clinic.com',
      profile: {
        firstName: 'نورا',
        lastName: 'أحمد الزهراني',
        phone: '+966501234570'
      }
    },
    clinic: {
      id: '1',
      name: 'مستشفى الرياض التخصصي',
      address: 'الرياض، حي العليا، شارع الملك فهد'
    },
    department: {
      id: '4',
      name: 'جراحة العظام'
    },
    specialty: {
      id: '4',
      name: 'جراحة العظام'
    }
  },
  {
    id: '5',
    userId: 105,
    clinicId: 1,
    departmentId: 5,
    specialtyId: 5,
    specialization: 'طب الأسنان',
    licenseNumber: 'DEN-005-2024',
    experience: 7,
    consultationFee: 120,
    isAvailable: true,
    avatar: '/images/doctors/dr-sara-mohammed.jpg',
    user: {
      id: 105,
      email: 'sara.mohammed@clinic.com',
      profile: {
        firstName: 'سارة',
        lastName: 'محمد القحطاني',
        phone: '+966501234571'
      }
    },
    clinic: {
      id: '1',
      name: 'مستشفى الرياض التخصصي',
      address: 'الرياض، حي العليا، شارع الملك فهد'
    },
    department: {
      id: '5',
      name: 'طب الأسنان'
    },
    specialty: {
      id: '5',
      name: 'طب الأسنان'
    }
  }
];
