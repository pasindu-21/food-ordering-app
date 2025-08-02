import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Loaded user from sessionStorage:', parsedUser); // Debug
        // Ensure userId is set
        if (parsedUser._id && !sessionStorage.getItem('userId')) {
          sessionStorage.setItem('userId', parsedUser._id);
          console.log('Set userId from loaded user:', parsedUser._id); // Debug
        }
      }
    } catch (err) {
      console.error('Error loading user from sessionStorage:', err);
      // Clear invalid data
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userId');
    }
  }, []); // Run once on mount

  // New: Sync userId whenever user changes
  useEffect(() => {
    if (user?._id && !sessionStorage.getItem('userId')) {
      sessionStorage.setItem('userId', user._id);
      console.log('Synced userId on user change:', user._id); // Debug
    }
  }, [user]); // Depend on user state

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    if (updatedUser?._id) {
      sessionStorage.setItem('userId', updatedUser._id);
      console.log('Updated user ID:', updatedUser._id); // Debug
    }
  };

  // New: Logout function to clear state and storage
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token'); // If token is stored
    console.log('User logged out'); // Debug
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
