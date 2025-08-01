import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ඔයාගෙ auth context එක (පහල explain කරන්නම්)

const ProtectedRoute = ({ component: Component }) => {
  const { isAuthenticated } = useAuth(); // Auth state check කරන්න

  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
