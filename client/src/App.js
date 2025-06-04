import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthForm from './components/AuthForm';
import UserHome from './pages/UserHome';
import OwnerHome from './pages/OwnerHome';
import UserShopList from './pages/UserShopList';
import OwnerShopList from './pages/OwnerShopList';
import AddShop from './pages/AddShop';
import UserOrders from './pages/UserOrders';
import OwnerOrders from './pages/OwnerOrders';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  // You can customize palette here if you want
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
          <Route path="/" element={<AuthForm />} />

          <Route path="/user-home" element={
            <PrivateRoute><UserHome /></PrivateRoute>
          } />
          <Route path="/owner-home" element={
            <PrivateRoute><OwnerHome /></PrivateRoute>
          } />

          <Route path="/shops" element={
            <PrivateRoute><ShopsSwitch /></PrivateRoute>
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
