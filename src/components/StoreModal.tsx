import React, { useState, useEffect } from 'react';
import { X, Store, Image as ImageIcon, Clock, Phone, MapPin, Truck, DollarSign, Tag, Layers, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { Store as StoreType, Category } from '../types';
import { compressImageFile } from '../lib/imageUtils';
import { getCategoryDefaultLogo } from '../lib/categoryUtils';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeData: Partial<StoreType>) => Promise<void>;
  store?: StoreType | null;
  categories: Category[];
}

const SAMPLE_COVERS = [
  { name: 'محل عصائر', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80' },
  { name: 'سوبرماركت', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' },
  { name: 'محل ملابس', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80' },
  { name: 'مطعم ومأكولات', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { name: 'مخبز وحلويات', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
  { name: 'صيدلية', url: 'https://images.unsplash.com/photo-1586015555751-63c3d0c29676?auto=format&fit=crop&w=800&q=80' },
  { name: 'إلكترونيات', url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80' }
];

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  store,
  categories
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [workingHours, setWorkingHours] = useState('08:00 AM - 12:00 PM');
  const [serviceType, setServiceType] = useState<'delivery' | 'pickup' | 'both'>('both');
  const [deliveryFeeType, setDeliveryFeeType] = useState<'fixed' | 'distance'>('fixed');
  const [fixedDeliveryFee, setFixedDeliveryFee] = useState<number>(1000);
  const [status, setStatus] = useState<'open' | 'closed' | 'maintenance'>('open');
  const [sectionsInput, setSectionsInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setDescription(store.description || '');
      setAddress(store.address || '');
      setPhone(store.phone || '');
      setCategoryId(store.categoryId || '');
      setLogoUrl(store.logoUrl || '');
      setCoverUrl(store.coverUrl || '');
      setWorkingHours(store.workingHours || '08:00 AM - 12:00 PM');
      setServiceType(store.serviceType || 'both');
      setDeliveryFeeType(store.deliveryFeeType || 'fixed');
      setFixedDeliveryFee(store.fixedDeliveryFee || 1000);
      setStatus(store.status || 'open');
      setSectionsInput(store.sections ? store.sections.join('، ') : 'مقبلات، وجبات رئيسية، مشروبات');
    } else {
      setName('');
      setDescription('');
      setAddress('شارع الزبيري - صنعاء');
      setPhone('771234567');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setLogoUrl('');
      setCoverUrl(SAMPLE_COVERS[0].url);
      setWorkingHours('09:00 ص - 11:30 م');
      setServiceType('both');
      setDeliveryFeeType('fixed');
      setFixedDeliveryFee(1000);
      setStatus('open');
      setSectionsInput('مقبلات، وجبات رئيسية، مشروبات وعصائر');
    }
    setError(null);
  }, [store, isOpen, categories]);

  if (!isOpen) return null;

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const compressedDataUrl = await compressImageFile(file, 400, 400, 0.8);
        setLogoUrl(compressedDataUrl);
      } catch (err) {
        setError('تعذر تحميل وضغط الشعار، يرجى اختيار صورة أخرى');
      }
    }
  };

  const selectedCategoryObj = categories.find(c => c.id === categoryId);
  const activeCategoryName = selectedCategoryObj ? selectedCategoryObj.name : 'عام';
  const autoCategoryLogo = getCategoryDefaultLogo(categoryId, activeCategoryName, categories);
  const effectiveLogoUrl = logoUrl.trim() || autoCategoryLogo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى كتابة اسم المتجر أو المطعم');
      return;
    }

    const sectionsArray = sectionsInput
      .split(/[,،\n]/)
      .map(s => s.trim())
      .filter(Boolean);

    // If logoUrl is left blank, automatically use the category's logo
    const finalLogoUrl = logoUrl.trim() || autoCategoryLogo;

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        categoryId: categoryId || (categories[0]?.id || 'default'),
        categoryName: activeCategoryName,
        logoUrl: finalLogoUrl,
        coverUrl: coverUrl.trim() || autoCategoryLogo,
        workingHours: workingHours.trim(),
        serviceType,
        deliveryFeeType,
        fixedDeliveryFee: Number(fixedDeliveryFee),
        status,
        sections: sectionsArray.length > 0 ? sectionsArray : ['عام']
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ بيانات المتجر');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-gray-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-200" />
            <h3 className="text-lg font-bold">
              {store ? 'تعديل بيانات المتجر / المطعم' : 'إضافة متجر جديد'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                اسم المتجر / المطعم <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مطعم البيك / صيدلية الأمل / سوبرماركت البركة"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                التصنيف التابع له <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 text-slate-700"
                required
              >
                <option value="" disabled>اختر التصنيف الرئيسي...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                رقم التواصل / الهاتف
              </label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77XXXXXXX"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                عنوان الفرع / الموقع
              </label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="اسم الشارع، الحي، المدينة"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Working Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                أوقات الدوام والعمل
              </label>
              <input 
                type="text" 
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="مثال: 08:00 ص - 11:30 م"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Service Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                نوع الخدمة المتاحة
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                <option value="both">توصيل واستلام ذاتي (كليهما)</option>
                <option value="delivery">توصيل فقط</option>
                <option value="pickup">استلام ذاتي من الفرع فقط</option>
              </select>
            </div>

            {/* Delivery Fee Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                رسوم التوصيل
              </label>
              <select
                value={deliveryFeeType}
                onChange={(e) => setDeliveryFeeType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                <option value="fixed">سعر ثابت للتوصيل</option>
                <option value="distance">حسب المسافة والكيلومترات</option>
              </select>
            </div>

            {/* Fixed Fee value */}
            {deliveryFeeType === 'fixed' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  قيمة التوصيل الثابتة (ريال)
                </label>
                <input 
                  type="number" 
                  value={fixedDeliveryFee}
                  onChange={(e) => setFixedDeliveryFee(Number(e.target.value))}
                  step="100"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 font-sans"
                />
              </div>
            )}

            {/* Store Status */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                حالة المتجر الحالية
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('open')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    status === 'open' 
                      ? 'bg-green-50 border-green-500 text-green-700 shadow-2xs' 
                      : 'bg-gray-50 border-gray-200 text-slate-600'
                  }`}
                >
                  🟢 مفتوح ومتاح للطلب
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('closed')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    status === 'closed' 
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-2xs' 
                      : 'bg-gray-50 border-gray-200 text-slate-600'
                  }`}
                >
                  🔴 مغلق الآن
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('maintenance')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    status === 'maintenance' 
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-2xs' 
                      : 'bg-gray-50 border-gray-200 text-slate-600'
                  }`}
                >
                  🟡 صيانة مؤقتة
                </button>
              </div>
            </div>

            {/* Cover Image URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                رابط صورة الغلاف (Cover)
              </label>
              <input 
                type="text" 
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                <span className="text-[11px] text-slate-400 shrink-0">نماذج صور:</span>
                {SAMPLE_COVERS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCoverUrl(c.url)}
                    className="text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 px-2 py-0.5 rounded-md shrink-0 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Image & Fallback Setup */}
            <div className="space-y-2 md:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>شعار أو لوقو المتجر (Logo)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    يمكنك رفع الشعار يدوياً، إدخال رابط، أو تركه فارغاً وسيتم اعتماد الشعار التلقائي حسب تصنيف المتجر.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* File Upload Button */}
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع شعار من الجهاز</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {logoUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors border border-red-200"
                    >
                      اعتماد شعار التصنيف التلقائي
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 items-center pt-1">
                {/* Logo Preview Container */}
                <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden shrink-0 flex items-center justify-center group shadow-2xs">
                  <img 
                    src={effectiveLogoUrl} 
                    alt="Store Logo Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = autoCategoryLogo;
                    }}
                  />
                  {!logoUrl.trim() && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-center p-1">
                      <span className="text-[9px] font-bold text-white bg-blue-600/90 px-1 py-0.5 rounded">تلقائي</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input 
                    type="text" 
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="رابط الشعار الخاص، أو اتركه فارغاً للاستخدام التلقائي..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {!logoUrl.trim() ? (
                        <span className="text-blue-700 font-bold">
                          الشعار الحالي: تلقائي بناءً على تصنيف ({activeCategoryName})
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          الشعار الحالي: شعار مخصص مضاف من قبل الإدارة
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Sections */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                أقسام المنيو داخل المتجر (تفصل بينها بفواصل)
              </label>
              <input 
                type="text" 
                value={sectionsInput}
                onChange={(e) => setSectionsInput(e.target.value)}
                placeholder="مثال: مقبلات، وجبات رئيسية، أطباق عائلية، حلويات، مشروبات"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
              <p className="text-[11px] text-slate-400">
                هذه الأقسام تعطي المنيو ترتيباً منظم للأصناف داخل صفحة المتجر.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                وصف المتجر / نبذة للمستهلكين
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="اكتب وصفاً أو ترحيباً بالعملاء وأبرز خدمات المتجر..."
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>جاري الحفظ في Firestore...</span>
              ) : (
                <span>حفظ بيانات المتجر</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
