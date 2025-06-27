// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
import DailyReports from './pages/DailyReports'; // <<<<---- 1. අලුත් DailyReports page එක import කරා

const theme = createTheme({
  // You can customize your theme palette here
});

// Helper component to switch shop list by role
function ShopsSwitch() {
  let role = null;
  try {
    const user = JSON.parse(sessionStorage.getItem('user'));
    role = user?.role;
  } catch {
    role = null;
  }
  if (role === 'owner') return <OwnerShopList />;
  return <UserShopList />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Header />
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<AuthForm />} />

          {/* User Specific Routes */}
          <Route path="/user-home" element={
            <PrivateRoute><UserHome /></PrivateRoute>
          } />
          <Route path="/my-orders" element={
            <PrivateRoute><UserOrders /></PrivateRoute>
          } />

          {/* Owner Specific Routes */}
          <Route path="/owner-home" element={
            <PrivateRoute><OwnerHome /></PrivateRoute>
          } />
          <Route path="/add-shop" element={
            <PrivateRoute><AddShop /></PrivateRoute>
          } />
          <Route path="/owner-orders" element={
            <PrivateRoute><OwnerOrders /></PrivateRoute>
          } />
          
          {/* <<<<---- 2. Daily Reports page එකට අලුත් route එකක් add කරා ---->>>> */}
          <Route path="/daily-reports" element={
            <PrivateRoute><DailyReports /></PrivateRoute>
          } />

          {/* Shared Routes (logic inside component) */}
          <Route path="/shops" element={
            <PrivateRoute><ShopsSwitch /></PrivateRoute>
          } />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
