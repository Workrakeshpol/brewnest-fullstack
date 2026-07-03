import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  CalendarDays,
  Coffee,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  LogOut,
  ChevronDown,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import supabase from '../../lib/supabase';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card } from '../ui/Card';
import StatusBadge from './StatusBadge';
import { cn } from '../../lib/utils';

// Mock datasets for offline / fallback preview
const MOCK_REVENUE_TREND = [
  { date: 'Jun 26', revenue: 1420 },
  { date: 'Jun 27', revenue: 1850 },
  { date: 'Jun 28', revenue: 2100 },
  { date: 'Jun 29', revenue: 1680 },
  { date: 'Jun 30', revenue: 2200 },
  { date: 'Jul 01', revenue: 2950 },
  { date: 'Jul 02', revenue: 3100 },
];

const MOCK_CATEGORY_SALES = [
  { category: 'Coffee', orders: 120, sales: 420 },
  { category: 'Espresso', orders: 184, sales: 828 },
  { category: 'Latte', orders: 245, sales: 1225 },
  { category: 'Bakery', orders: 160, sales: 880 },
  { category: 'Tea', orders: 75, sales: 337.5 },
];

const MOCK_ORDERS = [
  {
    id: 'b78a9c1e-ea1c-4b62-bb44-8d462bc2b542',
    order_number: 'BN-K3T8P9X2',
    customer_name: 'Sophia Carter',
    customer_email: 'sophia@example.com',
    customer_phone: '(503) 555-0199',
    delivery_type: 'pickup',
    pickup_location: 'Maple Street (Flagship)',
    total: 18.50,
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    items: [
      { product_name: 'Vanilla Latte', quantity: 2, price: 5.50 },
      { product_name: 'Artisan Cappuccino', quantity: 1, price: 5.00 }
    ]
  },
  {
    id: 'f98a2c3d-ab5e-4c72-aa33-7d262bc2b123',
    order_number: 'BN-T6Y1R5E9',
    customer_name: 'Liam Vance',
    customer_email: 'liam@example.com',
    customer_phone: '(503) 555-0144',
    delivery_type: 'delivery',
    delivery_address: '422 NW Broadway, Portland, OR 97209',
    total: 24.75,
    status: 'preparing',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
    items: [
      { product_name: 'Slow Cold Brew', quantity: 3, price: 4.75 },
      { product_name: 'Croissant', quantity: 2, price: 4.50 }
    ]
  },
  {
    id: 'a12b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    order_number: 'BN-M7B2X9W1',
    customer_name: 'Emily Davis',
    customer_email: 'emily@example.com',
    customer_phone: '(503) 555-0122',
    delivery_type: 'pickup',
    pickup_location: 'Eastside Roastery',
    total: 9.00,
    status: 'ready',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 min ago
    items: [
      { product_name: 'Single-Origin Espresso', quantity: 2, price: 4.50 }
    ]
  }
];

const MOCK_INVENTORY = [
  { id: 'house-drip', name: 'House Drip Coffee', stock_quantity: 150, low_stock_threshold: 15, is_available: true, category: 'Coffee' },
  { id: 'pour-over-v60', name: 'Pour Over (V60)', stock_quantity: 80, low_stock_threshold: 10, is_available: true, category: 'Coffee' },
  { id: 'single-origin-espresso', name: 'Single-Origin Espresso', stock_quantity: 12, low_stock_threshold: 15, is_available: true, category: 'Espresso' },
  { id: 'classic-latte', name: 'Classic Latte', stock_quantity: 200, low_stock_threshold: 20, is_available: true, category: 'Latte' },
  { id: 'classic-mocha', name: 'Classic Mocha', stock_quantity: 8, low_stock_threshold: 10, is_available: true, category: 'Mocha' },
  { id: 'slow-cold-brew', name: 'Slow Cold Brew', stock_quantity: 100, low_stock_threshold: 10, is_available: true, category: 'Cold Coffee' },
];

interface ManagerDashboardProps {
  onExitDemo: () => void;
  isDemo: boolean;
}

