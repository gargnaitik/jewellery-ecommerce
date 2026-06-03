import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingCart, Users, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../../services/admin.service';
import './admin.css';

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, loading }) {
    return (
        <div className="admin-card flex items-center gap-4">
            <div className={`p-4 rounded-full bg-black/40 border border-white/10 ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-400">{label}</p>
                {loading
                    ? <div className="h-8 w-24 bg-white/10 rounded animate-pulse mt-1" />
                    : <h3 className="text-2xl font-semibold mt-1">{value}</h3>
                }
            </div>
        </div>
    );
}

/* ── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }) {
    const map = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        processing: 'bg-blue-500/20   text-blue-400',
        shipped: 'bg-purple-500/20  text-purple-400',
        delivered: 'bg-green-500/20   text-green-400',
        cancelled: 'bg-red-500/20     text-red-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status?.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}`}>
            {status || 'Pending'}
        </span>
    );
}

const fmt = (n) => '₹' + Math.round(n ?? 0).toLocaleString('en-IN');

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getDashboardStats();
                // handle both { stats, recentOrders } and flat response shapes
                setStats(data.stats ? data : { stats: data, recentOrders: data.recentOrders || [] });
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load dashboard stats.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const s = stats?.stats || {};
    const recentOrders = stats?.recentOrders || [];
    const lowStock = stats?.lowStockProducts || [];

    const statCards = [
        { label: 'Total Revenue', value: fmt(s.totalRevenue), icon: IndianRupee, color: 'text-green-400' },
        { label: 'Total Orders', value: s.totalOrders ?? '—', icon: ShoppingCart, color: 'text-blue-400' },
        { label: 'Total Users', value: s.totalUsers ?? '—', icon: Users, color: 'text-purple-400' },
        { label: 'Total Products', value: s.totalProducts ?? '—', icon: Package, color: 'text-orange-400' },
    ];

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="text-gray-400 mt-2">Welcome to the Kanakam admin panel.</p>
                </div>
                {!loading && (
                    <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                )}
            </div>

            {/* Error state */}
            {error && (
                <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} loading={loading} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Recent orders */}
                <div className="admin-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-[#d4af37]">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-xs text-gray-400 hover:text-[#d4af37] transition-colors">
                            View all →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm">No orders yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.slice(0, 5).map((order) => (
                                <Link
                                    key={order.id || order._id}
                                    to={`/admin/orders/${order.id || order._id}`}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-mono text-gray-300">
                                            #{(order.id || order._id || '').slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {order.user?.first_name || order.user?.name || 'Customer'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[#d4af37]">
                                            {fmt(order.total_amount)}
                                        </p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low stock alert */}
                <div className="admin-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-[#d4af37] flex items-center gap-2">
                            <TrendingUp size={18} /> Low Stock Alert
                        </h3>
                        <Link to="/admin/products" className="text-xs text-gray-400 hover:text-[#d4af37] transition-colors">
                            View all →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : lowStock.length === 0 ? (
                        <p className="text-gray-500 text-sm">All products are well stocked.</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStock.slice(0, 5).map((product) => (
                                <Link
                                    key={product.id || product._id}
                                    to={`/admin/products/${product.id || product._id}/edit`}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors"
                                >
                                    <p className="text-sm text-gray-300 truncate">{product.name}</p>
                                    <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full ml-3 shrink-0">
                                        {product.stock} left
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}