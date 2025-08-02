import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { UserProvider } from './context/UserContext'; // Import the provider

// Component & Page Imports (keep your existing imports)
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import UserHome from './pages/UserHome';
import OwnerHome from './pages/OwnerHome';
import UserShopList from './pages/UserShopList';
import OwnerShopList from './pages/OwnerShopList';
import AddShop from './pages/AddShop';
import UserOrders from './pages/UserOrders';
import OwnerOrders from './pages/OwnerOrders';
import DailyReports from './pages/DailyReports';
import AdminDashboard from './pages/AdminDashboard';
import ColorModeProvider from "./context/ColorModeContext";
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';

// New Root component for auth check inside Router
function Root() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));
    // Only redirect if on /auth and token exists
    if (token && user && window.location.pathname === '/auth') {
      const userRole = user.role;
      let redirectPath = '';
      if (userRole === 'admin') {
        redirectPath = '/admin-dashboard';
      } else if (userRole === 'owner') {
        redirectPath = '/owner-home';
      } else {
        redirectPath = '/user-home';
      }
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <Header />
      <Routes>
        {/* Default route එක shops list එකට */}
        <Route path="/" element={<UserShopList />} />
        
        {/* Auth form එක */}
        <Route path="/auth" element={<AuthForm />} />
        
        {/* Protected routes */}
        <Route path="/user-home" element={<PrivateRoute><UserHome /></PrivateRoute>} />
        <Route path="/my-orders" element={<PrivateRoute><UserOrders /></PrivateRoute>} />
        <Route path="/owner-home" element={<PrivateRoute><OwnerHome /></PrivateRoute>} />
        <Route path="/my-shops" element={<PrivateRoute><OwnerShopList /></PrivateRoute>} />
        <Route path="/add-shop" element={<PrivateRoute><AddShop /></PrivateRoute>} />
        <Route path="/owner-orders" element={<PrivateRoute><OwnerOrders /></PrivateRoute>} />
        <Route path="/daily-reports" element={<PrivateRoute><DailyReports /></PrivateRoute>} />
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        
        {/* Public pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        {/* Add /shops route to match links (e.g., from Header) */}
        <Route path="/shops" element={<UserShopList />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ColorModeProvider>
      <UserProvider> {/* Wrap with UserProvider for global user state */}
        <Router>
          <Root /> {/* All routing and auth check inside Root */}
        </Router>
      </UserProvider>
    </ColorModeProvider>
  );
}

export default App;
