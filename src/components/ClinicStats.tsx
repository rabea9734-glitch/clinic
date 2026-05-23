import { Users, Calendar, Clock, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { ClinicStats as StatsType, Patient, Appointment, Prescription } from '../types';
import { exportToClinicExcel } from '../data';

interface ClinicStatsProps {
  stats: StatsType;
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  onNavigate: (tab: string) => void;
}

export function ClinicStats({ stats, patients, appointments, prescriptions, onNavigate }: ClinicStatsProps) {
  const handleExcelExport = () => {
    exportToClinicExcel(patients, appointments, prescriptions);
  };

  const statItems = [
    {
      id: 'patients-stat',
      title: 'إجمالي المرضى المسجلين',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'مريض ومريضة بنشاط مستمر',
      action: () => onNavigate('patients'),
    },
    {
      id: 'today-stat',
      title: 'مواعيد حجز اليوم',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'تمت مراجعتها وجاري تسكين الباقي',
      action: () => onNavigate('appointments'),
    },
    {
      id: 'pending-stat',
      title: 'مواعيد بانتظار الكشف',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      description: 'مرضى في صالة الانتظار الآن',
      action: () => onNavigate('appointments'),
    },
    {
      id: 'completed-stat',
      title: 'الزيارات المكتمِلة',
      value: stats.completedVisits,
      icon: CheckCircle,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
      description: 'تم تقديم الرعاية الطبية والروشتات لهم',
      action: () => onNavigate('prescriptions'),
    },
  ];

  return (
    <div id="stats-container" className="space-y-4">
      {/* بطاقة الترحيب وتحديث الإكسل بطراز عالي الدقة والكثافة */}
      <div id="premium-banner" className="bg-gradient-to-r from-slate-900 to-slate-850 rounded-xl p-5 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-right">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <span>مرحباً بك في لوحة تحكّم عيادة شِفاء الذكية</span>
            <span className="text-sm bg-sky-950 text-sky-400 border border-sky-800/50 px-2 py-0.5 rounded font-bold">بوابة الطبيب</span>
          </h2>
          <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
            منظومة إلكترونية متكاملة لإدارة عيادتك الخاصة وحجز المواعيد وضبط سجلات المرضى. تسجّل جميع العمليات وتُزامن فوريًا مع شيت Microsoft Excel لضمان عدم ضياع أي ملفات ومتابعة فورية.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          {/* تصدير إكسل بنقرة واحدة */}
          <button
            id="excel-export-btn"
            onClick={handleExcelExport}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-emerald-500/30 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تحديث وتصدير شيت إكسل الموحد 📥</span>
          </button>
        </div>
      </div>

      {/* لمحة سريعة بالأرقام */}
      <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              onClick={item.action}
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs hover:border-slate-350 transition-all duration-200 cursor-pointer flex flex-col justify-between group text-right"
            >
              <div className="flex justify-between items-center mb-3">
                <div className={`p-2 rounded-lg ${item.color} border group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
                  {item.value}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-0.5">
                  {item.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
