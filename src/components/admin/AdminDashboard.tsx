import React, { useMemo, useState } from "react";
import {
    DollarSign,
    ShoppingBag,
    Package,
    Users,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
} from "lucide-react";
import { Product, Category } from "../../data/mockData";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AdminDashboardProps {
    products: Product[];
    categories: Category[];
    orders: any[];
    localOrders: any[];
    dashboardLoading: boolean;
    onNavigate?: (section: string) => void;
}

const COLORS = ['#f97316', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];

type TimeRange = 'today' | 'week' | 'month';

// Helper: get start of week (Sunday)
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatDateRange = (range: TimeRange): string => {
    const now = new Date();
    if (range === 'today') {
        return now.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (range === 'week') {
        const start = getStartOfWeek(now);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}`;
    }
    // month
    return now.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    products,
    categories,
    orders,
    localOrders,
    dashboardLoading,
    onNavigate,
}) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('week');

    const allOrders = localOrders.length > 0 ? localOrders : orders;

    // Filter orders based on time range
    const getFilteredOrders = (range: TimeRange, targetOrders: any[]) => {
        const now = new Date();
        return targetOrders.filter(order => {
            const dateStr = order.createdAt || order.date;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return false;
            if (range === 'today') {
                return d.toDateString() === now.toDateString();
            }
            if (range === 'week') {
                const startOfWeek = getStartOfWeek(now);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 7);
                return d >= startOfWeek && d < endOfWeek;
            }
            if (range === 'month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            return true;
        });
    };

    const getPreviousPeriodOrders = (range: TimeRange, targetOrders: any[]) => {
        const now = new Date();
        return targetOrders.filter(order => {
            const dateStr = order.createdAt || order.date;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return false;
            if (range === 'today') {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return d.toDateString() === yesterday.toDateString();
            }
            if (range === 'week') {
                const startOfLastWeek = getStartOfWeek(now);
                startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
                const endOfLastWeek = new Date(startOfLastWeek);
                endOfLastWeek.setDate(endOfLastWeek.getDate() + 7);
                return d >= startOfLastWeek && d < endOfLastWeek;
            }
            if (range === 'month') {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
            }
            return true;
        });
    };

    const calcRevenue = (ordersList: any[]) =>
        ordersList
            .filter(o => o.status !== 'cancelled')
            .reduce((acc, o) => acc + (Number(o.total) || Number(o.total_amount) || 0), 0);

    const calcGrowth = (current: number, previous: number): number | null => {
        if (previous === 0) return null;
        return Math.round(((current - previous) / previous) * 100);
    };

    const stats = useMemo(() => {
        const currentOrders = getFilteredOrders(timeRange, allOrders);
        const previousOrders = getPreviousPeriodOrders(timeRange, allOrders);

        const currentRevenue = calcRevenue(currentOrders);
        const previousRevenue = calcRevenue(previousOrders);

        const currentOrderCount = currentOrders.filter(o => o.status !== 'cancelled').length;
        const previousOrderCount = previousOrders.filter(o => o.status !== 'cancelled').length;

        const customerSet = new Set<string>();
        allOrders.forEach(order => {
            if (order.customer) customerSet.add(order.customer);
            if (order.customerName) customerSet.add(order.customerName);
            if (order.userId) customerSet.add(order.userId);
        });

        return {
            revenue: calcRevenue(allOrders.filter(o => o.status !== 'cancelled')),
            currentRevenue,
            orders: allOrders.length,
            currentOrderCount,
            products: products.length,
            customers: customerSet.size,
            revenueGrowth: calcGrowth(currentRevenue, previousRevenue),
            orderGrowth: calcGrowth(currentOrderCount, previousOrderCount),
        };
    }, [allOrders, products, timeRange]);

    const getSalesData = () => {
        const filteredOrders = getFilteredOrders(timeRange, allOrders);

        if (timeRange === 'today') {
            const hours = Array.from({ length: 8 }, (_, i) => `${i * 3}:00`);
            const salesBySlot = new Array(8).fill(0);
            filteredOrders.forEach(order => {
                if (order.status !== 'cancelled') {
                    const dateStr = order.createdAt || order.date;
                    if (dateStr) {
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) {
                            const slot = Math.floor(d.getHours() / 3);
                            salesBySlot[slot] += Number(order.total) || Number(order.total_amount) || 0;
                        }
                    }
                }
            });
            return hours.map((h, i) => ({ name: h, sales: salesBySlot[i] }));
        }

        if (timeRange === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const salesByDay = new Array(7).fill(0);
            filteredOrders.forEach(order => {
                if (order.status !== 'cancelled') {
                    const dateStr = order.createdAt || order.date;
                    if (dateStr) {
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) {
                            salesByDay[d.getDay()] += Number(order.total) || Number(order.total_amount) || 0;
                        }
                    }
                }
            });
            return days.map((day, i) => ({ name: day, sales: salesByDay[i] }));
        }

        // month — by week
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const salesByWeek = new Array(4).fill(0);
        filteredOrders.forEach(order => {
            if (order.status !== 'cancelled') {
                const dateStr = order.createdAt || order.date;
                if (dateStr) {
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                        const weekIndex = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
                        salesByWeek[weekIndex] += Number(order.total) || Number(order.total_amount) || 0;
                    }
                }
            }
        });
        return weeks.map((w, i) => ({ name: w, sales: salesByWeek[i] }));
    };

    const getCategoryData = () => {
        return categories.map(cat => {
            const catOrders = allOrders.filter(o =>
                o.status !== 'cancelled' &&
                o.items?.some((item: any) => item.category === cat.name)
            );
            const revenue = catOrders.reduce((acc: number, o: any) => acc + (Number(o.total) || Number(o.total_amount) || 0), 0);
            const productCount = products.filter(p => p.category === cat.name).length;
            return {
                name: cat.name,
                value: revenue > 0 ? revenue : productCount,
                label: revenue > 0 ? `Rs ${revenue.toLocaleString()}` : `${productCount} items`
            };
        }).filter(d => d.value > 0);
    };

    const GrowthBadge = ({ growth }: { growth: number | null }) => {
        if (growth === null) return null;
        if (growth > 0) return (
            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />{growth}%
            </span>
        );
        if (growth < 0) return (
            <span className="px-2 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />{Math.abs(growth)}%
            </span>
        );
        return (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center gap-1">
                <Minus className="w-3 h-3" />0%
            </span>
        );
    };

    // Show loading skeleton while data is being fetched
    if (dashboardLoading && localOrders.length === 0 && orders.length === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100"></div>
                                <div className="w-16 h-6 rounded-full bg-gray-100"></div>
                            </div>
                            <div className="h-4 bg-gray-100 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-gray-100 rounded w-32"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm h-[380px] animate-pulse">
                            <div className="h-6 bg-gray-100 rounded w-32 mb-6"></div>
                            <div className="h-full bg-gray-50 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: `Rs ${stats.revenue.toLocaleString()}`,
            subLabel: `Rs ${stats.currentRevenue.toLocaleString()} this ${timeRange}`,
            icon: DollarSign,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-orange-200',
            growth: stats.revenueGrowth,
            navigateTo: 'orders',
        },
        {
            label: 'Total Orders',
            value: stats.orders.toString(),
            subLabel: `${stats.currentOrderCount} this ${timeRange}`,
            icon: ShoppingBag,
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            borderColor: 'border-indigo-200',
            growth: stats.orderGrowth,
            navigateTo: 'orders',
        },
        {
            label: 'Total Products',
            value: stats.products.toString(),
            subLabel: `Across ${categories.length} categories`,
            icon: Package,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200',
            growth: null,
            navigateTo: 'products',
        },
        {
            label: 'Total Customers',
            value: stats.customers.toString(),
            subLabel: 'Unique buyers',
            icon: Users,
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
            borderColor: 'border-pink-200',
            growth: null,
            navigateTo: 'users',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Time Range Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Overview</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateRange(timeRange)}</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    {(['today', 'week', 'month'] as TimeRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                timeRange === r
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.label}
                            onClick={() => onNavigate?.(card.navigateTo)}
                            className={`p-5 rounded-2xl bg-white border ${card.borderColor} shadow-sm relative overflow-hidden group text-left cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <GrowthBadge growth={card.growth} />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{card.value}</h3>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400">{card.subLabel}</p>
                                <span className="text-xs text-gray-400 group-hover:text-orange-500 flex items-center gap-0.5 transition-colors">
                                    View <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm" style={{ minHeight: 380 }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black text-gray-900">Sales Chart</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDateRange(timeRange)}</p>
                        </div>
                    </div>
                    {stats.revenue > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={getSalesData()} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', fontSize: 13 }}
                                    cursor={{ fill: 'rgba(249,115,22,0.05)' }}
                                    formatter={(v: any) => [`Rs ${Number(v).toLocaleString()}`, 'Sales']}
                                />
                                <Bar dataKey="sales" fill="url(#salesGrad)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                                <defs>
                                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400" style={{ height: 280 }}>
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                <BarChart3 className="w-10 h-10 opacity-30" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500">No sales data yet</p>
                            <p className="text-xs mt-1 text-gray-400">Sales will appear once orders are placed</p>
                            {onNavigate && (
                                <button
                                    onClick={() => onNavigate('orders')}
                                    className="mt-4 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-colors"
                                >
                                    View Orders →
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Categories Chart */}
                <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm" style={{ minHeight: 380 }}>
                    <div className="mb-6">
                        <h3 className="text-base font-black text-gray-900">Category Breakdown</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {stats.revenue > 0 ? 'Revenue by category' : 'Products by category'}
                        </p>
                    </div>
                    {getCategoryData().length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={getCategoryData()}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {getCategoryData().map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', fontSize: 13 }}
                                    formatter={(v: any, _name: any, props: any) => [props.payload.label || v, props.payload.name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span style={{ fontSize: 12, color: '#6B7280' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400" style={{ height: 280 }}>
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                <Package className="w-10 h-10 opacity-30" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500">No categories yet</p>
                            {onNavigate && (
                                <button
                                    onClick={() => onNavigate('categories')}
                                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    Add Categories →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
