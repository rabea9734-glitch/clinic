import { useState, FormEvent } from 'react';
import { Calendar, Search, Plus, Clock, User, Phone, Clipboard, Trash2, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Appointment, Patient, AppointmentType, AppointmentStatus } from '../types';

interface AppointmentsBookProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onNavigateToPrescribe: (patientId: string) => void;
  defaultPatientId?: string | null;
  onClearDefaultPatient?: () => void;
}

export function AppointmentsBook({
  appointments,
  patients,
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  onNavigateToPrescribe,
  defaultPatientId,
  onClearDefaultPatient
}: AppointmentsBookProps) {
  // تصفية وطابور البحث
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorSearch, setDoctorSearch] = useState('');

  // استمارة الحجز
  const [showAddForm, setShowAddForm] = useState(!!defaultPatientId);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatientId || '');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // بیانات الموعد الجدید
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('18:00');
  const [type, setType] = useState<AppointmentType>('checkup');
  const [notes, setNotes] = useState('');

  // إذا تم استدعاء المكون مع مريض افتراضي مسبق
  if (defaultPatientId && !selectedPatientId) {
    setSelectedPatientId(defaultPatientId);
    const existingP = patients.find(p => p.id === defaultPatientId);
    if (existingP && !patientSearchQuery) {
      setPatientSearchQuery(existingP.name);
    }
    setShowAddForm(true);
  }

  // تصفية المرضى المقترحين أثناء الكتابة في خانة المريض
  const searchedPatients = patients.filter(p =>
    p.name.includes(patientSearchQuery) || p.phone.includes(patientSearchQuery) || p.id.includes(patientSearchQuery)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // تصفية المواعيد بناءً على اليوم والتصفية النشطة
  const getTodayISO = () => new Date().toISOString().slice(0, 10);
  const getTomorrowISO = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  };

  const filteredAppointments = appointments.filter(a => {
    // تصفية التاريخ
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = a.date === getTodayISO();
    } else if (dateFilter === 'tomorrow') {
      matchesDate = a.date === getTomorrowISO();
    }

    // تصفية الحالة
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

    // تصفية اسم المريض
    const matchesName = a.patientName.includes(doctorSearch) || a.patientPhone.includes(doctorSearch);

    return matchesDate && matchesStatus && matchesName;
  });

  const generateNewId = () => {
    return 'A-' + Math.floor(500 + Math.random() * 500);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId && !patientSearchQuery.trim()) {
      alert('الرجاء اختيار مريض مسجل أو كتابة الاسم على الأقل لإتمام حجز الموعد الجديد');
      return;
    }

    let patientId = selectedPatientId;
    let patientName = '';
    let patientPhone = '';

    if (selectedPatientId) {
      const p = patients.find(x => x.id === selectedPatientId);
      if (p) {
        patientName = p.name;
        patientPhone = p.phone;
      }
    } else {
      // إذا لم يختر مريضاً مسجلاً، نسجل الاسم المدخل كملف غير مسجل
      patientName = patientSearchQuery;
      patientPhone = 'غير مسجل';
      patientId = 'P-GUEST';
    }

    const newAppointment: Appointment = {
      id: generateNewId(),
      patientId,
      patientName,
      patientPhone,
      date,
      time,
      type,
      status: 'pending',
      notes: notes.trim(),
    };

    onAddAppointment(newAppointment);

    // تصفير وتهيئة
    setSelectedPatientId('');
    setPatientSearchQuery('');
    setNotes('');
    setShowAddForm(false);
    if (onClearDefaultPatient) onClearDefaultPatient();
  };

  const handleSelectPatientFromDropdown = (p: Patient) => {
    setSelectedPatientId(p.id);
    setPatientSearchQuery(p.name);
    setShowPatientDropdown(false);
  };

  return (
    <div id="appointments-book-main" className="space-y-6 text-right" dir="rtl">
      {/* الترويسة العليا */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2.5 rounded-xl text-white">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">حجز وإدارة المواعيد اليومية</h2>
            <p className="text-xs text-gray-400">تابع المرضى في صالة الانتظار وخطط للمواعيد القادمة في عيادتك</p>
          </div>
        </div>

        <button
          id="toggle-booking-form"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm && onClearDefaultPatient) {
              onClearDefaultPatient();
            }
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>حجز موعد كشف جديد</span>
        </button>
      </div>

      {/* استمارة حجز موعد جديد */}
      {showAddForm && (
        <div id="add-booking-container" className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>تسجيل موعد كشف أو استشارة جديد</span>
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                if (onClearDefaultPatient) onClearDefaultPatient();
              }}
              className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* اختيار المريض مع محرك البحث الذكي التلقائي */}
            <div className="relative md:col-span-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">اختر المريض المسجل *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="اكتب اسم العميل أو رقمه للبحث..."
                  value={patientSearchQuery}
                  onChange={(e) => {
                    setPatientSearchQuery(e.target.value);
                    setSelectedPatientId(''); // إلغاء الاختيار القديم للبحث من جديد
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              {/* القائمة المنسدلة لأسماء المرضى المطابقين */}
              {showPatientDropdown && patientSearchQuery.trim() !== '' && (
                <div className="absolute right-0 top-full mt-1.5 w-full bg-white border rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y">
                  {searchedPatients.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 text-center">
                      لم يتم العثور على مريض مسجل بهذا الاسم. سيتم حجز الموعد كملف مجهول مؤقت.
                    </div>
                  ) : (
                    searchedPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatientFromDropdown(p)}
                        className="w-full text-right px-4 py-2.5 hover:bg-blue-50 text-xs flex justify-between items-center transition-colors font-medium text-gray-700"
                      >
                        <span>{p.name}</span>
                        <span className="font-mono text-[10px] text-gray-400">({p.phone})</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedPatient ? (
                <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <span>✓ تم ربط الموعد بملف المريض: {selectedPatient.name}</span>
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>سيتم حجز موعد مؤقت لغير المسجلين إذا لم تختر مريضاً من القائمة</span>
                </p>
              )}
            </div>

            {/* تفاصيل التاريخ */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">تاريخ الموعد *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* الوقت */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">الوقت والتوقيت *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* نوع الزيارة */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">نوع الكشف / الزيارة</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="checkup">كشف جديد (Check-up)</option>
                <option value="consultation">استشارة مراجعة (Consultation)</option>
                <option value="followup">متابعة علاج (Follow-up)</option>
              </select>
            </div>

            {/* ملاحظات الموعد */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">سبب الكشف أو شكوى المريض المبدئية</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: آلام حادة في فم المعدة مع حرقان مستمر..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  if (onClearDefaultPatient) onClearDefaultPatient();
                }}
                className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
              >
                تأكيد حجز الموعد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* شريط البحث وتصفية المواعيد لفرز اليوم، الغد، الكل، والانتظار */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'مواعيد اليوم الكلية', value: 'today' },
              { label: 'مواعيد الغد', value: 'tomorrow' },
              { label: 'جميع المواعيد المسجلة', value: 'all' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setDateFilter(tab.value as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  dateFilter === tab.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* بحث بفلتر الاسم */}
            <div className="relative">
              <input
                type="text"
                placeholder="بحث موعد باسم المريض..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="pl-3 pr-9 py-1.5 w-full bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* فلترة لحالة الموعد */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border rounded-xl text-xs focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>
        </div>

        {/* عرض المواعيد النشطة كـ جدول أو بطاقات طابور انتظار */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                <th className="py-3 px-4 font-bold">الوقت / التاريخ</th>
                <th className="py-3 px-4 font-bold">المريض</th>
                <th className="py-3 px-4 font-bold">رقم الجوال</th>
                <th className="py-3 px-4 font-bold">نوع الحجز</th>
                <th className="py-3 px-4 font-bold">السبب الطبي / الملاحظة</th>
                <th className="py-3 px-4 font-bold text-center">الحالة</th>
                <th className="py-3 px-4 font-bold text-left">إجراءات الطبيب والعيادة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    لا توجد مواعيد مجدولة تطابق هذا الخيار اليوم. ابدأ بحجز موعد لأحد المرضى.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-mono text-xs">{appt.time}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({appt.date})</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-800">{appt.patientName}</div>
                      <span className="text-[10px] text-gray-400 font-mono">الرمز: {appt.patientId}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-500 text-xs">{appt.patientPhone}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                        appt.type === 'checkup' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        appt.type === 'consultation' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        'bg-sky-50 text-sky-700 border border-sky-100'
                      }`}>
                        {appt.type === 'checkup' ? 'كشف جديد' : appt.type === 'consultation' ? 'استشارة' : 'متابعة'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600 max-w-xs truncate" title={appt.notes}>
                      {appt.notes || 'لا يوجد ملاحظات طبية'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {appt.status === 'completed' ? 'زيارة مكتملة' :
                         appt.status === 'cancelled' ? 'زيارة ملغاة' : 'في صالة الانتظار'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex justify-end items-center gap-1.5">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'completed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="تحديد كمكتمل"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>كشف مكتمل</span>
                            </button>

                            <button
                              onClick={() => onUpdateStatus(appt.id, 'cancelled')}
                              className="bg-gray-100 hover:bg-red-50 text-red-600 border rounded-lg text-xs p-1.5"
                              title="إلغاء الموعد"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {appt.status === 'completed' && appt.patientId !== 'P-GUEST' && (
                          <button
                            onClick={() => onNavigateToPrescribe(appt.patientId)}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>📝 اكتب الروشتة للعلاج</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('هل ترغب بحذف هذا السجل نهائياً؟')) {
                              onDeleteAppointment(appt.id);
                            }
                          }}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
