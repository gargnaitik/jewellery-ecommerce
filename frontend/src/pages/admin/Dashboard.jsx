import { IndianRupee, ShoppingCart, Users, Package } from 'lucide-react';
import './admin.css';

const Dashboard = () => {
    // Placeholder stats for now
    const stats = [
        { label: 'Total Revenue', value: '₹12,45,000', icon: IndianRupee, color: 'text-green-400' },
        { label: 'Total Orders', value: '156', icon: ShoppingCart, color: 'text-blue-400' },
        { label: 'Total Users', value: '1,245', icon: Users, color: 'text-purple-400' },
        { label: 'Total Products', value: '45', icon: Package, color: 'text-orange-400' },
    ];

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="text-gray-400 mt-2">Welcome to the Kanakam admin panel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="admin-card flex items-center gap-4">
                        <div className={`p-4 rounded-full bg-black/40 border border-white/10 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="admin-card">
                    <h3 className="text-xl font-semibold mb-6 text-[#d4af37]">Recent Orders</h3>
                    <p className="text-gray-400 text-sm">Real-time charts and recent order list will be implemented here.</p>
                </div>
                <div className="admin-card">
                    <h3 className="text-xl font-semibold mb-6 text-[#d4af37]">Low Stock Alert</h3>
                    <p className="text-gray-400 text-sm">Products with low inventory will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
