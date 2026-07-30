import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from './lib/firebase';
import { Category, Product, Store, AdminUser, TabType, Order, OrderStatus, AuditLog, SupportTicket } from './types';
import { seedInitialFirestoreData } from './services/seedData';
import { logSystemActivity } from './lib/auditLogger';

// Core Layout Components (static for instant initial shell render)
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ViewLoadingFallback } from './components/ViewLoadingFallback';
import { CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, Lock } from 'lucide-react';
import { hasModulePermission } from './lib/permissions';
import { ORDER_STATUS_LABELS } from './constants/orderStatus';

// Dynamic Lazy Loading for Module Views and Modals
const DashboardOverview = lazy(() => import('./components/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const ProductsManager = lazy(() => import('./components/ProductsManager').then(m => ({ default: m.ProductsManager })));
const CategoriesManager = lazy(() => import('./components/CategoriesManager').then(m => ({ default: m.CategoriesManager })));
const StoresManager = lazy(() => import('./components/StoresManager').then(m => ({ default: m.StoresManager })));
const StoreModal = lazy(() => import('./components/StoreModal').then(m => ({ default: m.StoreModal })));
const AdminUsersManager = lazy(() => import('./components/AdminUsersManager').then(m => ({ default: m.AdminUsersManager })));
const UserModal = lazy(() => import('./components/UserModal').then(m => ({ default: m.UserModal })));
const SecondaryViews = lazy(() => import('./components/SecondaryViews').then(m => ({ default: m.SecondaryViews })));
const ProductModal = lazy(() => import('./components/ProductModal').then(m => ({ default: m.ProductModal })));
const CategoryModal = lazy(() => import('./components/CategoryModal').then(m => ({ default: m.CategoryModal })));
const ProductViewModal = lazy(() => import('./components/ProductViewModal').then(m => ({ default: m.ProductViewModal })));
const OrdersManager = lazy(() => import('./components/OrdersManager').then(m => ({ default: m.OrdersManager })));
const AuditLogsManager = lazy(() => import('./components/AuditLogsManager').then(m => ({ default: m.AuditLogsManager })));
const AbsherSupportModal = lazy(() => import('./components/AbsherSupportModal').then(m => ({ default: m.AbsherSupportModal })));

export default function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('jahez_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('الفرع الرئيسي - صنعاء');

  // Firestore Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Absher Support Modal
  const [isAbsherSupportOpen, setIsAbsherSupportOpen] = useState<boolean>(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Toast notifications with auto cleanup to prevent memory leaks
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 1. Categories Firestore Realtime Listener
  useEffect(() => {
    setIsLoadingCategories(true);
    const categoriesQuery = query(collection(db, 'categories'));
    
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const catList: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

      catList.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(catList);
      setIsLoadingCategories(false);
    }, (error) => {
      console.error('Categories listener error:', error);
      setIsLoadingCategories(false);
    });

    return () => unsubscribeCategories();
  }, []);

  // 2. Stores Firestore Realtime Listener
  useEffect(() => {
    setIsLoadingStores(true);
    const storesQuery = query(collection(db, 'stores'));

    const unsubscribeStores = onSnapshot(storesQuery, (snapshot) => {
      const storeList: Store[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[];

      setStores(storeList);
      setIsLoadingStores(false);
    }, (error) => {
      console.error('Stores listener error:', error);
      setIsLoadingStores(false);
    });

    return () => unsubscribeStores();
  }, []);

  // 3. Products Firestore Realtime Listener
  useEffect(() => {
    setIsLoadingProducts(true);
    const productsQuery = query(collection(db, 'products'));

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const prodList: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      setProducts(prodList);
      setIsLoadingProducts(false);
    }, (error) => {
      console.error('Products listener error:', error);
      setIsLoadingProducts(false);
    });

    return () => unsubscribeProducts();
  }, []);

  // 4. Admin Users Firestore Realtime Listener
  useEffect(() => {
    setIsLoadingUsers(true);
    const usersQuery = query(collection(db, 'adminUsers'));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const uList: AdminUser[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[];

      setAdminUsers(uList);
      setIsLoadingUsers(false);
    }, (error) => {
      console.error('Admin Users listener error:', error);
      setIsLoadingUsers(false);
    });

    return () => unsubscribeUsers();
  }, []);

  // 5. Orders Firestore Realtime Listener
  useEffect(() => {
    setIsLoadingOrders(true);
    const ordersQuery = query(collection(db, 'orders'));

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const oList: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      setOrders(oList);
      setIsLoadingOrders(false);
    }, (error) => {
      console.error('Orders listener error:', error);
      setIsLoadingOrders(false);
    });

    return () => unsubscribeOrders();
  }, []);

  // 6. Audit Logs Firestore Realtime Listener
  useEffect(() => {
    setIsLoadingAudit(true);
    const auditQuery = query(collection(db, 'audit_logs'));

    const unsubscribeAudit = onSnapshot(auditQuery, (snapshot) => {
      const aList: AuditLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];

      setAuditLogs(aList);
      setIsLoadingAudit(false);
    }, (error) => {
      console.error('Audit logs listener error:', error);
      setIsLoadingAudit(false);
    });

    return () => unsubscribeAudit();
  }, []);

  // 7. Support Tickets Firestore Realtime Listener
  useEffect(() => {
    const ticketsQuery = query(collection(db, 'support_tickets'));

    const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
      const tList: SupportTicket[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportTicket[];

      setSupportTickets(tList);
    }, (error) => {
      console.error('Support tickets listener error:', error);
    });

    return () => unsubscribeTickets();
  }, []);

  // Support Ticket Handlers (Absher)
  const handleCreateSupportTicket = async (ticketData: {
    title: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    initialMessage: string;
  }) => {
    try {
      const ticketNum = 'MOD-' + Math.floor(100 + Math.random() * 900);
      const requesterName = currentUser ? currentUser.name : 'مستخدم النظام';
      const requesterEmail = currentUser ? currentUser.email : 'user@jahez.com';

      const newTicketDoc = {
        ticketNumber: ticketNum,
        title: ticketData.title,
        requesterName,
        requesterEmail,
        targetAdminEmail: 'majdallmany3@gmail.com',
        category: ticketData.category,
        status: 'new',
        priority: ticketData.priority,
        messages: [
          {
            id: 'msg-' + Date.now(),
            senderName: requesterName,
            senderEmail: requesterEmail,
            text: ticketData.initialMessage,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'support_tickets'), newTicketDoc);

      // Audit Log for creating ticket
      await logSystemActivity({
        action: 'فتح طلب تعديل/مشكلة (أبشر)',
        performedBy: requesterName,
        userEmail: requesterEmail,
        targetType: 'system',
        targetName: ticketNum,
        details: `طلب تعديل جديد بعنوان: "${ticketData.title}" إلى المدير العام majdallmany3@gmail.com`,
        severity: ticketData.priority === 'urgent' ? 'warning' : 'info'
      });

      showToast(`أبشر! تم إرسال طلب التعديل #${ticketNum} مباشرة إلى المدير العام`);
    } catch (err: any) {
      console.error('Error creating support ticket:', err);
      showToast('فشل إرسال طلب التعديل: ' + (err.message || ''), 'error');
      throw err;
    }
  };

  const handleSendSupportMessage = async (ticketId: string, text: string) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      const ticket = supportTickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const senderName = currentUser ? currentUser.name : 'مستخدم النظام';
      const senderEmail = currentUser ? currentUser.email : 'user@jahez.com';
      const isManager = senderEmail === 'majdallmany3@gmail.com' || currentUser?.role === 'super_admin';

      const updatedMessages = [
        ...(ticket.messages || []),
        {
          id: 'msg-' + Date.now(),
          senderName,
          senderEmail,
          text,
          createdAt: new Date().toISOString(),
          isManagerReply: isManager
        }
      ];

      await updateDoc(ticketRef, {
        messages: updatedMessages,
        status: isManager ? 'in_progress' : ticket.status,
        updatedAt: new Date().toISOString()
      });

      showToast('تم إرسال الرد في المحادثة بنجاح');
    } catch (err: any) {
      console.error('Error sending support message:', err);
      showToast('فشل إرسال الرسالة: ' + (err.message || ''), 'error');
      throw err;
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      showToast('تم تحديث حالة طلب التعديل (أبشر) بنجاح');
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      showToast('فشل تعديل حالة المحادثة', 'error');
    }
  };

  // Auto-seed if Firestore database is empty on first load
  useEffect(() => {
    if (!isLoadingCategories && !isLoadingProducts && !isLoadingStores && !isLoadingOrders &&
        categories.length === 0 && products.length === 0 && stores.length === 0 && orders.length === 0) {
      handleSeedData();
    }
  }, [isLoadingCategories, isLoadingProducts, isLoadingStores, isLoadingOrders]);

  // Orders CRUD Handlers
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus;
      showToast(`تم تغيير حالة الطلب بنجاح إلى (${statusLabel})`);

      // Audit Log
      await logSystemActivity({
        action: 'تعديل حالة طلب',
        performedBy: currentUser ? currentUser.name : 'النظام',
        userEmail: currentUser?.email,
        userRole: currentUser?.role,
        targetType: 'order',
        targetName: orderId,
        details: `تحديث حالة الطلب إلى: (${statusLabel})`,
        severity: 'info'
      });
    } catch (err: any) {
      console.error('Error updating order status:', err);
      showToast('فشل تعديل حالة الطلب في Firestore: ' + (err.message || ''), 'error');
      await logSystemActivity({
        action: 'خطأ في تعديل حالة الطلب',
        performedBy: currentUser ? currentUser.name : 'النظام',
        userEmail: currentUser?.email,
        targetType: 'order',
        targetName: orderId,
        details: `تفاصيل الخطأ: ${err.message}`,
        severity: 'error'
      });
      throw err;
    }
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: new Date().toISOString()
      });
      showToast(`تمت إضافة الطلب #${orderData.orderNumber || ''} بنجاح في Firestore`);

      await logSystemActivity({
        action: 'إنشاء طلب جديد',
        performedBy: currentUser ? currentUser.name : 'العميل',
        userEmail: currentUser?.email,
        targetType: 'order',
        targetName: orderData.orderNumber || 'طلب جديد',
        details: `إضافة طلب بقيمة ${orderData.total} ريال لـ ${orderData.customerName}`,
        severity: 'info'
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      showToast('فشل إضافة الطلب في Firestore: ' + (err.message || ''), 'error');
      throw err;
    }
  };

  // Seed Data Handler
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const success = await seedInitialFirestoreData();
      if (success) {
        showToast('تم تهيئة بيانات المتاجر والمنتجات والتصنيفات في Firestore بنجاح');
        await logSystemActivity({
          action: 'إعادة تهيئة البيانات السحابية (Seed Data)',
          performedBy: currentUser ? currentUser.name : 'المدير العام',
          userEmail: currentUser?.email,
          targetType: 'system',
          details: 'تم إجراء مزامنة وتهيئة أولية لقواعد بيانات المتاجر والطلبات بنجاح',
          severity: 'info'
        });
      } else {
        showToast('حدث خطأ أثناء تهيئة البيانات', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في الإتصال بـ Firestore', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // --- STORE CRUD HANDLERS ---
  const handleSaveStore = async (storeData: Partial<Store>) => {
    try {
      if (editingStore) {
        const storeRef = doc(db, 'stores', editingStore.id);
        await updateDoc(storeRef, {
          ...storeData,
          updatedAt: new Date().toISOString()
        });
        showToast(`تم تحديث بيانات المتجر/المطعم "${storeData.name}" بنجاح في Firestore`);
        await logSystemActivity({
          action: 'تعديل بيانات متجر',
          performedBy: currentUser ? currentUser.name : 'إدارة المتاجر',
          userEmail: currentUser?.email,
          targetType: 'store',
          targetName: storeData.name,
          details: `تعديل معلومات المتجر والتصنيف ${storeData.categoryName}`,
          severity: 'info'
        });
      } else {
        await addDoc(collection(db, 'stores'), {
          ...storeData,
          createdAt: new Date().toISOString()
        });
        showToast(`تمت إضافة المتجر/المطعم "${storeData.name}" بنجاح في Firestore`);
        await logSystemActivity({
          action: 'إضافة متجر جديد',
          performedBy: currentUser ? currentUser.name : 'إدارة المتاجر',
          userEmail: currentUser?.email,
          targetType: 'store',
          targetName: storeData.name,
          details: `إضافة متجر جديد بتصنيف ${storeData.categoryName}`,
          severity: 'info'
        });
      }
    } catch (err: any) {
      console.error('Error saving store:', err);
      showToast('فشل حفظ بيانات المتجر في Firebase: ' + (err.message || ''), 'error');
      throw err;
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      const st = stores.find(s => s.id === storeId);
      await deleteDoc(doc(db, 'stores', storeId));
      showToast('تم حذف المتجر بنجاح من Firestore');
      await logSystemActivity({
        action: 'حذف متجر',
        performedBy: currentUser ? currentUser.name : 'المدير العام',
        userEmail: currentUser?.email,
        targetType: 'store',
        targetName: st?.name || storeId,
        details: `حذف المتجر ${st?.name} نهائياً من قاعدة البيانات`,
        severity: 'warning'
      });
    } catch (err: any) {
      console.error('Error deleting store:', err);
      showToast('فشل حذف المتجر: ' + (err.message || ''), 'error');
    }
  };

  const handleToggleStoreStatus = async (store: Store) => {
    try {
      const storeRef = doc(db, 'stores', store.id);
      const newStatus = store.status === 'open' ? 'closed' : 'open';
      await updateDoc(storeRef, { status: newStatus });
      showToast(`تم تغيير حالة متجر "${store.name}" إلى (${newStatus === 'open' ? 'مفتوح' : 'مغلق'})`);
      await logSystemActivity({
        action: 'تغيير حالة متجر',
        performedBy: currentUser ? currentUser.name : 'النظام',
        userEmail: currentUser?.email,
        targetType: 'store',
        targetName: store.name,
        details: `تغيير الحالة إلى ${newStatus === 'open' ? 'مفتوح' : 'مغلق'}`,
        severity: 'info'
      });
    } catch (err: any) {
      console.error('Error toggling store status:', err);
      showToast('فشل تعديل حالة المتجر', 'error');
    }
  };

  // --- USER & RBAC HANDLERS ---
  const handleSaveUser = async (userData: Partial<AdminUser>) => {
    try {
      if (editingUser) {
        const uRef = doc(db, 'adminUsers', editingUser.id);
        await updateDoc(uRef, {
          ...userData,
          updatedAt: new Date().toISOString()
        });
        showToast(`تم تحديث صلاحيات وعضوية "${userData.name}" بنجاح`);
        await logSystemActivity({
          action: 'تعديل بيانات حساب إداري',
          performedBy: currentUser ? currentUser.name : 'المدير العام',
          userEmail: currentUser?.email,
          targetType: 'user',
          targetName: userData.name,
          details: `تعديل صلاحيات وتفاصيل الحساب للدور ${userData.role}`,
          severity: 'info'
        });
      } else {
        await addDoc(collection(db, 'adminUsers'), {
          ...userData,
          createdAt: new Date().toISOString()
        });
        showToast(`تمت إضافة الموظف "${userData.name}" وتعيين صلاحياته بنجاح`);
        await logSystemActivity({
          action: 'إضافة حساب إداري جديد',
          performedBy: currentUser ? currentUser.name : 'المدير العام',
          userEmail: currentUser?.email,
          targetType: 'user',
          targetName: userData.name,
          details: `إنشاء حساب جديد بالبريد ${userData.email} والدور ${userData.role}`,
          severity: 'info'
        });
      }
    } catch (err: any) {
      console.error('Error saving user:', err);
      showToast('فشل حفظ بيانات المستخدم في Firebase', 'error');
      throw err;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const u = adminUsers.find(usr => usr.id === userId);
      await deleteDoc(doc(db, 'adminUsers', userId));
      showToast('تم حذف الموظف وإلغاء صلاحياته من Firestore');
      await logSystemActivity({
        action: 'حذف حساب إداري',
        performedBy: currentUser ? currentUser.name : 'المدير العام',
        userEmail: currentUser?.email,
        targetType: 'user',
        targetName: u?.name || userId,
        details: `إلغاء وتجميد الحساب الإداري ${u?.email}`,
        severity: 'warning'
      });
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showToast('فشل حذف المستخدم', 'error');
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const uRef = doc(db, 'adminUsers', user.id);
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await updateDoc(uRef, { status: newStatus });
      showToast(`تم تغيير حالة حساب الموظف "${user.name}" إلى (${newStatus === 'active' ? 'نشط' : 'معطل'})`);
      await logSystemActivity({
        action: 'تعديل حالة تفعيل حساب',
        performedBy: currentUser ? currentUser.name : 'المدير العام',
        userEmail: currentUser?.email,
        targetType: 'user',
        targetName: user.name,
        details: `تعديل الحالة إلى ${newStatus === 'active' ? 'نشط' : 'معطل'}`,
        severity: 'info'
      });
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      showToast('فشل تعديل حالة حساب الموظف', 'error');
    }
  };

  // --- PRODUCT CRUD HANDLERS ---
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, {
          ...productData,
          updatedAt: new Date().toISOString()
        });
        showToast(`تم تحديث بيانات المنتج "${productData.name}" بنجاح في Firestore`);
        await logSystemActivity({
          action: 'تعديل بيانات صنف/منتج',
          performedBy: currentUser ? currentUser.name : 'مدير المنتجات',
          userEmail: currentUser?.email,
          targetType: 'product',
          targetName: productData.name,
          details: `تحديث السعر إلى ${productData.price} ريال وتعديل التفاصيل`,
          severity: 'info'
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        showToast(`تمت إضافة المنتج "${productData.name}" بنجاح في Firestore`);
        await logSystemActivity({
          action: 'إضافة صنف/منتج جديد',
          performedBy: currentUser ? currentUser.name : 'مدير المنتجات',
          userEmail: currentUser?.email,
          targetType: 'product',
          targetName: productData.name,
          details: `إضافة المنتج بالسعر ${productData.price} ريال للمتجر ${productData.storeName}`,
          severity: 'info'
        });
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast('فشل حفظ المنتج في Firebase: ' + (err.message || ''), 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const p = products.find(prd => prd.id === productId);
      await deleteDoc(doc(db, 'products', productId));
      showToast('تم حذف المنتج بنجاح من Firestore');
      await logSystemActivity({
        action: 'حذف صنف/منتج',
        performedBy: currentUser ? currentUser.name : 'مدير المنتجات',
        userEmail: currentUser?.email,
        targetType: 'product',
        targetName: p?.name || productId,
        details: `حذف المنتج ${p?.name} من قاعدة البيانات`,
        severity: 'warning'
      });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      showToast('فشل حذف المنتج: ' + (err.message || ''), 'error');
    }
  };

  const handleToggleProductInStock = async (product: Product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        inStock: !product.inStock
      });
      showToast(`تم تغيير حالة التوفر للمنتج "${product.name}" إلى (${!product.inStock ? 'متوفر' : 'غير متوفر'})`);
    } catch (err: any) {
      console.error('Error toggling product stock:', err);
      showToast('فشل تحديث حالة التوفر في Firestore', 'error');
    }
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        const catRef = doc(db, 'categories', editingCategory.id);
        await updateDoc(catRef, {
          ...categoryData,
          updatedAt: new Date().toISOString()
        });
        showToast(`تم تحديث التصنيف "${categoryData.name}" بنجاح`);
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: new Date().toISOString()
        });
        showToast(`تمت إضافة التصنيف "${categoryData.name}" بنجاح في Firestore`);
      }
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast('فشل حفظ التصنيف في Firebase', 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      showToast('تم حذف التصنيف بنجاح من Firestore');
    } catch (err: any) {
      console.error('Error deleting category:', err);
      showToast('فشل حذف التصنيف: ' + (err.message || ''), 'error');
    }
  };

  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      const catRef = doc(db, 'categories', category.id);
      const newStatus = category.status === 'active' ? 'inactive' : 'active';
      await updateDoc(catRef, { status: newStatus });
      showToast(`تم تعديل حالة التصنيف "${category.name}"`);
    } catch (err: any) {
      console.error('Error toggling category status:', err);
      showToast('فشل تعديل حالة التصنيف', 'error');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('jahez_auth_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    showToast('تم تسجيل الخروج بنجاح');
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('jahez_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    showToast(`مرحباً بك مجدداً، ${user.name}! تم تسجيل الدخول بصلاحية (${user.role})`);
  };

  // If user is not authenticated, show Login Screen
  if (!currentUser) {
    return <LoginScreen users={adminUsers} onLoginSuccess={handleLoginSuccess} />;
  }

  // Dynamic tab header title
  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'dashboard': return 'الرئيسية والإحصائيات الحية';
      case 'restaurants': return 'إدارة المتاجر والمطاعم والصيدليات';
      case 'categories': return 'إدارة التصنيفات الرئيسية';
      case 'products': return 'إدارة المنتجات الأصناف والأسعار';
      case 'admin': return 'إدارة المستخدمين ونظام الصلاحيات (RBAC)';
      case 'orders': return 'إدارة وتتبع الطلبات المباشرة';
      case 'audit': return 'سجل العمليات ومراقبة النظام (Audit Logs)';
      case 'modifiers': return 'الخيارات والإضافات (Modifiers)';
      case 'offers': return 'العروض والتخفيضات الترويجية';
      case 'reports': return 'التقارير المالية والأداء';
      case 'financial': return 'الإدارة المالية والعمولات';
      case 'quality': return 'تقييمات الجودة والملاحظات';
      case 'settings': return 'إعدادات النظام العامة';
      default: return 'لوحة تحكم جاهز';
    }
  };

  const canAccessCurrentTab = hasModulePermission(currentUser, activeTab, 'view');

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans flex flex-col dir-rtl" dir="rtl">
      
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold text-white ${
            toastMessage.type === 'success' ? 'bg-slate-900 border-emerald-500' : 'bg-rose-900 border-rose-500'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          productsCount={products.length}
          categoriesCount={categories.length}
          currentUser={currentUser}
          onOpenAbsherSupport={() => setIsAbsherSupportOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Header Bar */}
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onSeedData={handleSeedData}
            isSeeding={isSeeding}
            activeTabLabel={getTabLabel(activeTab)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenAbsherSupport={() => setIsAbsherSupportOpen(true)}
          />

          {/* Main Workspace Body */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
            
            {!canAccessCurrentTab ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-rose-200 text-center space-y-4 my-8">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">غير مصرح بالوصول لهذه الوحدة</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    عذراً، رتبتك الحالية ({currentUser.role}) أو حسابك الموظف لا يملك صلاحية عرض وحدة ({getTabLabel(activeTab)}). يرجى التواصل مع المدير العام (Super Admin) لترقية الصلاحيات.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  العودة للوحة الإحصائيات الرئيسية
                </button>
              </div>
            ) : (
              <ErrorBoundary fallbackTitle={`حدث خطأ في عرض وحدة (${getTabLabel(activeTab)})`}>
                <Suspense fallback={<ViewLoadingFallback />}>
                  {/* 1. Dashboard View */}
                  {activeTab === 'dashboard' && (
                    <DashboardOverview 
                      products={products}
                      categories={categories}
                      orders={orders}
                      onNavigateToProducts={() => setActiveTab('products')}
                      onNavigateToCategories={() => setActiveTab('categories')}
                      onSeedData={handleSeedData}
                    />
                  )}

                  {/* 2. Stores & Restaurants View */}
                  {activeTab === 'restaurants' && (
                    <StoresManager 
                      stores={stores}
                      categories={categories}
                      products={products}
                      isLoading={isLoadingStores}
                      onAddStore={() => {
                        setEditingStore(null);
                        setIsStoreModalOpen(true);
                      }}
                      onEditStore={(st) => {
                        setEditingStore(st);
                        setIsStoreModalOpen(true);
                      }}
                      onDeleteStore={handleDeleteStore}
                      onToggleStatus={handleToggleStoreStatus}
                    />
                  )}

                  {/* 3. Products View */}
                  {activeTab === 'products' && (
                    <ProductsManager 
                      products={products}
                      categories={categories}
                      isLoading={isLoadingProducts}
                      onAddProduct={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      }}
                      onEditProduct={(p) => {
                        setEditingProduct(p);
                        setIsProductModalOpen(true);
                      }}
                      onViewProduct={(p) => {
                        setViewingProduct(p);
                      }}
                      onDeleteProduct={handleDeleteProduct}
                      onToggleInStock={handleToggleProductInStock}
                      onSeedData={handleSeedData}
                    />
                  )}

                  {/* 4. Categories View */}
                  {activeTab === 'categories' && (
                    <CategoriesManager 
                      categories={categories}
                      products={products}
                      isLoading={isLoadingCategories}
                      onAddCategory={() => {
                        setEditingCategory(null);
                        setIsCategoryModalOpen(true);
                      }}
                      onEditCategory={(c) => {
                        setEditingCategory(c);
                        setIsCategoryModalOpen(true);
                      }}
                      onDeleteCategory={handleDeleteCategory}
                      onToggleStatus={handleToggleCategoryStatus}
                      onSeedData={handleSeedData}
                    />
                  )}

                  {/* 5. Users & RBAC Permissions View */}
                  {activeTab === 'admin' && (
                    <AdminUsersManager 
                      users={adminUsers}
                      stores={stores}
                      isLoading={isLoadingUsers}
                      onAddUser={() => {
                        setEditingUser(null);
                        setIsUserModalOpen(true);
                      }}
                      onEditUser={(u) => {
                        setEditingUser(u);
                        setIsUserModalOpen(true);
                      }}
                      onDeleteUser={handleDeleteUser}
                      onToggleUserStatus={handleToggleUserStatus}
                      currentUser={currentUser}
                    />
                  )}

                  {/* 6. Orders Management View */}
                  {activeTab === 'orders' && (
                    <OrdersManager 
                      orders={orders}
                      stores={stores}
                      currentUser={currentUser}
                      isLoading={isLoadingOrders}
                      onUpdateOrderStatus={handleUpdateOrderStatus}
                      onCreateOrder={handleCreateOrder}
                      onSeedOrders={handleSeedData}
                    />
                  )}

                  {/* 7. System Audit Logs & Monitoring View */}
                  {activeTab === 'audit' && (
                    <AuditLogsManager 
                      logs={auditLogs}
                      isLoading={isLoadingAudit}
                      currentUser={currentUser}
                      onOpenAbsherSupport={() => setIsAbsherSupportOpen(true)}
                    />
                  )}

                  {/* 8. Secondary / Specialized Views */}
                  {activeTab !== 'dashboard' && 
                   activeTab !== 'restaurants' && 
                   activeTab !== 'products' && 
                   activeTab !== 'categories' && 
                   activeTab !== 'admin' && 
                   activeTab !== 'orders' && 
                   activeTab !== 'audit' && (
                    <SecondaryViews tab={activeTab} selectedBranch={selectedBranch} />
                  )}
                </Suspense>
              </ErrorBoundary>
            )}

          </main>
        </div>
      </div>

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        <StoreModal 
          isOpen={isStoreModalOpen}
          onClose={() => {
            setIsStoreModalOpen(false);
            setEditingStore(null);
          }}
          onSave={handleSaveStore}
          store={editingStore}
          categories={categories}
        />

        <ProductModal 
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          categories={categories}
          stores={stores}
        />

        <CategoryModal 
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
          category={editingCategory}
        />

        <UserModal 
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          user={editingUser}
          stores={stores}
        />

        <ProductViewModal 
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />

        <AbsherSupportModal 
          isOpen={isAbsherSupportOpen}
          onClose={() => setIsAbsherSupportOpen(false)}
          tickets={supportTickets}
          currentUser={currentUser}
          onCreateTicket={handleCreateSupportTicket}
          onSendMessage={handleSendSupportMessage}
          onUpdateTicketStatus={handleUpdateTicketStatus}
        />
      </Suspense>
    </div>
  );
}
