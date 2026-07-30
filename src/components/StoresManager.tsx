import React, { useState } from 'react';
import { 
  Store as StoreIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Tag,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Store, Category, Product } from '../types';
import { getCategoryDefaultLogo } from '../lib/categoryUtils';

interface StoresManagerProps {
  stores: Store[];
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  onAddStore: () => void;
  onEditStore: (store: Store) => void;
  onDeleteStore: (storeId: string) => void;
  onToggleStatus: (store: Store, newStatus: 'open' | 'closed' | 'maintenance') => void;
}

export const StoresManager: React.FC<StoresManagerProps> = ({
  stores = [],
  categories = [],
  products = [],
  isLoading,
  onAddStore,
  onEditStore,
  onDeleteStore,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const safeStores = stores || [];
  const safeProducts = products || [];

  const filteredStores = safeStores.filter(s => {
    const matchesSearch = !searchTerm.trim() || 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.categoryName && s.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || s.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStoreProductsCount = (storeId: string) => {
    return safeProducts.filter(p => p.storeId === storeId || p.storeName === storeId).length;
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">إدارة المتاجر والمطاعم والصيدليات</h2>
            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold font-sans border border-blue-100">
              {stores.length} متجر
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إضافة وإدارة فروع المتاجر، المطاعم، الصيدليات، السوبرماركت، مواعيد الدوام ورسوم التوصيل
          </p>
        </div>

        <button
          onClick={onAddStore}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة متجر / فرع جديد</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المتجر، العنوان، أو التصنيف..."
            className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-gray-50/50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع التصنيفات الرئيسية</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-gray-50/50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كافة الحالات</option>
            <option value="open">مفتوح فقط</option>
            <option value="closed">مغلق فقط</option>
            <option value="maintenance">تحت الصيانة</option>
          </select>
        </div>
      </div>

      {/* Stores Grid / Cards */}
      {isLoading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-gray-200">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">جاري تحميل المتاجر والمطاعم...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="bg-white p-12 text-center max-w-md mx-auto rounded-2xl border border-gray-200 space-y-3">
          <StoreIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد متاجر مطابقة</h3>
          <p className="text-xs text-slate-400">
            لم نجد أي متجر أو مطعم يطابق معايير البحث المحددة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((store) => {
            const prodCount = getStoreProductsCount(store.id);
            const defaultCatLogo = getCategoryDefaultLogo(store.categoryId, store.categoryName, categories);
            const displayLogo = store.logoUrl?.trim() || defaultCatLogo;

            return (
              <div 
                key={store.id}
                className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col hover:border-blue-300 transition-colors group"
              >
                {/* Cover & Banner */}
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img 
                    src={store.coverUrl || defaultCatLogo} 
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultCatLogo;
                    }}
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <Tag className="w-3 h-3 text-blue-400" />
                      {store.categoryName || 'متجر'}
                    </span>
                  </div>

                  {/* Status Tag */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs ${
                      store.status === 'open' 
                        ? 'bg-green-500 text-white' 
                        : store.status === 'closed'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                    }`}>
                      {store.status === 'open' ? '🟢 مفتوح' : store.status === 'closed' ? '🔴 مغلق' : '🟡 صيانة'}
                    </span>
                  </div>

                  {/* Logo overlay */}
                  <div className="absolute -bottom-4 right-4 w-14 h-14 rounded-xl border-2 border-white bg-white shadow-md overflow-hidden shrink-0">
                    <img 
                      src={displayLogo} 
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultCatLogo;
                      }}
                    />
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 pt-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {store.description || 'متجر معتمد ومسجل في منصة جاهز للتوصيل السريع'}
                    </p>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{store.address || 'العنوان الرئيسي'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{store.workingHours || '08:00 ص - 11:30 م'}</span>
                        </div>
                        {store.phone && (
                          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="flex items-center gap-1 text-blue-700 font-medium">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          {store.serviceType === 'both' ? 'توصيل واستلام' : store.serviceType === 'delivery' ? 'توصيل فقط' : 'استلام ذاتي'}
                        </span>
                        <span className="font-bold text-slate-700 font-sans bg-gray-100 px-2 py-0.5 rounded">
                          {store.deliveryFeeType === 'fixed' 
                            ? `${(store.fixedDeliveryFee || 1000).toLocaleString()} ريال` 
                            : 'حسب المسافة'}
                        </span>
                      </div>
                    </div>

                    {/* Sections Chips */}
                    {store.sections && store.sections.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-2">
                        {store.sections.slice(0, 3).map((sec, idx) => (
                          <span key={idx} className="bg-gray-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                            {sec}
                          </span>
                        ))}
                        {store.sections.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{store.sections.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Bar & Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      {prodCount} أصناف مسجلة
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditStore(store)}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                        title="تعديل المتجر"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {deleteConfirmId === store.id ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                          <button
                            onClick={() => {
                              onDeleteStore(store.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded"
                          >
                            تأكيد
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1 text-slate-500 hover:text-slate-800 text-[11px]"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(store.id)}
                          className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                          title="حذف المتجر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
