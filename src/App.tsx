import { useState, useEffect } from 'react';
import { Heart, Users, Calendar, Pill, FileSpreadsheet, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { Patient, Appointment, Prescription, ClinicStats as StatsType } from './types';
import {
  STARTER_PATIENTS,
  STARTER_APPOINTMENTS,
  STARTER_PRESCRIPTIONS,
  exportToClinicExcel
} from './data';
import { ClinicStats } from './components/ClinicStats';
import { PatientsCabinet } from './components/PatientsCabinet';
import { AppointmentsBook } from './components/AppointmentsBook';
import { PharmacyCorner } from './components/PharmacyCorner';

export default function App() {
  // تفعيل التوجيه والتبويبات
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // البيانات المسجلة في الذاكرة المحلية أو البيانات الافتراضية
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('clinic_patients');
    return saved ? JSON.parse(saved) : STARTER_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('clinic_appointments');
    return saved ? JSON.parse(saved) : STARTER_APPOINTMENTS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('clinic_prescriptions');
    return saved ? JSON.parse(saved) : STARTER_PRESCRIPTIONS;
  });

  // مريض قيد الاستدعاء السريع لحجز موعد أو صرف روشتة مباشرة
  const [quickActionPatientId, setQuickActionPatientId] = useState<string | null>(null);

  // تحديث الذاكرة المحلية بالتزامن مع أي تغيير
  useEffect(() => {
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('clinic_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  // إحصائيات لوحة التحكم اللحظية
  const calculateStats = (): StatsType => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAppts = appointments.filter(a => a.date === todayStr);

    return {
      totalPatients: patients.length,
      todayAppointments: todayAppts.length,
      pendingBookings: appointments.filter(a => a.status === 'pending').length,
      completedVisits: appointments.filter(a => a.status === 'completed').length,
    };
  };

  const clinicStats = calculateStats();

  // معالجات إدارة المرضى
  const handleAddPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
  };

  const handleEditPatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    // تحديث ديناميكي للاسم في كشوفات المواعيد والروشتات السابقة لتبقى متناسقة
    setAppointments(appointments.map(a => a.patientId === updatedPatient.id ? { ...a, patientName: updatedPatient.name, patientPhone: updatedPatient.phone } : a));
    setPrescriptions(prescriptions.map(pr => pr.patientId === updatedPatient.id ? { ...pr, patientName: updatedPatient.name } : pr));
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    // حذف المواعيد التابعة للمريض المنتهية لحفظ مساحة الذاكرة
    setAppointments(appointments.filter(a => a.patientId !== id));
    setPrescriptions(prescriptions.filter(pr => pr.patientId !== id));
  };

  // معالجات إدارة المواعيد
  const handleAddAppointment = (newAppt: Appointment) => {
    setAppointments([newAppt, ...appointments]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));

    // تجربة مستخدم سلسلة: عند إكمال الموعد بنجاح، يسأل الطبيب عما إذا كان يريد صرف روشتة له على الفور
    if (status === 'completed') {
      const appt = appointments.find(a => a.id === id);
      if (appt && appt.patientId !== 'P-GUEST') {
        setQuickActionPatientId(appt.patientId);
        if (confirm(`تم إكمال الكشف بنجاح! هل ترغب في كتابة وصرف روشتة علاج إلكترونية للمريض (${appt.patientName}) الآن؟`)) {
          setActiveTab('prescriptions');
        } else {
          setQuickActionPatientId(null);
        }
      }
    }
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  // معالجات إدارة الروشتات والأدوية
  const handleAddPrescription = (newPres: Prescription) => {
    setPrescriptions([newPres, ...prescriptions]);
    // عند طباعة روشتة لمريض، يمكن تحويل حالة حجز موعده اليوم تلقائياً إلى مكتمل إذا كان موجوداً
    const todayStr = new Date().toISOString().slice(0, 10);
    const targetAppt = appointments.find(a => a.patientId === newPres.patientId && a.date === todayStr && a.status === 'pending');
    if (targetAppt) {
      setAppointments(appointments.map(a => a.id === targetAppt.id ? { ...a, status: 'completed' } : a));
    }
  };

  const handleDeletePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(pr => pr.id !== id));
  };

  // الربط السريع من دوسيه المريض إلى الحجوزات والروشتات
  const handleRouteToQuickBooking = (patientId: string) => {
    setQuickActionPatientId(patientId);
    setActiveTab('appointments');
  };

  const handleRouteToQuickPrescribing = (patientId: string) => {
    setQuickActionPatientId(patientId);
    setActiveTab('prescriptions');
  };

  const handleExcelExport = () => {
    exportToClinicExcel(patients, appointments, prescriptions);
  };

  return (
    <div id="shifa-app-root" className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800" dir="rtl">
      {/* 1. الشريط الجانبي الأيمن المخصص لسطح المكتب والمصمم بطابع High Density باللون الكحلي الداكن */}
      <aside id="clinic-sidebar" className="w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-l border-slate-800 hidden md:flex font-sans select-none">
        {/* هيدر ترويسة اللوجو في جانب القائمة */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-sky-500 text-white p-2 rounded-xl shadow-inner shadow-black/20">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-1 leading-none">
              <span>شِـفـاء للـرعاية</span>
              <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-800/60 font-bold px-1.5 py-0.5 rounded">Smart Clinic</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium mt-1">سجلات وحجوزات إلكترونية</p>
          </div>
        </div>

        {/* المؤشر التلقائي الذكي ومربع تحميل الإكسل */}
        <div className="m-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2.5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <span>مزامنة ملفات Excel</span>
            <span className="text-emerald-400 animate-pulse flex items-center gap-1 text-[9px]">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
              تلقائي نشط
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            يقوم النظام بتسجيل بيانات المرضى والمواعيد والروشتات لبرنامج Excel تلقائياً بالذاكرة.
          </p>
          <button
            onClick={handleExcelExport}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-emerald-500/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تنزيل شيت إكسل الموحد 📥</span>
          </button>
        </div>

        {/* تبويبات التنقل الرأسية الفخمة والمضغوطة */}
        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'dashboard', label: 'لوحة التحكم السريعة', icon: BarChart3 },
            { id: 'patients', label: 'ملفات وسجل المرضى', icon: Users },
            { id: 'appointments', label: 'المواعيد والحجوزات', icon: Calendar },
            { id: 'prescriptions', label: 'الروشتات وسجل الأدوية', icon: Pill },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // تصفير الربط السريع إذا اختار تبويباً آخراً بنفسه
                  if (tab.id !== 'appointments' && tab.id !== 'prescriptions') {
                    setQuickActionPatientId(null);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-right cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border-r-4 border-sky-500 shadow-sm shadow-black/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/45'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* الفوتر الصغير بداخل الشريط الجانبي */}
        <div className="p-3 border-t border-slate-850 text-[10px] text-slate-500 space-y-1 bg-slate-950/20">
          <div>رمز الطبيب المعتمد: <span className="text-slate-300 font-bold">د. عماد محمد</span></div>
          <div>نظام عيادة شِفاء الذكية v2.0</div>
        </div>
      </aside>

      {/* 2. اللوحة اليسرى الرئيسية للمحتوى */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/50">
        
        {/* هيدر الكفاءة العالية (High Density Toolbar) المخصص لسطح المكتب */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 hidden md:flex items-center justify-between shrink-0 font-sans shadow-2xs select-none">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="text-slate-400">تاريخ العمل الحالي:</span>
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">طابور الانتظار اليوم:</span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
              {appointments.filter(a => a.date === new Date().toISOString().slice(0, 10) && a.status === 'pending').length} انتظار
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100/50 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              قالب Excel الموحد جاهز للتحميل
            </span>
          </div>
        </header>

        {/* هيدر الهواتف المحمولة الذكي والتبويبات الأفقية المتقاطعة */}
        <header className="bg-slate-900 text-white md:hidden sticky top-0 z-40 shrink-0 shadow-md border-b border-slate-850 font-sans">
          <div className="p-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-sky-400 animate-pulse" />
              <h1 className="text-sm font-black text-white">شِـفـاء للـرعاية</h1>
            </div>
            <button
              onClick={handleExcelExport}
              className="bg-emerald-600 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تحميل إكسل 📥</span>
            </button>
          </div>
          {/* تبويبات الأجهزة المحمولة السريعة */}
          <nav className="flex overflow-x-auto border-t border-slate-800 px-1.5 py-1 justify-around text-center gap-1 scrollbar-none bg-slate-950/40">
            {[
              { id: 'dashboard', label: 'الرئيسية', icon: BarChart3 },
              { id: 'patients', label: 'المرضى والملفات', icon: Users },
              { id: 'appointments', label: 'المواعيد', icon: Calendar },
              { id: 'prescriptions', label: 'الروشتات الأدوية', icon: Pill },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'appointments' && tab.id !== 'prescriptions') {
                      setQuickActionPatientId(null);
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold shrink-0 transition-all ${
                    isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* 3. صندوق التبويب الحقيقي والملفات الطبية */}
        <main id="shifa-main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-5">
          {/* صندوق تنبيه إذا كان هناك حجز معلق مسبق للمريض */}
          {quickActionPatientId && (activeTab === 'appointments' || activeTab === 'prescriptions') && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 mb-4 flex justify-between items-center transition-all animate-bounce text-right">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>
                  <strong>وضع الربط السريع نشط:</strong> تم استدعاء المريض (اسم: <strong>{patients.find(p => p.id === quickActionPatientId)?.name}</strong>) تلقائياً لتسجيل موعده أو علاجه.
                </span>
              </div>
              <button
                onClick={() => setQuickActionPatientId(null)}
                className="font-bold underline text-amber-955 bg-white border border-amber-200 px-2.5 py-0.5 rounded-lg hover:bg-amber-100"
              >
                إلغاء الربط
              </button>
            </div>
          )}

          {/* محتويات التبويب النشط */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <ClinicStats
                stats={clinicStats}
                patients={patients}
                appointments={appointments}
                prescriptions={prescriptions}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  setQuickActionPatientId(null);
                }}
              />
              {/* جدول مصغر لمستجدات صالة الانتظار اليوم للمتابعة اللحظية */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <span>حالة طابور العيادة وحجوزات اليوم السريعة</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">سجل الزيارات والانتظام المباشر لخدمة المرضى بكفاءة عالية</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-sky-600 hover:underline hover:text-sky-700"
                  >
                    عرض الجدول الشامل ←
                  </button>
                </div>

                {appointments.filter(a => a.date === new Date().toISOString().slice(0, 10)).length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-400">لا توجد مواعيد مخصصة لليوم حتى الآن. ابدأ بتسجيل حجز جديد!</p>
                ) : (
                  <div className="space-y-1.5">
                    {appointments
                      .filter(a => a.date === new Date().toISOString().slice(0, 10))
                      .slice(0, 3)
                      .map((appt) => (
                        <div key={appt.id} className="flex justify-between items-center px-3 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg text-xs transition-all">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold text-center border border-sky-100">{appt.time}</span>
                            <div>
                              <span className="font-bold text-gray-800 block leading-tight">{appt.patientName}</span>
                              <span className="text-gray-400 text-[10px]">الجوال: {appt.patientPhone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              appt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {appt.status === 'completed' ? 'تم الكشف' : appt.status === 'cancelled' ? 'ملغى' : 'بالانتظار'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <PatientsCabinet
              patients={patients}
              appointments={appointments}
              prescriptions={prescriptions}
              onAddPatient={handleAddPatient}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
              onQuickBook={handleRouteToQuickBooking}
              onQuickPrescribe={handleRouteToQuickPrescribing}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsBook
              appointments={appointments}
              patients={patients}
              onAddAppointment={handleAddAppointment}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDeleteAppointment={handleDeleteAppointment}
              onNavigateToPrescribe={handleRouteToQuickPrescribing}
              defaultPatientId={quickActionPatientId}
              onClearDefaultPatient={() => setQuickActionPatientId(null)}
            />
          )}

          {activeTab === 'prescriptions' && (
            <PharmacyCorner
              prescriptions={prescriptions}
              patients={patients}
              onAddPrescription={handleAddPrescription}
              onDeletePrescription={handleDeletePrescription}
              defaultPatientId={quickActionPatientId}
              onClearDefaultPatient={() => setQuickActionPatientId(null)}
            />
          )}
        </main>

        {/* فوتر مضغوط عالي الكفاءة ومصمم بذوق رفيع */}
        <footer id="shifa-footer" className="bg-white text-slate-500 text-[11px] py-4 border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-center select-none">
            <p className="font-semibold text-slate-700">
              شِـفاء للرعاية © 2026. نظام متكامل لإدارة العيادات وزيارة المرضى والروشتات الطبية إلكترونياً.
            </p>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                ✓ تصدير Excel تلقائي وتخزين فوري بالمتصفح
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
