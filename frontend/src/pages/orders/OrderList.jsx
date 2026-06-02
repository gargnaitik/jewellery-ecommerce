import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { getMyOrders } from '../../services/order.service';
import './orders.css';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getMyOrders();
                setOrders(response.data.orders || response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setError('Failed to load your orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="loader-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1>My Orders</h1>
                <p>View and track your recent purchases</p>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {!loading && orders.length === 0 ? (
                <div className="empty-orders">
                    <Package size={64} />
                    <h2>No orders yet</h2>
                    <p>Looks like you haven't made any purchases yet.</p>
                    <Link to="/products" className="shop-now-btn">Start Shopping</Link>
                </div>
            ) : (
                <div className="orders-container">
                    {orders.map((order) => (
                        <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
                            <div className="order-info">
                                <span className="order-date">{formatDate(order.createdAt)}</span>
                                <span className="order-id">Order #{order.id.substring(order.id.length - 8).toUpperCase()}</span>
                                <div className="mt-2">
                                    <span className={`order-status status-${order.status?.toLowerCase() || 'pending'}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                            <div className="order-price-action">
                                <span className="order-total">{formatCurrency(order.total_amount)}</span>
                                <button className="view-btn flex items-center gap-1">
                                    View Details <ChevronRight size={16} />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList;
