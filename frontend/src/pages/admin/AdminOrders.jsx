import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { getAllOrders } from '../../services/admin.service';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getAllOrders();
                setOrders(response.data.orders || response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setError('Failed to load orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-400">Loading orders...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-10">{error}</div>;
    }

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Orders</h1>
                    <p className="text-gray-400 mt-2">Manage all customer orders.</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-mono text-sm text-gray-300">#{order.id.substring(order.id.length - 8).toUpperCase()}</td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>{order.user?.first_name} {order.user?.last_name}</td>
                                        <td className="text-[#d4af37] font-medium">{formatCurrency(order.total_amount)}</td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                                ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                                                order.status === 'shipped' ? 'bg-purple-500/20 text-purple-500' :
                                                order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                                'bg-red-500/20 text-red-500'
                                            }`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/admin/orders/${order.id}`} className="admin-btn flex items-center gap-2 w-fit">
                                                <Eye size={16} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
