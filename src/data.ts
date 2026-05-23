import * as XLSX from 'xlsx';
import { Patient, Appointment, Prescription } from './types';

// قائمة افتراضية بالأدوية الشائعة لتسهيل ملء الروشتات
export const COMMON_MEDICATIONS = [
  { name: 'بانادول اكسترا (Panadol Extra)', category: 'مسكن آلام ومسكن حرارة' },
  { name: 'أموكسيسيلين (Amoxicillin 500mg)', category: 'مضاد حيوي واسع المجال' },
  { name: 'بروفين 400 (Brufen 400mg)', category: 'مضاد للالتهابات ومسكن آلام' },
  { name: 'أوميبرازول 20 (Omeprazole 20mg)', category: 'لعلاج حموضة وقرحة المعدة' },
  { name: 'كونكور 5 (Concor 5mg)', category: 'منظم لضغط الدم ونبضات القلب' },
  { name: 'جلوكوفاج 850 (Glucophage 850mg)', category: 'خافض لمستوى السكر في الدم' },
  { name: 'فينتولين بخاخ (Ventolin)', category: 'موسع للشعب الهوائية لعلاج الربو' },
  { name: 'أوجمنتين 1 جرام (Augmentin 1g)', category: 'مضاد حيوي قوي' },
  { name: 'كلاريتين 10 (Claritin 10mg)', category: 'مضاد للحساسية والجيوب الأنفية' },
  { name: 'سينجولير 10 (Singulair 10mg)', category: 'لعلاج حساسية الصدر والربو' },
];

// بيانات تجريبية باللغة العربية تبدو واقعية
export const STARTER_PATIENTS: Patient[] = [
  {
    id: 'P-1001',
    name: 'أحمد محمود العتيبي',
    phone: '0501234567',
    age: 42,
    gender: 'male',
    bloodType: 'A+',
    chronicDiseases: 'ارتفاع ضغط الدم والسكري من النوع الثاني',
    notes: 'يفضل المواعيد المسائية. لديه حساسية من البنسلين.',
    createdAt: '2026-05-10',
  },
  {
    id: 'P-1002',
    name: 'سارة عبد الله الشمري',
    phone: '0559876543',
    age: 28,
    gender: 'female',
    bloodType: 'O+',
    chronicDiseases: 'لا يوجد',
    notes: 'حالة متابعة ما بعد العملية الجراحية البسيطة.',
    createdAt: '2026-05-12',
  },
  {
    id: 'P-1003',
    name: 'محمد علي بن جاسم',
    phone: '0533334444',
    age: 61,
    gender: 'male',
    bloodType: 'B-',
    chronicDiseases: 'خشونة في مفاصل الركبتين، كولسترول مرتفع',
    notes: 'يحتاج لمساعدة حركية، يرافق ابنه دائماً.',
    createdAt: '2026-05-15',
  },
  {
    id: 'P-1004',
    name: 'فاطمة صالح الزهراني',
    phone: '0544455566',
    age: 35,
    gender: 'female',
    bloodType: 'AB+',
    chronicDiseases: 'قصور الغدة الدرقية',
    notes: 'ملتزمة بجرعات الثايروكسين بانتظام.',
    createdAt: '2026-05-18',
  }
];

export const STARTER_APPOINTMENTS: Appointment[] = [
  {
    id: 'A-501',
    patientId: 'P-1001',
    patientName: 'أحمد محمود العتيبي',
    patientPhone: '0501234567',
    date: '2026-05-23', // اليوم
    time: '18:30',
    type: 'checkup',
    status: 'pending',
    notes: 'قياس السكر التراكمي وتعديل جرعة الجلوكوفاج',
  },
  {
    id: 'A-502',
    patientId: 'P-1002',
    patientName: 'سارة عبد الله الشمري',
    patientPhone: '0559876543',
    date: '2026-05-23', // اليوم
    time: '19:15',
    type: 'followup',
    status: 'completed',
    notes: 'متابعة التئام الجرح وإزالة الغرز الطبية',
  },
  {
    id: 'A-503',
    patientId: 'P-1003',
    patientName: 'محمد علي بن جاسم',
    patientPhone: '0533334444',
    date: '2026-05-24', // غداً
    time: '17:00',
    type: 'consultation',
    status: 'pending',
    notes: 'مراجعة نتائج فحص الرنين المغناطيسي للركبة',
  },
  {
    id: 'A-504',
    patientId: 'P-1004',
    patientName: 'فاطمة صالح الزهراني',
    patientPhone: '0544455566',
    date: '2026-05-25',
    time: '20:00',
    type: 'checkup',
    status: 'pending',
    notes: 'تحليل هرمونات الغدة النخامية والدورية',
  }
];

