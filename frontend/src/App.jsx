import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// pages
import Home          from './pages/Home';
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import ProductList   from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Checkout      from './pages/checkout/Checkout';
import OrderSuccess  from './pages/checkout/OrderSuccess';
import OrderList     from './pages/orders/OrderList';
import OrderDetail   from './pages/orders/OrderDetail';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <Routes>
                    {/* public routes */}
                    <Route path="/"           element={<Home />} />
                    <Route path="/login"      element={<Login />} />
                    <Route path="/register"   element={<Register />} />
                    <Route path="/products"   element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />

                    {/* protected routes — must be logged in */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/checkout"          element={<Checkout />} />
                        <Route path="/orders"            element={<OrderList />} />
                        <Route path="/orders/:id"        element={<OrderDetail />} />
                        <Route path="/order-success/:id" element={<OrderSuccess />} />
                    </Route>
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;