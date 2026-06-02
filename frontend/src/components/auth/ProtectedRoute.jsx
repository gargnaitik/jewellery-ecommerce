import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';

export default function ProtectedRoute({ children }) {
    const { token } = useAuthStore();
    const location = useLocation();

    if (!token) {
        // save attempted URL so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}