export const STARTER_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'Rx-201',
    patientId: 'P-1001',
    patientName: 'أحمد محمود العتيبي',
    date: '2026-05-10',
    diagnosis: 'ارتفاع ضغط الدم الشرياني وعدم انتظام السكر',
    medications: [
      { name: 'كونكور 5 (Concor 5mg)', dose: '5 ملجم', frequency: 'مرة واحدة صباحاً', duration: '3 أشهر', notes: 'قبل الإفطار بنصف ساعة' },
      { name: 'جلوكوفاج 850 (Glucophage 850mg)', dose: '850 ملجم', frequency: 'مرتين يومياً', duration: '3 أشهر', notes: 'مع الوجبات الرئيسية' }
    ],
    notes: 'تقليل الملح في الطعام، المشي 30 دقيقة يومياً، مراجعة الطوارئ عند حدوث صداع مفاجئ.'
  },
  {
    id: 'Rx-202',
    patientId: 'P-1004',
    patientName: 'فاطمة صالح الزهراني',
    date: '2026-05-18',
    diagnosis: 'خمول خفيف في الغدة الدرقية ترافقه أعراض تعب',
    medications: [
      { name: 'ثيروكسين 50 ملجم', dose: '50 كجم', frequency: 'مرة واحدة صباحاً', duration: 'شهرين', notes: 'على الريق على الفور عند الاستيقاظ' }
    ],
    notes: 'تجنب تناول الكافيين والحديد في نفس وقت العلاج، الفحص الدوري للغدة بعد شهرين.'
  }
];

/**
 * دالة لتصدير كافة البيانات إلى ملف إكسل احترافي متعدد التبويبات باللغة العربية
 */
export function exportToClinicExcel(
  patients: Patient[],
  appointments: Appointment[],
  prescriptions: Prescription[]
) {
  // 1. تحضير جدول المرضى للحفظ
  const patientRows = patients.map((p, idx) => ({
    'الرقم التسلسلي': idx + 1,
    'كود المريض': p.id,
    'الاسم الكامل': p.name,
    'رقم الجوال': p.phone,
    'العمر': p.age,
    'الجنس': p.gender === 'male' ? 'ذكر' : 'أنثى',
    'فصيلة الدم': p.bloodType || 'غير محدد',
    'الأمراض المزمنة': p.chronicDiseases || 'لا يوجد',
    'تاريخ التسجيل': p.createdAt,
    'ملاحظات إضافية': p.notes || ''
  }));

  // 2. تحضير جدول المواعيد للحفظ
  const appointmentRows = appointments.map((a, idx) => {
    let typeArabic = 'كشف';
    if (a.type === 'consultation') typeArabic = 'استشارة';
    if (a.type === 'followup') typeArabic = 'متابعة';

    let statusArabic = 'قيد الانتظار';
    if (a.status === 'completed') statusArabic = 'مكتملة';
    if (a.status === 'cancelled') statusArabic = 'ملغاة';

    return {
      'الرقم التسلسلي': idx + 1,
      'كود الحجز': a.id,
      'اسم المريض': a.patientName,
      'رقم الجوال': a.patientPhone,
      'التاريخ': a.date,
      'الاسم': a.time,
      'نوع الزيارة': typeArabic,
      'حالة الحجز': statusArabic,
      'ملاحظات الموعد': a.notes || ''
    };
  });

  // 3. تحضير جدول سجلات الأدوية والروشتات للحفظ المباشر في الإكسل
  const prescriptionRows: any[] = [];
  prescriptions.forEach((r, idx) => {
    // لربط الروشتة بأسماء الأدوية بوضوح
    r.medications.forEach((med, medIdx) => {
      prescriptionRows.push({
        'رقم الروشتة': r.id,
        'اسم المريض': r.patientName,
        'التاريخ': r.date,
        'التشخيص': r.diagnosis,
        'اسم الدواء': med.name,
        'الجرعة': med.dose,
        'التكرار والاستخدام': med.frequency,
        'المدة المقررة': med.duration,
        'ملاحظات الدواء': med.notes || '',
        'توصيات الطبيب للمريض': medIdx === 0 ? r.notes || '' : '' // توضع في أول سطر فقط منعاً للتكرار المفرط
      });
    });
  });

  // إنشاء مصنف فارغ للكتابة فيه
  const wb = XLSX.utils.book_new();

  // تحويل الجداول إلى أوراق عمل (Worksheets)
  const patientsWS = XLSX.utils.json_to_sheet(patientRows);
  const appointmentsWS = XLSX.utils.json_to_sheet(appointmentRows);
  const prescriptionsWS = XLSX.utils.json_to_sheet(prescriptionRows);

  // لضبط توجيه النص من اليمين لليسان في الإكسل للتوافق مع العربية
  if (!patientsWS['!views']) patientsWS['!views'] = [];
  patientsWS['!views'].push({ RTL: true });

  if (!appointmentsWS['!views']) appointmentsWS['!views'] = [];
  appointmentsWS['!views'].push({ RTL: true });

  if (!prescriptionsWS['!views']) prescriptionsWS['!views'] = [];
  prescriptionsWS['!views'].push({ RTL: true });

  // إضافة أوراق العمل بأسماء عربية صريحة لداخل المصنف
  XLSX.utils.book_append_sheet(wb, patientsWS, 'قاعدة بيانات المرضى');
  XLSX.utils.book_append_sheet(wb, appointmentsWS, 'جدول المواعيد والزيارات');
  XLSX.utils.book_append_sheet(wb, prescriptionsWS, 'سجلات الروشتات والأدوية');

  // استخراج وتحميل الملف مباشرة بجودة عالية متوافقة مع برنامجي إكسل على الهاتف والكمبيوتر وموزعة الأعمدة بشكل مثالي
  const filename = `سجلات_عيادة_شفا_الكاملة_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
