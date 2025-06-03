import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthForm from './components/AuthForm';
import UserHome from './pages/UserHome';
import OwnerHome from './pages/OwnerHome';
import ShopList from './pages/ShopList';
import AddShop from './pages/AddShop';
import UserOrders from './pages/UserOrders';
import OwnerOrders from './pages/OwnerOrders';
import Header from './components/Header';
import Footer from './components/Footer'; // <-- Create this (see below)
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  // You can customize palette here if you want
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/user-home" element={<UserHome />} />
          <Route path="/owner-home" element={<OwnerHome />} />
          <Route path="/shops" element={<ShopList />} />
          <Route path="/add-shop" element={<AddShop />} />
          <Route path="/my-orders" element={<UserOrders />} />
          <Route path="/owner-orders" element={<OwnerOrders />} />
          <Route path="/user-home" element={
  <PrivateRoute><UserHome /></PrivateRoute>
} />
<Route path="/owner-home" element={
  <PrivateRoute><OwnerHome /></PrivateRoute>
} />
<Route path="/shops" element={
  <PrivateRoute><ShopList /></PrivateRoute>
} />
<Route path="/add-shop" element={
  <PrivateRoute><AddShop /></PrivateRoute>
} />
<Route path="/my-orders" element={
  <PrivateRoute><UserOrders /></PrivateRoute>
} />
<Route path="/owner-orders" element={
  <PrivateRoute><OwnerOrders /></PrivateRoute>
} />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
