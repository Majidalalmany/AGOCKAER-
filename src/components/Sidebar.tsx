import React from 'react';
import { 
  LayoutDashboard, 
  Tag, 
  Package, 
  Sliders, 
  Store, 
  Gift, 
  Truck, 
  Bell, 
  Percent, 
  ShoppingBag, 
  ShieldCheck, 
  BarChart3, 
  DollarSign, 
  UserCheck, 
  CreditCard, 
  Settings,
  ChevronLeft,
  X,
  Users,
  Activity,
  Sparkles
} from 'lucide-react';
import { TabType, AdminUser } from '../types';
import { hasModulePermission, ROLE_DEFINITIONS } from '../lib/permissions';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  productsCount: number;
  categoriesCount: number;
  currentUser: AdminUser | null;
  onOpenAbsherSupport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  productsCount,
  categoriesCount,
  currentUser,
  onOpenAbsherSupport
}) => {
  const allNavItems = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'offers' as TabType, label: 'العروض والإعلانات', icon: Gift },
    { id: 'restaurants' as TabType, label: 'المتاجر والمطاعم', icon: Store },
    { id: 'categories' as TabType, label: 'التصنيفات', icon: Tag, count: categoriesCount },
    { id: 'modifiers' as TabType, label: 'الخيارات والخصائص', icon: Sliders },
    { id: 'products' as TabType, label: 'المنتجات والأصناف', icon: Package, count: productsCount, highlight: true },
    { id: 'delivery' as TabType, label: 'التوصيل والأسطول', icon: Truck },
    { id: 'notifications' as TabType, label: 'التنبيهات والإشعارات', icon: Bell },
    { id: 'discounts' as TabType, label: 'التخفيضات والعمولات', icon: Percent },
    { id: 'orders' as TabType, label: 'إدارة الطلبات', icon: ShoppingBag },
    { id: 'reports' as TabType, label: 'التقارير والتحليلات', icon: BarChart3 },
    { id: 'financial' as TabType, label: 'الإدارة المالية', icon: DollarSign },
    { id: 'quality' as TabType, label: 'بيانات العملاء للجودة', icon: Users },
    { id: 'payment' as TabType, label: 'الدفع الإلكتروني', icon: CreditCard },
    { id: 'audit' as TabType, label: 'سجل العمليات والمراقبة', icon: Activity },
    { id: 'admin' as TabType, label: 'الإدارة والأدوار', icon: UserCheck },
    { id: 'settings' as TabType, label: 'إعدادات النظام', icon: Settings }
  ];

  // Filter items based on current user permissions
  const visibleItems = allNavItems.filter((item) => {
    if (!currentUser) return true; // Show all if no user
    return hasModulePermission(currentUser.permissions, currentUser.role, item.id, 'view');
  });

  const roleDef = currentUser ? (ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.custom) : null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 right-0 h-full w-64 bg-white text-slate-700 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-sm border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } lg:static lg:z-auto`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <div className="w-4 h-4 border-2 border-white rounded-xs" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 font-sans">جاهز</h1>
              <span className="text-[10px] text-blue-600 block font-medium">نظام الإدارة الموحد</span>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Profile Badge Header in Sidebar */}
        {currentUser && roleDef && (
          <div className="p-3 bg-blue-50/50 border-b border-blue-100/80 mx-2 my-2 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 border text-[10px] px-2 py-0.5 rounded-full font-bold ${roleDef.badgeColor}`}>
                <ShieldCheck className="w-3 h-3" />
                {roleDef.label}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                مفعل
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
          {visibleItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              لا توجد وحدات مسموحة لهذا الدور.
            </div>
          ) : (
            visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.count !== undefined && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-sans font-semibold ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    <ChevronLeft className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isActive ? 'rotate-90 text-blue-600' : ''}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info & Absher Support CTA */}
        <div className="p-3.5 bg-white border-t border-gray-100 space-y-2">
          {onOpenAbsherSupport && (
            <button
              onClick={onOpenAbsherSupport}
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>أبشر للتعديلات والمشاكل 💬</span>
            </button>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 text-[11px]">Firestore Connected</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">SSL v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
