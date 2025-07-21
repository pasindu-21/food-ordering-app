// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// REMOVE ThemeProvider, createTheme import

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
// FIX: correct import path, use "components" (plural)
import ColorModeProvider from "./context/ColorModeContext"; 

function App() {
  return (
    <ColorModeProvider>
      <Router>
        <Header />
        <Routes>
          {/* Default route is the AuthForm */}
          <Route path="/" element={<AuthForm />} />
          
          {/* <<<<---- 1. THIS IS THE PUBLIC ROUTE FOR GUESTS AND USERS ---->>>> */}
          <Route path="/shops" element={<UserShopList />} />

          {/* User Specific Private Routes */}
          <Route path="/user-home" element={<PrivateRoute><UserHome /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><UserOrders /></PrivateRoute>} />

          {/* Owner Specific Private Routes */}
          <Route path="/owner-home" element={<PrivateRoute><OwnerHome /></PrivateRoute>} />
          
          {/* <<<<---- 2. FIX: THIS IS THE NEW, PRIVATE ROUTE FOR OWNERS ONLY ---->>>> */}
          <Route path="/my-shops" element={<PrivateRoute><OwnerShopList /></PrivateRoute>} />
          
          <Route path="/add-shop" element={<PrivateRoute><AddShop /></PrivateRoute>} />
          <Route path="/owner-orders" element={<PrivateRoute><OwnerOrders /></PrivateRoute>} />
          <Route path="/daily-reports" element={<PrivateRoute><DailyReports /></PrivateRoute>} />
          <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

        </Routes>
        <Footer />
      </Router>
    </ColorModeProvider>
  );
}

export default App;
