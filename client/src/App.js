// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Component & Page Imports
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
import ColorModeProvider from "./context/ColorModeContext"; // නිවැරදි path එක
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';


function App() {
  return (
    <ColorModeProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/shops" element={<UserShopList />} />
          <Route path="/user-home" element={<PrivateRoute><UserHome /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><UserOrders /></PrivateRoute>} />
          <Route path="/owner-home" element={<PrivateRoute><OwnerHome /></PrivateRoute>} />
          <Route path="/my-shops" element={<PrivateRoute><OwnerShopList /></PrivateRoute>} />
          <Route path="/add-shop" element={<PrivateRoute><AddShop /></PrivateRoute>} />
          <Route path="/owner-orders" element={<PrivateRoute><OwnerOrders /></PrivateRoute>} />
          <Route path="/daily-reports" element={<PrivateRoute><DailyReports /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
        <Footer />
      </Router>
    </ColorModeProvider>
  );
}

export default App;
