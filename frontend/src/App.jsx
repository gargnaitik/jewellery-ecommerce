import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

/* ── Stores ──────────────────────────────────────────────────── */
import useAuthStore from './store/auth.store';
import useGoldStore from './store/gold.store';

/* ── Layout ──────────────────────────────────────────────────── */
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ProtectedRoute from './components/auth/ProtectedRoute';

/* ── Pages ───────────────────────────────────────────────────── */
import Home from './pages/home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/products/Products';
import ProductDetail from './pages/products/ProductDetail';
import Checkout from './pages/checkout/Checkout';
import OrderSuccess from './pages/checkout/OrderSuccess';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import Profile from './pages/profile/Profile';
import GoldRate from './pages/GoldRate';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

/* ── Admin Pages ─────────────────────────────────────────────── */
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';

// import NotFound from './pages/NotFound';

export default function App() {
    const { token, getMe } = useAuthStore();
    const { startPolling, stopPolling } = useGoldStore();

    /* ── Bootstrap: restore session + start gold polling ──────── */
    useEffect(() => {
        if (token) getMe();          // re-validate token on mount
        startPolling();              // start live gold rate polling
        return () => stopPolling();  // cleanup on unmount
    }, [getMe, startPolling, stopPolling, token]);

    return (
        <div>
            {/* Cart drawer lives outside Routes so it's always available */}
            <CartDrawer />

            <Navbar />

            <Routes>
                {/* ── Public ── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/gold-rate" element={<GoldRate />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ── Protected ── */}
                <Route path="/checkout" element={
                    <ProtectedRoute><Checkout /></ProtectedRoute>
                } />
                <Route path="/order-success" element={
                    <ProtectedRoute><OrderSuccess /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                    <ProtectedRoute><OrderList /></ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                    <ProtectedRoute><OrderDetail /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* ── 404 ── */}
                <Route path="*" element={<NotFound />} />

                {/* ── Admin ── */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id/edit" element={<ProductForm />} />
                </Route>
            </Routes>

            <Footer />
        </div>
    );
}
