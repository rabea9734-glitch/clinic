import { useState, FormEvent } from 'react';
import { Users, Search, Plus, UserPlus, Phone, Activity, FileSpreadsheet, Trash2, CalendarClock, Pill, X, Edit, Eye } from 'lucide-react';
import { Patient, Appointment, Prescription } from '../types';

interface PatientsCabinetProps {
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  onAddPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onQuickBook: (patientId: string) => void;
  onQuickPrescribe: (patientId: string) => void;
}

export function PatientsCabinet({
  patients,
  appointments,
  prescriptions,
  onAddPatient,
  onEditPatient,
  onDeletePatient,
  onQuickBook,
  onQuickPrescribe
}: PatientsCabinetProps) {
  // البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // استمارات الإضافة والتعديل
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // عرض تفاصيل الملف الطبي الشامل لمرض معين
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // بيانات استمارة مريض جديد
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bloodType, setBloodType] = useState('O+');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [notes, setNotes] = useState('');

  // استخراج المريض المختار للتفاصيل
  const activePatientDossier = patients.find(p => p.id === selectedPatientId);
  const activePatientAppointments = appointments.filter(a => a.patientId === selectedPatientId);
  const activePatientPrescriptions = prescriptions.filter(pr => pr.patientId === selectedPatientId);

  // تصفية المرضى بناء على البحث
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.phone.includes(searchTerm) || p.id.includes(searchTerm);
    const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  const generateNewId = () => {
    return 'P-' + Math.floor(1000 + Math.random() * 9000);
  };

  const handleAddNewPatientSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !age) {
      alert('الرجاء تعبئة الحقول الأساسية: الاسم، الهاتف، والعمر');
      return;
    }

    const newPatient: Patient = {
      id: generateNewId(),
      name: name.trim(),
      phone: phone.trim(),
      age: Number(age),
      gender,
      bloodType,
      chronicDiseases: chronicDiseases.trim() || 'لا يوجد',
      notes: notes.trim() || '',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddPatient(newPatient);
    resetForm();
    setShowAddForm(false);
  };

  const handleSaveEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    onEditPatient(editingPatient);
    setEditingPatient(null);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setAge('');
    setGender('male');
    setBloodType('O+');
    setChronicDiseases('');
    setNotes('');
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
  };

  return (
    <div id="patients-cabinet-main" className="space-y-6 text-right" dir="rtl">
      {/* البار العلوي والبحث والإضافة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-xl text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">الملفات الطبية للمرضى</h2>
            <p className="text-xs text-gray-400">إدارة وتسجيل سجلات وعملاء العيادة إلكترونياً بالتكامل مع الإكسل</p>
          </div>
        </div>

        <button
          id="toggle-add-patient-form"
          onClick={() => {
            setShowAddForm(!showAddForm);
            resetForm();
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>تسجيل مريض جديد</span>
        </button>
      </div>

      {/* نموذج إضافة مريض جديد */}
      {showAddForm && (
        <div id="add-patient-container" className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-md transition-all">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>إدخال بيانات ملف عميل/مريض جديد</span>
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddNewPatientSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">الاسم الكامل للمريض *</label>
              <input
                type="text"
                placeholder="مثال: أحمد عبد الرحمن المنيع"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">رقم الجوال الشخصي *</label>
              <input
                type="text"
                placeholder="مثال: 050XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">العمر (بالسنوات) *</label>
                <input
                  type="number"
                  placeholder="مثال: 34"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  min="0"
                  max="130"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">فصيلة الدم</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">الجنس</label>
              <div className="flex gap-4 p-1 bg-gray-50 border rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all ${gender === 'male' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all ${gender === 'female' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  أنثى
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">التشخيص المزمن أو الحالات المعروفة (إن وجد)</label>
              <input
                type="text"
                placeholder="مثال: حساسية بنيسلين، كسل غدة درقية، ضغط دم مرتفع"
                value={chronicDiseases}
                onChange={(e) => setChronicDiseases(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات الطبيب العامة عن العميل</label>
              <textarea
                rows={2}
                placeholder="تفاصيل إضافية لتسهيل متابعة الملف في المستقل..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all"
              >
                تأكيد وتسجيل الملف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* تعديل بيانات مريض */}
      {editingPatient && (
        <div id="edit-patient-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border rounded-2xl p-6 w-full max-w-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">تعديل ملف المريض: {editingPatient.name}</h3>
              <button onClick={() => setEditingPatient(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={editingPatient.name}
                  onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">رقم الجوال</label>
                <input
                  type="text"
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">العمر</label>
                <input
                  type="number"
                  value={editingPatient.age}
                  onChange={(e) => setEditingPatient({ ...editingPatient, age: Number(e.target.value) })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">فصيلة الدم</label>
                <select
                  value={editingPatient.bloodType}
                  onChange={(e) => setEditingPatient({ ...editingPatient, bloodType: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">الأمراض المزمنة</label>
                <input
                  type="text"
                  value={editingPatient.chronicDiseases}
                  onChange={(e) => setEditingPatient({ ...editingPatient, chronicDiseases: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">ملاحظات الطبيب</label>
                <textarea
                  rows={2}
                  value={editingPatient.notes}
                  onChange={(e) => setEditingPatient({ ...editingPatient, notes: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* واجهة البحث والتنقية ضمن جدول ملفات المرضى */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيمن: جدول البحث والتصفية لقائمة المرضى */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الجوال أو كود الملف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="all">الأجناس (جميعها)</option>
              <option value="male">ذكور فقط</option>
              <option value="female">إناث فقط</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="py-3 px-4 font-bold">كود المريض</th>
                  <th className="py-3 px-4 font-bold">الاسم</th>
                  <th className="py-3 px-4 font-bold">الهاتف</th>
                  <th className="py-3 px-4 font-bold">السن / الجنس</th>
                  <th className="py-3 px-4 font-bold">فصيلة الدم</th>
                  <th className="py-3 px-4 font-bold">الإجراءات والسجلات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      لا يوجد مرضى يطابقون خيارات البحث الحالية. سجل مريضاً جديداً!
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`hover:bg-emerald-50/40 cursor-pointer transition-colors duration-200 ${selectedPatientId === p.id ? 'bg-emerald-50 border-r-4 border-r-emerald-500' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-gray-700">{p.id}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">{p.name}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono">{p.phone}</td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span>{p.age} سنة</span> - <span>{p.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-700">
                          {p.bloodType || 'A+'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedPatientId(p.id)}
                          title="عرض الملف الطبي الكامل"
                          className="p-1 px-2.5 bg-gray-100 hover:bg-emerald-600 hover:text-white transition-colors rounded-lg text-gray-500 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="تعديل"
                          className="p-1.5 hover:bg-gray-100 text-blue-600 rounded-lg transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من رغبتك بحذف هذا الملف بالكامل؟ سيتم هذا محلياً.')) {
                              onDeletePatient(p.id);
                              if (selectedPatientId === p.id) {
                                setSelectedPatientId(null);
                              }
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* العمود الأيسر: عرض الدوسيه الطبي الشامل للمريض المختار */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 h-fit">
          {activePatientDossier ? (
            <div className="space-y-6">
              {/* ترويسة ملف المريض */}
              <div className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    ملف طبي معتمد
                  </div>
                  <span className="font-mono text-xs text-gray-400">كود: {activePatientDossier.id}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{activePatientDossier.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1.5 font-mono">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  {activePatientDossier.phone}
                </p>
              </div>

              {/* التفاصيل الحيوية */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border">
                <div>
                  <span className="block text-xs text-gray-400">العمر والأجناس</span>
                  <span className="font-semibold text-gray-700 text-sm">{activePatientDossier.age} سنة / {activePatientDossier.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">فصيلة الدم</span>
                  <span className="font-bold text-red-600 text-sm">{activePatientDossier.bloodType || 'A+'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-gray-400">الأمراض المزمنة</span>
                  <span className="font-semibold text-gray-700 text-sm flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    {activePatientDossier.chronicDiseases || 'لا يوجد'}
                  </span>
                </div>
              </div>

              {/* ملاحظات الطبيب */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ملاحظات الطبيب الدائمة</h4>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-sm text-gray-700">
                  {activePatientDossier.notes || 'لا يوجد ملاحظات سابقة مسجلة.'}
                </div>
              </div>

              {/* إجراءات سريعة للموثوقية */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onQuickBook(activePatientDossier.id)}
                  className="flex items-center justify-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>حجز موعد جديد</span>
                </button>
                <button
                  onClick={() => onQuickPrescribe(activePatientDossier.id)}
                  className="flex items-center justify-center gap-1 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Pill className="w-4 h-4" />
                  <span>وصف روشتة دواء</span>
                </button>
              </div>

              {/* سجل المواعيد للمريض */}
              <div className="border-t pt-4">
                <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-emerald-600" />
                  <span>سجل زيارات وحجوزات المريض ({activePatientAppointments.length})</span>
                </h4>
                {activePatientAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-lg text-center">لا توجد زيارات سابقة مجدولة لهذا المريض.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activePatientAppointments.map((appt) => (
                      <div key={appt.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 rounded-xl border">
                        <div>
                          <span className="font-bold text-gray-700 text-right block">{appt.date} - {appt.time}</span>
                          <span className="text-gray-400">نوع الموعد: {appt.type === 'checkup' ? 'كشف' : appt.type === 'consultation' ? 'استشارة' : 'متابعة'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          appt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {appt.status === 'completed' ? 'مكتمل' : appt.status === 'cancelled' ? 'ملغى' : 'منتظر'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* سجل الروشتات الإلكترونية الدوائية */}
              <div className="border-t pt-4">
                <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>سجل الأدوية والروشتات الإلكترونية ({activePatientPrescriptions.length})</span>
                </h4>
                {activePatientPrescriptions.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-lg text-center">لا توجد سجلات أدوية تم وصفها سابقاً.</p>
                ) : (
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {activePatientPrescriptions.map((pr) => (
                      <div key={pr.id} className="p-3 bg-violet-50/40 rounded-xl border border-violet-100 text-right space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-bold text-violet-800 text-xs">التشخيص: {pr.diagnosis}</span>
                          <span className="font-mono text-[10px] text-gray-400">{pr.date}</span>
                        </div>
                        <div className="space-y-1 pl-1">
                          {pr.medications.map((med, index) => (
                            <div key={index} className="text-[11px] text-gray-600 list-disc list-inside">
                              💊 <strong className="text-gray-700">{med.name}</strong> - جرعة ({med.dose}) - {med.frequency} ({med.duration})
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-gray-200 stroke-1" />
              <div>
                <p className="font-bold">يرجى اختيار مريض من الجدول</p>
                <p className="text-xs">لعرض الدملف والملخص الطبي الكامل للمريض وسجلاته ومواعيده السابقة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
