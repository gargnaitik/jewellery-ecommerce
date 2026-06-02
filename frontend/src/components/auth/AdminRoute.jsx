import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';

export default function AdminRoute({ children }) {
    const { token, user } = useAuthStore();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // If children is provided, render it. Otherwise, render Outlet for nested routes
    return children ? children : <Outlet />;
}
