import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getOrderById } from '../../services/order.service';
import { updateOrderStatus } from '../../services/admin.service';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(id);
                const orderData = response.data.order || response.data.data || response.data;
                setOrder(orderData);
                setStatus(orderData.status || 'pending');
            } catch (err) {
                console.error("Failed to fetch order details", err);
                setError('Failed to load order details.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleUpdateStatus = async () => {
        setUpdating(true);
        try {
            await updateOrderStatus(id, status);
            alert('Order status updated successfully!');
            // Refresh order
            const response = await getOrderById(id);
            const orderData = response.data.order || response.data.data || response.data;
            setOrder(orderData);
        } catch (err) {
            console.error("Failed to update status", err);
            alert('Failed to update status.');
        } finally {
            setUpdating(false);
        }
    };

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
        return <div className="text-center py-20 text-gray-400">Loading order details...</div>;
    }

    if (error || !order) {
        return <div className="text-red-500 text-center py-10">{error}</div>;
    }

    const { items = [], shipping_address = {} } = order;

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/orders" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
                    <ArrowLeft size={20} /> Back to Orders
                </Link>
            </div>
            
            <div className="admin-header flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1>Order #{order.id.substring(order.id.length - 8).toUpperCase()}</h1>
                    <p className="text-gray-400 mt-2">Placed on {formatDate(order.createdAt)}</p>
                </div>
                
                {/* Admin Status Update */}
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Update Status</label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-[#191919] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-[#d4af37]"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleUpdateStatus} 
                        disabled={updating || status === order.status}
                        className="admin-btn-primary px-4 py-2 mt-4 rounded font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> {updating ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-card">
                        <h2 className="text-xl font-semibold mb-6">Items Ordered</h2>
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-6 border-b border-white/10 last:border-0 last:pb-0">
                                    <div className="w-20 h-20 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
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
                                        <div className="text-[#d4af37] font-semibold">
                                            {formatCurrency(item.item_total)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="admin-card">
                        <h2 className="text-xl font-semibold mb-6">Customer & Shipping</h2>
                        <div className="text-sm text-gray-300 space-y-2">
                            <p className="font-medium text-white">{shipping_address.name}</p>
                            <p>{shipping_address.email}</p>
                            <p>{shipping_address.phone}</p>
                            <div className="pt-4 border-t border-white/10 mt-4">
                                <p>{shipping_address.street}</p>
                                <p>{shipping_address.city}, {shipping_address.state} {shipping_address.postal_code}</p>
                                <p>{shipping_address.country}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <h2 className="text-xl font-semibold mb-6">Financial Summary</h2>
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
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
