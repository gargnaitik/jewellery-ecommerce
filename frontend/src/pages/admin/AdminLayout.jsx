import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft } from 'lucide-react';
import './admin.css';

const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <h2>Admin Panel</h2>
            <nav className="flex flex-col gap-2">
                <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                    <ShoppingCart size={20} /> Orders
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                    <Package size={20} /> Products
                </NavLink>
                <div className="mt-8 pt-8 border-t border-white/10">
                    <NavLink to="/" className="admin-nav-link">
                        <ArrowLeft size={20} /> Back to Store
                    </NavLink>
                </div>
            </nav>
        </aside>
    );
};

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
