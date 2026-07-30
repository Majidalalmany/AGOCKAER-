import React, { useState } from 'react';
import { 
  Package, 
  Tag, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight,
  Database,
  Layers,
  Sparkles,
  Wand2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Product, Category, Order } from '../types';
import Markdown from 'react-markdown';

interface DashboardOverviewProps {
  products: Product[];
  categories: Category[];
  orders?: Order[];
  onNavigateToProducts: () => void;
  onNavigateToCategories: () => void;
  onSeedData: () => void;
}

const COLORS = ['#0284C7', '#16A34A', '#F59E0B', '#EC4899', '#8B5CF6', '#64748B'];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products = [],
  categories = [],
  orders = [],
  onNavigateToProducts,
  onNavigateToCategories,
  onSeedData
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Sanitize arrays to prevent sending huge base64 image strings or unnecessary metadata
      const cleanProducts = (products || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        inStock: p.inStock,
        categoryName: p.categoryName
      }));

      const cleanCategories = (categories || []).map(c => ({
        id: c.id,
        name: c.name
      }));

      const cleanOrders = (orders || []).map(o => ({
        id: o.id,
        total: o.total,
        status: o.status
      }));

      const response = await fetch('/api/gemini/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          products: cleanProducts,
          categories: cleanCategories,
          orders: cleanOrders
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل في الاتصال بالخادم لتوليد التقرير');
      }

      const data = await response.json();
      setAiReport(data.report);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'فشل في توليد التقرير الذكي.');
    } finally {
      setIsGenerating(false);
    }
  };

  const safeProducts = products || [];
  const safeCategories = categories || [];

  const inStockCount = safeProducts.filter(p => p.inStock).length;
  const outOfStockCount = safeProducts.filter(p => !p.inStock).length;

  // Chart data: Products per category
  const categoryChartData = safeCategories.map(cat => {
    const count = safeProducts.filter(p => p.categoryId === cat.id || p.categoryName === cat.name).length;
    return {
      name: cat.name,
      count
    };
  });

  // Pie chart data: In stock vs Out of stock
  const stockPieData = [
    { name: 'متوفر', value: inStockCount, color: '#16A34A' },
    { name: 'غير متوفر', value: outOfStockCount, color: '#DC2626' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>نظام إدارة قائمة منتجات ومتجر جاهز</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
            مرحباً بك في لوحة تحكم التطبيق
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            يمكنك متابعة وتحديث قائمة المنتجات، التصنيفات وحالة التوفر بالمخزون لحظياً مع المزامنة المباشرة لقاعدة بيانات Firebase Firestore.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToProducts}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>إدارة المنتجات ({products.length})</span>
            </button>
            <button
              onClick={onNavigateToCategories}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-slate-700 text-xs font-semibold rounded-lg border border-gray-200 transition-all flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-slate-500" />
              <span>إدارة التصنيفات ({categories.length})</span>
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              <span>توليد تقرير ذكي (Gemini)</span>
            </button>
          </div>
        </div>
      </div>

      {aiReport && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-purple-100 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-800">تقرير الذكاء الاصطناعي</h3>
          </div>
          <div className="prose prose-sm prose-slate max-w-none text-slate-700 rtl">
            <Markdown>{aiReport}</Markdown>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-700 text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Products */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">إجمالي المنتجات</span>
            <div className="text-2xl font-bold text-slate-800 font-sans mt-1">
              {products.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>قاعدة بيانات نشطة</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Total Categories */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">إجمالي التصنيفات</span>
            <div className="text-2xl font-bold text-slate-800 font-sans mt-1">
              {categories.length}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              تصنيفات الطعام الرئيسية
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: In Stock */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">متوفر بالمخزون</span>
            <div className="text-2xl font-bold text-emerald-600 font-sans mt-1">
              {inStockCount}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              جاهزة للطلب الفوري
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Out of Stock */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">غير متوفر / نفاذ</span>
            <div className="text-2xl font-bold text-red-600 font-sans mt-1">
              {outOfStockCount}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              يحتاج لتحديث الحالة
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Products per Category */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">توزيع المنتجات حسب التصنيف</h3>
            <span className="text-xs text-slate-400 font-medium">إحصائيات مباشرة</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#38BDF8' }}
                />
                <Bar dataKey="count" name="عدد المنتجات" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Stock Availability Breakdown */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-4">
          <h3 className="text-base font-bold text-slate-800">نسبة توفر المنتجات</h3>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-slate-600">منتجات متوفرة</span>
              </span>
              <span className="font-bold text-slate-800">{inStockCount} ({products.length ? Math.round((inStockCount / products.length) * 100) : 0}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-slate-600">منتجات غير متوفرة</span>
              </span>
              <span className="font-bold text-slate-800">{outOfStockCount} ({products.length ? Math.round((outOfStockCount / products.length) * 100) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Preview Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">أحدث المنتجات المضافة في Firestore</h3>
          <button 
            onClick={onNavigateToProducts}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            عرض كافة المنتجات ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map((item) => (
            <div 
              key={item.id}
              className="p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors flex items-center gap-3 bg-gray-50/50"
            >
              <img 
                src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-slate-800 truncate">{item.name}</div>
                <div className="text-[11px] text-blue-600 font-medium mt-0.5">{item.categoryName}</div>
                <div className="text-xs font-bold text-slate-800 font-sans mt-0.5">
                  {item.price.toLocaleString()} ريال
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
