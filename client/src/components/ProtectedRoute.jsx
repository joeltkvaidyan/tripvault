import { Navigate } from 'react-router-dom';

// Wraps a page; redirects to /login if no JWT token is stored
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