export default function ManagerDashboard({ onExitDemo, isDemo }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'inventory'>('analytics');
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Stats summaries
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrdersCount: 0,
    lowStockCount: 0,
    averageOrderValue: 0
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders and Order Items
      const { data: dbOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      let fetchedOrders = MOCK_ORDERS;
      if (!ordersError && dbOrders) {
        fetchedOrders = dbOrders.map((o: any) => {
          const items = dbItems
            ? dbItems.filter((i: any) => i.order_id === o.id)
            : [];
          return {
            ...o,
            items: items.map((i: any) => ({
              product_name: i.product_name,
              quantity: i.quantity,
              price: parseFloat(i.price)
            })),
            total: parseFloat(o.total)
          };
        });
      }

      setOrders(fetchedOrders);

      // 2. Fetch Products joined with Inventory stock
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category,
          inventory (
            stock_quantity,
            low_stock_threshold,
            is_available
          )
        `);

      let fetchedInventory = MOCK_INVENTORY;
      if (!prodError && dbProducts) {
        fetchedInventory = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          stock_quantity: p.inventory?.stock_quantity ?? 0,
          low_stock_threshold: p.inventory?.low_stock_threshold ?? 10,
          is_available: p.inventory?.is_available ?? true
        }));
      }

      setInventory(fetchedInventory);

      // Calculate Stats
      const totalSales = fetchedOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      const activeOrdersCount = fetchedOrders
        .filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
        .length;

      const lowStockCount = fetchedInventory
        .filter(item => item.stock_quantity <= item.low_stock_threshold)
        .length;

      const averageOrderValue = fetchedOrders.length > 0
        ? totalSales / fetchedOrders.length
        : 0;

      setStats({
        totalSales,
        activeOrdersCount,
        lowStockCount,
        averageOrderValue
      });

    } catch (err) {
      console.warn('[ManagerDashboard] Loading failed, running with fallbacks:', err);
      // Run with fallbacks
      setOrders(MOCK_ORDERS);
      setInventory(MOCK_INVENTORY);
      setStats({
        totalSales: MOCK_ORDERS.reduce((s, o) => s + o.total, 0),
        activeOrdersCount: MOCK_ORDERS.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length,
        lowStockCount: MOCK_INVENTORY.filter(i => i.stock_quantity <= i.low_stock_threshold).length,
        averageOrderValue: MOCK_ORDERS.reduce((s, o) => s + o.total, 0) / MOCK_ORDERS.length
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  // Handle live status updates in Supabase
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state immediately
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      
      // Re-calculate stats count
      setStats(prev => {
        const nextOrders = orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o));
        return {
          ...prev,
          activeOrdersCount: nextOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length
        };
      });

    } catch (err: any) {
      console.error('[ManagerDashboard] Failed to update status:', err);
      alert('Could not update order status: ' + err.message);
    }
  };

  // Handle inventory stock toggling or editing
  const handleToggleProductAvailability = async (productId: string, currentAvailable: boolean) => {
    try {
      const nextAvailable = !currentAvailable;
      const { error } = await supabase
        .from('inventory')
        .update({ is_available: nextAvailable })
        .eq('product_id', productId);

      if (error) throw error;

      setInventory(prev =>
        prev.map(i => (i.id === productId ? { ...i, is_available: nextAvailable } : i))
      );
    } catch (err: any) {
      console.error('[ManagerDashboard] Failed to toggle availability:', err);
      alert('Failed to update product availability: ' + err.message);
    }
  };

  const getElapsedTime = (isoString: string) => {
    const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">Admin Console</Badge>
              {isDemo && <Badge variant="muted" size="sm" className="bg-caramel-100 text-caramel-800">Preview Mode</Badge>}
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-text sm:text-4xl">
              BrewNest Manager Console
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Live shop performance, incoming orders, and menu inventory controls.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-hover transition-colors cursor-pointer"
              title="Refresh live data"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <Button
              variant="outline"
              size="md"
              onClick={onExitDemo}
              leftIcon={<LogOut className="h-4.5 w-4.5" />}
              className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950/20 dark:hover:bg-red-950/10"
            >
              Exit Manager Mode
            </Button>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-text-muted">Sales Revenue</span>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-text">
              ${stats.totalSales.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-sage-600 dark:text-sage-400">
              ⚡ Live transaction values
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-espresso-100 text-espresso-700 dark:bg-espresso-800/40 dark:text-espresso-300">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-text-muted">Active Orders</span>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-text">
              {stats.activeOrdersCount}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Pending, preparing, or ready
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-text-muted">Low Stock</span>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-text text-red-500">
              {stats.lowStockCount}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Products below threshold
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-sage-800/30 dark:text-sage-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-text-muted">Average Ticket</span>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-text">
              ${stats.averageOrderValue.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Mean value per checkout
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mb-6 flex gap-2 border-b border-border pb-px">
          {(['analytics', 'orders', 'inventory'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative pb-4 px-4 text-sm font-medium transition-colors cursor-pointer capitalize',
                activeTab === tab
                  ? 'text-accent border-b-2 border-accent font-semibold'
                  : 'text-text-muted hover:text-text'
              )}
            >
              {tab === 'inventory' ? 'Inventory & Menu' : tab}
            </button>
          ))}
        </div>

        {/* Loading overlay */}
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-accent" />
            <p className="mt-4 text-sm text-text-muted">Syncing with Supabase Live Data...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Tab 1: Analytics Dashboard ─────────────────────── */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                
                {/* Daily Revenue AreaChart */}
                <Card className="lg:col-span-8 p-6">
                  <div className="mb-4">
                    <h3 className="font-serif text-lg font-bold text-text">Daily Revenue Trend</h3>
                    <p className="text-xs text-text-muted">Total order transactions over the past 7 days</p>
                  </div>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={MOCK_REVENUE_TREND}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C4861F" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#C4861F" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-neutral-800" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface, #fff)',
                            borderColor: 'var(--color-border, #e5e7eb)',
                            borderRadius: '12px',
                            color: 'var(--color-text, #111)',
                            fontSize: '12px'
                          }}
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#C4861F"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#revenueGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Sales by Category BarChart */}
                <Card className="lg:col-span-4 p-6">
                  <div className="mb-4">
                    <h3 className="font-serif text-lg font-bold text-text">Category Distribution</h3>
                    <p className="text-xs text-text-muted">Total sales generated by category</p>
                  </div>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={MOCK_CATEGORY_SALES}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-neutral-800" />
                        <XAxis dataKey="category" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface, #fff)',
                            borderColor: 'var(--color-border, #e5e7eb)',
                            borderRadius: '12px',
                            color: 'var(--color-text, #111)',
                            fontSize: '12px'
                          }}
                          formatter={(value) => [`$${value}`, 'Sales']}
                        />
                        <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                          {MOCK_CATEGORY_SALES.map((entry, index) => {
                            const colors = ['#7D6140', '#C4861F', '#5F7F60', '#A3A69C', '#4A3B32'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Tab 2: Live Orders Fulfillment ────────────────── */}
            {activeTab === 'orders' && (
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text font-serif">Live Incoming Orders</h3>
                    <p className="text-xs text-text-muted">Update order status levels in real time to alert users</p>
                  </div>
                  <span className="text-xs text-text-muted">Live sync active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-hover/60 border-b border-border text-xs font-semibold uppercase tracking-wider text-text-muted">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer Details</th>
                        <th className="px-6 py-4">Fulfillment Details</th>
                        <th className="px-6 py-4">Purchased Items</th>
                        <th className="px-6 py-4">Elapsed</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm text-text">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-text-muted">
                            No incoming orders today yet.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="hover:bg-surface-hover/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-serif font-bold text-accent">
                              {order.order_number || order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold">{order.customer_name}</div>
                              <div className="text-xs text-text-muted">{order.customer_email}</div>
                              <div className="text-xs text-text-muted">{order.customer_phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="capitalize font-medium text-xs rounded-full bg-espresso-50 dark:bg-espresso-950 px-2 py-0.5 border border-border">
                                {order.delivery_type}
                              </span>
                              <div className="text-xs text-text-muted mt-1 truncate max-w-[200px]">
                                {order.delivery_type === 'delivery' ? order.delivery_address : order.pickup_location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <ul className="text-xs space-y-0.5 text-text-muted max-w-[220px]">
                                {order.items?.map((it: any, idx: number) => (
                                  <li key={idx} className="truncate">
                                    <span className="font-bold text-text">×{it.quantity}</span> {it.product_name}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs flex items-center gap-1 mt-3">
                              <Clock className="h-3 w-3 text-text-muted" />
                              {getElapsedTime(order.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-serif font-bold text-text">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-text outline-none focus:border-accent cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="ready">Ready / Out</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── Tab 3: Inventory Controls ────────────────────── */}
            {activeTab === 'inventory' && (
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="font-serif text-lg font-bold text-text font-serif">Menu Inventory Status</h3>
                  <p className="text-xs text-text-muted">Manage product availability and stock alert limits</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-hover/60 border-b border-border text-xs font-semibold uppercase tracking-wider text-text-muted">
                        <th className="px-6 py-4">Item Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Stock Level</th>
                        <th className="px-6 py-4">Min. Threshold</th>
                        <th className="px-6 py-4">Warning Trigger</th>
                        <th className="px-6 py-4 text-right">Availability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm text-text">
                      {inventory.map((item) => {
                        const isLow = item.stock_quantity <= item.low_stock_threshold;
                        return (
                          <tr key={item.id} className="hover:bg-surface-hover/30 transition-colors">
                            <td className="px-6 py-4 font-semibold">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap capitalize text-xs">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-serif">
                              <span className={cn(isLow ? 'text-red-500 font-bold' : 'text-text')}>
                                {item.stock_quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-text-muted font-serif">
                              {item.low_stock_threshold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isLow ? (
                                <Badge variant="accent" size="sm" className="bg-red-50 text-red-600 dark:bg-red-950/20 border-red-200">
                                  ⚠️ Low Stock
                                </Badge>
                              ) : (
                                <Badge variant="muted" size="sm" className="bg-sage-50 text-sage-600 dark:bg-sage-950/20 border-sage-200">
                                  Healthy
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleToggleProductAvailability(item.id, item.is_available)}
                                className={cn(
                                  'h-8 px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                                  item.is_available
                                    ? 'bg-sage-100 border-sage-200 text-sage-700 dark:bg-sage-950/30 dark:text-sage-400'
                                    : 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:text-red-400'
                                )}
                              >
                                {item.is_available ? 'Available' : 'Sold Out'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
