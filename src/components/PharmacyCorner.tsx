import { useState, FormEvent } from 'react';
import { Pill, Plus, Trash2, User, Search, Printer, FileText, CheckCircle, X, ChevronDown } from 'lucide-react';
import { Prescription, Patient, MedicationItem } from '../types';
import { COMMON_MEDICATIONS } from '../data';

interface PharmacyCornerProps {
  prescriptions: Prescription[];
  patients: Patient[];
  onAddPrescription: (prescription: Prescription) => void;
  onDeletePrescription: (id: string) => void;
  defaultPatientId?: string | null;
  onClearDefaultPatient?: () => void;
}

export function PharmacyCorner({
  prescriptions,
  patients,
  onAddPrescription,
  onDeletePrescription,
  defaultPatientId,
  onClearDefaultPatient
}: PharmacyCornerProps) {
  // تصفية وبحث
  const [searchTerm, setSearchTerm] = useState('');

  // استمارة الروشتة الجديدة
  const [showAddForm, setShowAddForm] = useState(!!defaultPatientId);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatientId || '');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // حقول الروشتة الحرة
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // حقول إضافة دواء ديناميكي للروشتة
  const [medList, setMedList] = useState<MedicationItem[]>([]);
  const [currentMedName, setCurrentMedName] = useState('');
  const [currentDose, setCurrentDose] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState('');
  const [currentDuration, setCurrentDuration] = useState('');
  const [currentMedNotes, setCurrentMedNotes] = useState('');
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);

  // معاينة لطباعة روشتة معينة
  const [activePrintPrescription, setActivePrintPrescription] = useState<Prescription | null>(null);

  // تصفية المرضى المقترحين
  const searchedPatients = patients.filter(p =>
    p.name.includes(patientSearchQuery) || p.phone.includes(patientSearchQuery) || p.id.includes(patientSearchQuery)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // إذا تم استدعاء المكون مع مريض افتراضي مسبق
  if (defaultPatientId && !selectedPatientId) {
    setSelectedPatientId(defaultPatientId);
    const existingP = patients.find(p => p.id === defaultPatientId);
    if (existingP && !patientSearchQuery) {
      setPatientSearchQuery(existingP.name);
    }
    setShowAddForm(true);
  }

  // تصفية اقتراحات الأدوية بناء على الكتابة
  const filteredMedSuggestions = COMMON_MEDICATIONS.filter(med =>
    med.name.toLowerCase().includes(currentMedName.toLowerCase())
  );

  // تصفية الروشتات السابقة
  const filteredPrescriptions = prescriptions.filter(pr =>
    pr.patientName.includes(searchTerm) || pr.diagnosis.includes(searchTerm) || pr.id.includes(searchTerm)
  );

  const handleAddMedicationToDraft = () => {
    if (!currentMedName.trim()) {
      alert('الرجاء كتابة اسم الدواء لإضافته للروشتة');
      return;
    }

    const newMed: MedicationItem = {
      name: currentMedName.trim(),
      dose: currentDose.trim() || 'غير محددة',
      frequency: currentFrequency.trim() || 'مرة واحدة يومياً',
      duration: currentDuration.trim() || '7 أيام',
      notes: currentMedNotes.trim() || '',
    };

    setMedList([...medList, newMed]);

    // إعادة تعيين حقول الدواء المنفرد
    setCurrentMedName('');
    setCurrentDose('');
    setCurrentFrequency('');
    setCurrentDuration('');
    setCurrentMedNotes('');
    setShowMedSuggestions(false);
  };

  const handleRemoveMedFromDraft = (index: number) => {
    setMedList(medList.filter((_, i) => i !== index));
  };

  const generateNewId = () => {
    return 'Rx-' + Math.floor(100 + Math.random() * 900);
  };

  const handleSavePrescriptionSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      alert('الرجاء اختيار مريض مسجل لإنشاء الروشتة وربطها بملفه الطبي');
      return;
    }

    if (!diagnosis.trim()) {
      alert('الرجاء إدخال التشخيص أو وصف الحالة الطبية');
      return;
    }

    if (medList.length === 0) {
      alert('الرجاء إضافة دواء واحد على الأقل داخل الروشتة الحالية');
      return;
    }

    const newPrescription: Prescription = {
      id: generateNewId(),
      patientId: selectedPatientId,
      patientName: selectedPatient?.name || 'مريض مسجل',
      date: new Date().toISOString().slice(0, 10),
      diagnosis: diagnosis.trim(),
      medications: medList,
      notes: doctorNotes.trim() || 'يلتزم المريض بجرعات الأدوية بانتظام ومراجعة العيادة عند الحاجة.',
    };

    onAddPrescription(newPrescription);

    // تصفير وتهيئة الاستمارة بالكامل
    setSelectedPatientId('');
    setPatientSearchQuery('');
    setDiagnosis('');
    setDoctorNotes('');
    setMedList([]);
    setShowAddForm(false);
    if (onClearDefaultPatient) onClearDefaultPatient();
  };

  const triggerPrintPrescription = (prescription: Prescription) => {
    setActivePrintPrescription(prescription);
  };

  return (
    <div id="pharmacy-corner-main" className="space-y-6 text-right" dir="rtl">
      {/* الترويسة الرئيسية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500 p-2.5 rounded-xl text-white">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">الروشتات الإلكترونية وسجلات الأدوية</h2>
            <p className="text-xs text-gray-400">صرف الروشتات الطبية إلكترونياً وتوثيق خطط علاج المرضى ومتابعة جرعاتهم</p>
          </div>
        </div>

        <button
          id="toggle-prescriber"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm && onClearDefaultPatient) {
              onClearDefaultPatient();
            }
          }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>كتابة وصرف روشتة علاجية</span>
        </button>
      </div>

      {/* استمارة كتابة روشتة جديدة وصرف خطة أدوية */}
      {showAddForm && (
        <div id="new-prescription-card" className="bg-white border-2 border-violet-100 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h3 className="text-lg font-bold text-violet-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-600" />
              <span>صياغة روشتة إلكترونية للعملاء</span>
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

          <form onSubmit={handleSavePrescriptionSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ربط المريض */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم المريض المستفيد *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="اكتب للبحث واختيار المريض لتنزيل الروشتة بملفه..."
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setSelectedPatientId('');
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>

                {showPatientDropdown && patientSearchQuery.trim() !== '' && (
                  <div className="absolute right-0 top-full mt-1.5 w-full bg-white border rounded-xl shadow-lg z-30 max-h-40 overflow-y-auto divide-y">
                    {searchedPatients.length === 0 ? (
                      <div className="p-3 text-xs text-gray-400 text-center">لا توجد نتائج مطابقة، سجل المريض أولاً في الواجهة السابقة</div>
                    ) : (
                      searchedPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setPatientSearchQuery(p.name);
                            setShowPatientDropdown(false);
                          }}
                          className="w-full text-right px-4 py-2 hover:bg-violet-50 text-xs flex justify-between items-center text-gray-700"
                        >
                          <span>{p.name}</span>
                          <span className="font-mono text-gray-400 text-[10px]">({p.phone})</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedPatient ? (
                  <p className="text-xs text-emerald-600 font-medium mt-1">✓ المريض المختار: {selectedPatient.name} (سنّه: {selectedPatient.age})</p>
                ) : (
                  <p className="text-xs text-rose-500 mt-1">يرجى اختيار مريض مسجل لكي يتم ربط روشتة الأدوية الحالية بسجلاته اتوماتيكياً.</p>
                )}
              </div>

              {/* التشخيص الطبي */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">التشخيص المرضي للحالة *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="مثال: التهاب بكتيري في اللوزتين، حساسية صدر حادة"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>
            </div>

            {/* سيكشن إضافة الدواء الديناميكي */}
            <div className="bg-violet-50/40 border border-violet-100 rounded-2xl p-4 md:p-5 space-y-4">
              <span className="text-sm font-bold text-violet-800 flex items-center gap-1.5">
                <Pill className="w-5 h-5 text-violet-600" />
                <span>إدراج وتجزءة بند دوائي داخل الروشتة (Dynamic Drug Prescriber)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                {/* اسم الدواء مع اقتراحات ذكية */}
                <div className="relative lg:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">اسم العلاج التجاري / العلمي</label>
                  <input
                    type="text"
                    value={currentMedName}
                    onChange={(e) => {
                      setCurrentMedName(e.target.value);
                      setShowMedSuggestions(true);
                    }}
                    placeholder="اموكسيل، بنادول..."
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                  {showMedSuggestions && currentMedName.trim() !== '' && (
                    <div className="absolute right-0 top-full mt-1 w-full bg-white border rounded-xl shadow-md z-20 max-h-36 overflow-y-auto divide-y text-xs">
                      {filteredMedSuggestions.map((m) => (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => {
                            setCurrentMedName(m.name);
                            setCurrentMedNotes(m.category); // تعبئة الوصف التلقائي
                            setShowMedSuggestions(false);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-violet-100 text-gray-700"
                        >
                          <strong>{m.name}</strong> <span className="text-gray-400">({m.category})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* الجرعة */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الجرعة المحددة</label>
                  <input
                    type="text"
                    value={currentDose}
                    onChange={(e) => setCurrentDose(e.target.value)}
                    placeholder="مثال: حبة واحدة، 5 مل"
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* التكرار */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">التكرار اليومي</label>
                  <input
                    type="text"
                    value={currentFrequency}
                    onChange={(e) => setCurrentFrequency(e.target.value)}
                    placeholder="مثال: 3 مرات يومياً"
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* المدة وملاحظات */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">المدة</label>
                    <input
                      type="text"
                      value={currentDuration}
                      onChange={(e) => setCurrentDuration(e.target.value)}
                      placeholder="٧ أيام"
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedicationToDraft}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-transform duration-200 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>أضف</span>
                  </button>
                </div>
              </div>

              {/* ملاحظات الاستخدام */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={currentMedNotes}
                    onChange={(e) => setCurrentMedNotes(e.target.value)}
                    placeholder="توجيهات الاستخدام الإضافية (e.g. قبل الأكل بـ 20 دقيقة، مع وفرة من المياه)"
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="text-gray-400 text-xs">اكتب ملاحظة كـ (قبل/بعد الأكل) للتوضيح</div>
              </div>

              {/* لائحة الأدوية المضافة حالياً للروشتة قيد الإعداد */}
              <div className="bg-white border rounded-xl p-3">
                <span className="block text-xs font-semibold text-gray-400 mb-2">الأدوية المدرجة في الروشتة الحالية ({medList.length})</span>
                {medList.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-400">لم يتم إدراج أي أدوية بعد في روشتة المريض الحالية. أضف دواءً من الأعلى.</p>
                ) : (
                  <div className="divide-y text-xs">
                    {medList.map((med, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2">
                        <div className="text-gray-700">
                          <span className="font-bold text-violet-800 bg-violet-50 px-2 py-0.5 rounded-lg ml-2">{idx + 1}</span>
                          <strong>{med.name}</strong> - <span>الجرعة: {med.dose}</span> - <span>{med.frequency}</span> - <span>المدة: {med.duration}</span>
                          {med.notes && <span className="text-gray-400 block mr-8 text-[11px] font-sans">توجيه: (⚠️ {med.notes})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedFromDraft(idx)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* نصائح الطبيب الكلية */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">نصائح وإرشادات الطبيب العامة للمريض</label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="مثال: يرجى الراحة التامة وتجنب المنبهات الباردة، المراجعة بعد أسبوع لقياس الضغط مرة أخرى..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  if (onClearDefaultPatient) onClearDefaultPatient();
                }}
                className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                حفظ وصرف الروشتة إلكترونياً
              </button>
            </div>
          </form>
        </div>
      )}

      {/* الروشتات السابقة الموثقة في العيادة */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-base font-bold text-gray-800">سجل الطبيب التاريخي للروشتات والأدوية المسجلة</h3>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="ابحث باسم المريض أو التشخيص الطبي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-9 py-2 w-full bg-gray-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* شبكة الروشتات العيادية */}
        {filteredPrescriptions.length === 0 ? (
          <div className="py-12 text-center text-gray-400">لم يتم تدوين أو صرف أي روشتات مطابقة لخيارات البحث حتى الآن في صيدلية العيادة.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrescriptions.map((pr) => (
              <div key={pr.id} className="border rounded-2xl p-5 bg-stone-50/50 hover:bg-white transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b pb-2.5 mb-3 text-xs">
                    <div>
                      <span className="font-bold text-gray-800 text-sm block">{pr.patientName}</span>
                      <span className="text-gray-400 text-[10px] font-mono">الروشتة: {pr.id}</span>
                    </div>
                    <span className="font-mono text-gray-400 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">{pr.date}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">التشخيص الطبي العام:</span>
                      <p className="text-xs font-semibold text-gray-700">{pr.diagnosis}</p>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      <span className="text-[10px] text-violet-700 font-bold block">الأدوية الموصوفة والجرعات:</span>
                      {pr.medications.map((item, id) => (
                        <div key={id} className="text-xs text-gray-600 bg-white border border-gray-100 p-2 rounded-lg leading-relaxed flex justify-between items-start">
                          <div>
                            <span className="font-bold text-gray-800 block">💊 {item.name}</span>
                            <span className="text-[11px] text-gray-500">الجرعة: {item.dose} ({item.frequency})</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">لمدة {item.duration}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-[11px] text-gray-600 italic">
                      💡 <strong>نصائح المريض:</strong> {pr.notes}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 mt-4 border-t text-xs">
                  <button
                    onClick={() => triggerPrintPrescription(pr)}
                    className="flex items-center gap-1 bg-violet-100 hover:bg-violet-200 text-violet-800 font-bold px-3 py-1.5 rounded-lg transition-transform cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة ومعاينة الروشتة 🏷️</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من رغبتك بالمسح؟')) {
                        onDeletePrescription(pr.id);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال معاينة الروشتة للطباعة الحقيقية (Real Clinic Prescription Template) */}
      {activePrintPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-4 border-double border-gray-300 rounded-xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative text-right font-sans">
            <button
              onClick={() => setActivePrintPrescription(null)}
              className="absolute left-4 top-4 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-100 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            {/* قالب الروشتة للعيادة */}
            <div id="printable-area-prescription" className="space-y-6">
              {/* هيدر تذكرة العيادة */}
              <div className="border-b-2 border-emerald-600 pb-4 text-center space-y-1">
                <h2 className="text-xl font-extrabold text-emerald-800">عيادة الشفاء والرعاية الطبية التخصصية</h2>
                <p className="text-xs text-gray-500">تخصص طب عام وأمراض مزمنة وباطنية</p>
                <p className="text-[10px] text-gray-400">تواصل: 0501234567 | البريد الإلكتروني للتقارير </p>
              </div>

              {/* تفاصيل المريض والتشخيص */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-lg border">
                <div>
                  <span className="text-gray-400">المريض:</span>
                  <p className="font-bold text-gray-800 text-sm">{activePrintPrescription.patientName}</p>
                </div>
                <div>
                  <span className="text-gray-400">تاريخ الصرف:</span>
                  <p className="font-bold text-gray-800 font-mono text-sm">{activePrintPrescription.date}</p>
                </div>
                <div className="col-span-2 border-t pt-2 mt-2">
                  <span className="text-gray-400">التشخيص الطبي المتكامل:</span>
                  <p className="font-semibold text-rose-800">{activePrintPrescription.diagnosis}</p>
                </div>
              </div>

              {/* رمز Rx الروشتة الشهير */}
              <div className="my-1 text-right">
                <span className="font-serif italic text-4xl font-extrabold text-emerald-700 block pr-2">Rx</span>
              </div>

              {/* جدول العقارات الدوائية */}
              <div className="space-y-3.5 pl-3 border-r-2 border-slate-200">
                {activePrintPrescription.medications.map((item, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>{index + 1}. {item.name}</span>
                      <span className="font-mono text-gray-500 text-[10px]">المدة: {item.duration}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mr-4">
                      <span>الجرعة المحددة: {item.dose}</span>
                      <span className="mx-2">•</span>
                      <span>طريقة الاستخدام والتكرار: {item.frequency}</span>
                      {item.notes && (
                        <p className="text-amber-800 text-[10px] font-sans mt-0.5">⚠️ ملاحظة مصرفية: {item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* توصيات طبية عامة */}
              <div className="bg-amber-50 rounded-lg p-3 text-[11px] text-gray-700">
                <span className="font-bold block text-amber-800 mb-1">تعليمات الطبيب الاسترشادية:</span>
                <p className="leading-relaxed font-sans">{activePrintPrescription.notes}</p>
              </div>

              {/* فوتر وتوقيع الطبيب المعتمد */}
              <div className="flex justify-between items-end border-t pt-4 text-[10px] text-gray-400">
                <div>
                  <span>الرمز المرجعي: {activePrintPrescription.id}</span>
                  <p className="font-mono">صرف إلكترونياً اتوماتيك</p>
                </div>
                <div className="text-left">
                  <span>توقيع الطبيب المعتمد:</span>
                  <div className="h-8 w-24 border-b border-gray-300 mt-1 italic font-serif text-emerald-800 text-right pr-2">
                    د. عماد محمد
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار الإجراء الطباعي */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>بدء الطباعة الحقيقية</span>
              </button>
              <button
                onClick={() => setActivePrintPrescription(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-4 py-2 rounded-xl"
              >
                إغلاق الخيارات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
