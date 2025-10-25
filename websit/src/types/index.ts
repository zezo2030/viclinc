// Types for the clinic management system

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  features: string[];
  isPopular: boolean;
  icon: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  image: string;
  clinic: string;
  languages: string[];
  education: string;
  certifications: string[];
  consultationFee: number;
  isAvailable: boolean;
}


export interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  services: string[];
  isActive: boolean;
  doctors: {
    id: number;
    specialization: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  image: string;
  tags: string[];
  readTime: number;
  slug: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular: boolean;
  description: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  // role سيتم إضافته تلقائياً في AuthContext
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;  // الاسم الكامل (firstName + lastName)
  firstName?: string;
  lastName?: string;
  role: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type UserRole = 'PATIENT' | 'DOCTOR';

// Doctor Profile Types
export interface Rating {
  id: number;
  doctorId: number;
  patientId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  patient?: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export interface Schedule {
  id: number;
  doctorId: number;
  dayOfWeek: number; // 0-6
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}

export interface DoctorProfile {
  id: number;
  userId: number;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: string;
  isAvailable: boolean;
  user: {
    id: number;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      avatar?: string;
    };
  };
  clinic: { 
    id: number; 
    name: string; 
    address?: string;
  };
  specialty: { 
    id: number; 
    name: string; 
    icon?: string;
  };
  department: { 
    id: number; 
    name: string;
  };
  schedules: Schedule[];
  ratings: Rating[];
  averageRating?: number;
  totalRatings?: number;
}

export interface DoctorDetailed extends DoctorProfile {
  // Extended interface for detailed doctor information
  qualifications?: string[];
  certifications?: string[];
  languages?: string[];
  bio?: string;
}