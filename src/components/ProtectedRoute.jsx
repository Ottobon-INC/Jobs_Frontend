import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // SECURITY: If roles are required, deny access unless role is confirmed valid (OWASP A01)
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Role not authorized or unknown, redirect to home
        return <Navigate to="/" replace />;
    }

    // Render children if provided (wrapper mode), otherwise Outlet (layout mode)
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
