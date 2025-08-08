import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
    }
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Loaded user from sessionStorage:', parsedUser); // Debug
        // FIX: Ensure userId is set if missing
        const userId = parsedUser._id || parsedUser.id; // Handle _id or id
        if (userId && !sessionStorage.getItem('userId')) {
          sessionStorage.setItem('userId', userId);
          console.log('Set missing userId from stored user:', userId); // Debug
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
        sessionStorage.removeItem('user'); // Clear invalid data
      }
    } else {
      console.log('No stored user found in sessionStorage'); // Debug
    }
  }, []);

  const login = (newToken, newUser) => {
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    const userId = newUser._id || newUser.id; // Handle _id or id from API response
    if (userId) {
      sessionStorage.setItem('userId', userId);
      console.log('Stored userId during login:', userId); // Debug
    } else {
      console.error('Login error: user object missing _id or id'); // Debug
    }
    setIsAuthenticated(true);
    setUser(newUser);
    console.log('Logged in user:', newUser); // Debug
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
    const userId = updatedUser._id || updatedUser.id;
    if (userId) {
      sessionStorage.setItem('userId', userId);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
