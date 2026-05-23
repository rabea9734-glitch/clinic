export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  bloodType?: string;
  chronicDiseases?: string;
  notes?: string;
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';
export type AppointmentType = 'checkup' | 'consultation' | 'followup'; // كشف | استشارة | متابعة

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // denormalized for easy export & viewing
  patientPhone: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
}

export interface MedicationItem {
  name: string;
  dose: string;      // الجرعة (e.g., 500mg)
  frequency: string; // التكرار (e.g., 3 مرات يومياً)
  duration: string;  // المدة (e.g., 7 أيام)
  notes?: string;    // ملاحظات إضافية (e.g., قبل الأكل)
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string; // التشخيص
  medications: MedicationItem[];
  notes?: string; // توصيات الطبيب العامة
}

export interface ClinicStats {
  totalPatients: number;
  todayAppointments: number;
  pendingBookings: number;
  completedVisits: number;
}
