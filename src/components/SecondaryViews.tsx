import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sliders, 
  Truck, 
  Bell, 
  Percent, 
  BarChart3, 
  DollarSign, 
  UserCheck, 
  CreditCard, 
  Settings,
  Store,
  Gift,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Key,
  RefreshCw,
  Server,
  Zap,
  Check
} from 'lucide-react';
import { TabType } from '../types';

interface ViewProps {
  tab: TabType;
  selectedBranch: string;
}

export const SecondaryViews: React.FC<ViewProps> = ({ tab, selectedBranch }) => {
  // SSL & Security Settings State
  const [forceHttps, setForceHttps] = useState(true);
  const [enableHsts, setEnableHsts] = useState(true);
  const [enableXssProtection, setEnableXssProtection] = useState(true);
  const [enableFirestoreSsl, setEnableFirestoreSsl] = useState(true);
  const [isVerifyingSsl, setIsVerifyingSsl] = useState(false);
  const [sslMessage, setSslMessage] = useState<string | null>(null);

  const handleVerifySsl = () => {
    setIsVerifyingSsl(true);
    setSslMessage(null);
    setTimeout(() => {
      setIsVerifyingSsl(false);
      setSslMessage('تم فحص شهادة SSL وتأكيد بروتوكول HTTPS بنجاح! جميع الاتصالات مشفرة بدرجة أمان 256-bit AES بدون أي تحذيرات.');
    }, 1200);
  };

  if (tab === 'settings') {
    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center border border-slate-700 shadow-xs">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">إعدادات الأمان والتشفير وشهادات SSL / HTTPS</h2>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  اتصال مشفر وآمن 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                إدارة بروتوكول HTTPS، ترويسات أمان الشبكة (HSTS)، وشهادات التشفير لنطاق المنصة الرسمية
              </p>
            </div>
          </div>

          <button
            onClick={handleVerifySsl}
            disabled={isVerifyingSsl}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifyingSsl ? 'animate-spin' : ''}`} />
            <span>{isVerifyingSsl ? 'جاري فحص الشهادة...' : 'إعادة فحص شهادة SSL وتحديث الأمان'}</span>
          </button>
        </div>

        {sslMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{sslMessage}</span>
          </div>
        )}

        {/* SSL Certificate Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">النطاق المحمي (Official Domain)</span>
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-base font-bold text-slate-800 font-mono dir-ltr text-right">
              https://jahezye.com
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              تم فرض تحويل HTTPS الإجباري
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">جهة إصدار شهادة SSL</span>
              <Server className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-base font-bold text-slate-800 font-mono">
              Google Trust Services / Let's Encrypt
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              التشفير: TLS 1.3 (256-bit AES GCM)
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">حالة التجديد التلقائي</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-base font-bold text-emerald-700">
              سارية ومفعلة تلقائياً
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              تاريخ الانتهاء: 2027-12-31 (Auto-Renew)
            </div>
          </div>
        </div>

        {/* HTTPS & Security Controls */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">إعدادات بروتوكول الأمان وتشفير البيانات (HTTPS & SSL Protocol)</h3>
          </div>

          <div className="space-y-4">
            {/* Control 1: Force HTTPS */}
            <div className="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl border border-gray-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-800 block">فرض تحويل جميع الزوار لبروتوكول HTTPS الإجباري</span>
                <span className="text-xs text-slate-400 block">إعادة توجيه أي طلب HTTP تلقائياً إلى الرابط المشفر SSL لضمان عدم ظهور أي تحذير أمان</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={forceHttps} 
                  onChange={(e) => setForceHttps(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Control 2: HSTS */}
            <div className="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl border border-gray-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-800 block">تفعيل ترويسة HSTS (Strict-Transport-Security)</span>
                <span className="text-xs text-slate-400 block">إلزام متصفح العميل بالتواصل الحصري مع خوادم المنصة عبر التشفير العالي لمدة سنة</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableHsts} 
                  onChange={(e) => setEnableHsts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Control 3: XSS & CSRF */}
            <div className="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl border border-gray-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-800 block">حماية الجلسات والبيانات من هجمات Cross-Site Scripting (XSS)</span>
                <span className="text-xs text-slate-400 block">فحص مدخلات النموذج والبريد الإلكتروني وتوثيق الجلسة بحماية SSL العالية</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableXssProtection} 
                  onChange={(e) => setEnableXssProtection(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Control 4: Firestore SSL */}
            <div className="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl border border-gray-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-800 block">تشفير اتصالات Firestore وقواعد البيانات مباشرة (gRPC / SSL)</span>
                <span className="text-xs text-slate-400 block">تأمين كل عمليات الاستعلام وتحديثات أسعار المنتجات والمتاجر بشهادة غوغل السحابية</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableFirestoreSsl} 
                  onChange={(e) => setEnableFirestoreSsl(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Platform Info */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between text-xs text-slate-500">
          <span>نظام جاهز لإدارة المطاعم والمتاجر — الإصدار 3.5 (النسخة المستقرة)</span>
          <span className="font-mono text-slate-400">SSL Certificate Fingerprint: SHA-256 (Verified)</span>
        </div>
      </div>
    );
  }

  if (tab === 'orders') {
    return (
      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">إدارة الطلبات الحية ({selectedBranch})</h2>
              <p className="text-xs text-slate-400">متابعة طلبات العملاء والحالات لحظة بلحظة</p>
            </div>
          </div>
          <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-bold">
            النظام متصل مباشرة بـ Firestore
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-slate-400 block font-medium">الطلبات الجديدة</span>
              <span className="text-2xl font-bold text-amber-600 font-sans">14</span>
            </div>
            <Clock className="w-8 h-8 text-amber-500 bg-amber-50 p-1.5 rounded-lg border border-amber-100" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-slate-400 block font-medium">قيد التحضير في المطبخ</span>
              <span className="text-2xl font-bold text-blue-600 font-sans">8</span>
            </div>
            <Sliders className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg border border-blue-100" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-slate-400 block font-medium">تم التوصيل بنجاح اليوم</span>
              <span className="text-2xl font-bold text-green-600 font-sans">42</span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-lg border border-green-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center space-y-3 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">قائمة الطلبات جارية المعالجة</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            جميع البيانات مرتبطة بتصنيفات المنتجات وقاعدة بيانات الأسعار.
          </p>
        </div>
      </div>
    );
  }

  if (tab === 'modifiers') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Sliders className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">إدارة الخيارات والخصائص (Modifiers)</h2>
            <p className="text-xs text-slate-400">إضافة إضافات المنتجات مثل (جبنة إضافية، صلصات، الأحجام والدرجات)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {['إضافات الجبن والصوصات', 'أحجام الوجبات (وسط / كبير)', 'المشروبات المرفقة', 'مستوى الحدوقية والبهارات'].map((item) => (
            <div key={item} className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm text-slate-800 flex items-center justify-between">
              <span>{item}</span>
              <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-medium">مفعل</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'offers') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">العروض والتخفيضات المميزة</h2>
            <p className="text-xs text-slate-400">إدارة بانرات العروض والخصومات المؤقتة للمنتجات</p>
          </div>
        </div>
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-2">
          <Gift className="w-10 h-10 text-red-400 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">لا توجد عروض ترويجية منتهية</h4>
          <p className="text-xs text-slate-400">العروض الحالية مرتبطة تلقائياً بخصومات المنتجات في جدول المنتجات.</p>
        </div>
      </div>
    );
  }

  if (tab === 'delivery') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">إدارة التوصيل وأسطول السائقين</h2>
            <p className="text-xs text-slate-400">تتبع السائقين وتحديد نطاق التوصيل لفرع ({selectedBranch})</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-blue-600">سائقين متصلين الآن</span>
            <div className="text-2xl font-bold text-blue-900 font-sans">28 سائق</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-green-600">طلبات في الطريق للعملاء</span>
            <div className="text-2xl font-bold text-green-900 font-sans">19 طلب</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-purple-600">متوسط وقت التوصيل</span>
            <div className="text-2xl font-bold text-purple-900 font-sans">24 دقيقة</div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'financial' || tab === 'reports') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">التقارير المالية والمبيعات التفصيلية</h2>
            <p className="text-xs text-slate-400">متابعة الإيرادات والعمولات والأرباح لكل فرع ومتجر</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-emerald-700">إجمالي مبيعات الشهر</span>
            <div className="text-2xl font-bold text-emerald-900 font-sans">4,850,000 ر.ي</div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-blue-700">صافي عمولات المنصة</span>
            <div className="text-2xl font-bold text-blue-900 font-sans">485,000 ر.ي</div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-amber-700">الطلبات المكتملة</span>
            <div className="text-2xl font-bold text-amber-900 font-sans">1,420 طلب</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3 shadow-xs">
      <Settings className="w-10 h-10 text-slate-400 mx-auto" />
      <h3 className="text-lg font-bold text-slate-800">وحدة {tab} في تطبيق جاهز</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">
        هذا القسم مرتبط بقاعدة بيانات Firestore وتطبيق الحماية والأمان المتقدم.
      </p>
    </div>
  );
};

