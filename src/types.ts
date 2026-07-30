export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  coverUrl?: string;
  order: number;
  status: 'active' | 'inactive';
  description?: string;
  productCount?: number;
  storeCount?: number;
  createdAt?: any;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  categoryId: string;
  categoryName: string;
  logoUrl?: string;
  coverUrl?: string;
  workingHours: string;
  serviceType: 'delivery' | 'pickup' | 'both';
  deliveryFeeType: 'fixed' | 'distance';
  fixedDeliveryFee?: number;
  status: 'open' | 'closed' | 'maintenance';
  sections?: string[];
  createdAt?: any;
}

export interface ProductPriceOption {
  name: string;
  price: number;
}

export interface ProductExtraOption {
  title: string;
  required: boolean;
  items: { name: string; extraPrice: number }[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  categoryName?: string;
  storeId?: string;
  storeName?: string;
  sectionName?: string;
  imageUrl?: string;
  inStock: boolean;
  status: 'active' | 'inactive';
  sku?: string;
  prices?: ProductPriceOption[];
  options?: ProductExtraOption[];
  discountPercent?: number;
  createdAt?: any;
}

export type RoleType = 
  | 'developer'
  | 'super_admin'
  | 'vice_admin'
  | 'finance_manager'
  | 'accountant'
  | 'customer_service'
  | 'cs_restaurants'
  | 'stores_manager'
  | 'auditor'
  | 'cashier'
  | 'customer_data'
  | 'content_writer'
  | 'content_office'
  | 'custom';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: RoleType;
  storeId?: string;
  status: 'active' | 'suspended';
  avatarUrl?: string;
  permissions?: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;
  createdAt?: any;
  updatedAt?: any;
  lastLogin?: string;
}

export interface QualityReview {
  id: string;
  storeName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'published' | 'pending' | 'flagged';
  createdAt?: string;
}

export type OrderStatus = 
  | 'new'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  id?: string;
  productName: string;
  price: number;
  quantity: number;
  options?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  storeId?: string;
  storeName?: string;
  total: number;
  deliveryFee?: number;
  status: OrderStatus;
  itemsCount: number;
  items?: OrderItem[];
  deliveryType?: 'delivery' | 'pickup';
  paymentMethod?: 'cash' | 'card' | 'wallet';
  paymentStatus?: 'paid' | 'pending';
  address?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  userEmail?: string;
  userRole?: string;
  targetType: 'store' | 'product' | 'category' | 'order' | 'user' | 'system' | 'setting';
  targetName?: string;
  details?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt?: any;
}

export interface SupportChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  text: string;
  createdAt: string;
  isManagerReply?: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  requesterName: string;
  requesterEmail: string;
  targetAdminEmail: string;
  category: 'modification' | 'bug' | 'feature' | 'general';
  status: 'new' | 'in_progress' | 'completed' | 'closed';
  priority: 'normal' | 'high' | 'urgent';
  messages: SupportChatMessage[];
  createdAt?: any;
  updatedAt?: any;
}

export type TabType = 
  | 'dashboard' 
  | 'categories' 
  | 'products' 
  | 'modifiers' 
  | 'restaurants' 
  | 'offers' 
  | 'delivery' 
  | 'notifications' 
  | 'discounts' 
  | 'orders' 
  | 'reports' 
  | 'financial' 
  | 'admin' 
  | 'payment' 
  | 'quality'
  | 'audit'
  | 'settings';


