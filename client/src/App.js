import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import UserHome from './pages/UserHome';
import OwnerHome from './pages/OwnerHome';
import ShopList from './pages/ShopList'; // ✅ components folder එකෙන් import කළා
import AddShop from './pages/AddShop'; // ✅ AddShop component එකත් import කළා

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/owner-home" element={<OwnerHome />} />
        <Route path="/shops" element={<ShopList />} /> {/* /shops path එකට ShopList පෙන්වයි */}
        <Route path="/add-shop" element={<AddShop />} /> {/* /add-shop path එකට AddShop පෙන්වයි */}
        {/* Add other routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;