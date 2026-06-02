import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { getOrderById } from '../../services/order.service';
import './orders.css'; // Reusing the same CSS file

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(id);
                setOrder(response.data.order || response.data.data || response.data);
            } catch (err) {
                console.error("Failed to fetch order details", err);
                setError('Failed to load order details. It might not exist.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

    if (error || !order) {
        return (
            <div className="orders-page">
                <div className="empty-orders">
                    <h2>Order Not Found</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/orders')} className="shop-now-btn">Back to Orders</button>
                </div>
            </div>
        );
    }

    const { items = [], shipping_address = {} } = order;

    return (
        <div className="orders-page">
            <div className="mb-6">
                <Link to="/orders" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
                    <ArrowLeft size={20} /> Back to My Orders
                </Link>
            </div>
            
            <div className="orders-header flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1>Order Details</h1>
                    <p>Order #{order.id.substring(order.id.length - 8).toUpperCase()} • Placed on {formatDate(order.createdAt)}</p>
                </div>
                <span className={`order-status status-${order.status?.toLowerCase() || 'pending'} text-sm px-4 py-1.5`}>
                    {order.status || 'Pending'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items List */}
                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Package size={20} className="text-[#d4af37]" /> Items Ordered</h2>
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-6 border-b border-white/10 last:border-0 last:pb-0">
                                    <div className="w-24 h-24 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                                        <img 
                                            src={item.product_snapshot?.images?.[0]?.url || item.product_snapshot?.images?.[0] || 'https://via.placeholder.com/150'} 
                                            alt={item.product_snapshot?.name || 'Product'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium">{item.product_snapshot?.name || 'Jewellery Item'}</h3>
                                            <p className="text-sm text-gray-400 mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-[#d4af37] font-semibold text-lg">
                                            {formatCurrency(item.item_total)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><CreditCard size={20} className="text-[#d4af37]" /> Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>GST (3%)</span>
                                <span>{formatCurrency(order.gst_amount)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-400">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="pt-3 mt-3 border-t border-white/10 flex justify-between font-semibold text-lg text-[#d4af37]">
                                <span>Total</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MapPin size={20} className="text-[#d4af37]" /> Shipping Address</h2>
                        <div className="text-sm text-gray-300 space-y-1">
                            <p className="font-medium text-white">{shipping_address.name}</p>
                            <p>{shipping_address.street}</p>
                            <p>{shipping_address.city}, {shipping_address.state} {shipping_address.postal_code}</p>
                            <p>{shipping_address.country}</p>
                            <p className="pt-2 text-gray-400">Phone: {shipping_address.phone}</p>
                        </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="bg-[#19191999] border border-white/5 rounded-xl p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Clock size={20} className="text-[#d4af37]" /> Status Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Order Placed</p>
                                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 ${['processing', 'shipped', 'delivered'].includes(order.status) ? '' : 'opacity-40'}`}>
                                <CheckCircle size={20} className={['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-green-500' : 'text-gray-500'} />
                                <div>
                                    <p className="text-sm font-medium">Processing</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 ${['shipped', 'delivered'].includes(order.status) ? '' : 'opacity-40'}`}>
                                <CheckCircle size={20} className={['shipped', 'delivered'].includes(order.status) ? 'text-green-500' : 'text-gray-500'} />
                                <div>
                                    <p className="text-sm font-medium">Shipped</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 ${order.status === 'delivered' ? '' : 'opacity-40'}`}>
                                <CheckCircle size={20} className={order.status === 'delivered' ? 'text-green-500' : 'text-gray-500'} />
                                <div>
                                    <p className="text-sm font-medium">Delivered</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
