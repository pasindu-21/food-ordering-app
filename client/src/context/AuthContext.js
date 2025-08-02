import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (token) setIsAuthenticated(true);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log('Loaded user from sessionStorage:', parsedUser); // Debug
      // FIX: Load userId if not set
      if (!sessionStorage.getItem('userId') && parsedUser._id) {
        sessionStorage.setItem('userId', parsedUser._id);
      }
    }
  }, []);

  const login = (newToken, newUser) => {
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    sessionStorage.setItem('userId', newUser._id); // FIX: Store _id as userId
    setIsAuthenticated(true);
    setUser(newUser);
    console.log('Logged in user:', newUser); // Debug
    console.log('Stored User ID:', newUser._id); // Debug
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    sessionStorage.setItem('userId', updatedUser._id); // Update userId
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
