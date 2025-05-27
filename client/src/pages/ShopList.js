import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ShopList = () => {
  // sessionStorage වෙතින් user සහ token ලබාගැනීම සඳහා state භාවිතා කරමු
  const [currentUser, setCurrentUser] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);

  const [shops, setShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ shopName: '', location: '' });

  // Component mount වන විට දත්ත sessionStorage වෙතින් ලබාගැනීම
  useEffect(() => {
    const updateSessionUserAndToken = () => {
      try {
        const storedUser = sessionStorage.getItem("user"); // ✅ sessionStorage
        const storedToken = sessionStorage.getItem("token"); // ✅ sessionStorage
        
        setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
        setCurrentToken(storedToken);
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
        setCurrentUser(null);
        setCurrentToken(null);
      }
    };

    updateSessionUserAndToken(); // මුලින්ම load කරගන්න

    // Note: sessionStorage tab-specific නිසා 'storage' event එක වැඩ කරන්නේ නැහැ.
    // ඔබට tabs අතර sync කරන්න ඕනිනම්, localStorage හෝ වෙනත් ක්‍රමයක් භාවිතා කරන්න වෙනවා.
    // නමුත් ඔබේ ප්‍රශ්නයට අනුව, tab-specific session අවශ්‍යයි.
    // ඒ නිසා window.addEventListener('storage', ...) මෙතන අවශ්‍ය නැහැ.

    // මෙම useEffect එකෙන් දත්ත load කරන්නේ mount එකේදී පමණයි.
    // refresh හෝ back කරන විට, session storage එකෙන් අලුතින් load වෙනවා.
  }, []);

  // currentUser හෝ currentToken වෙනස් වූ විට shops නැවත fetch කිරීමට
  // මෙය browser reload/back කරන විටත්, login/logout වැනි දේ සිදුවූ විටත් ක්‍රියාත්මක වේ.
  useEffect(() => {
    if (currentToken) {
      fetchShops(currentUser, currentToken);
    } else {
      setShops([]); // Token එකක් නැතිනම් shops හිස් කරන්න
    }
  }, [currentUser, currentToken]);

  const fetchShops = async (user, token) => {
    if (!token) {
      console.log("No token available to fetch shops.");
      setShops([]);
      return;
    }

    try {
      let res;
      if (user?.role === "owner") {
        res = await axios.get("http://localhost:5000/api/shops/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.get("http://localhost:5000/api/shops/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShops(res.data);
    } catch (err) {
      console.error("Error fetching shops:", err);
      if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
      } else if (err.request) {
          console.error("No response received:", err.request);
      } else {
          console.error("Error setting up request:", err.message);
      }
      if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired or unauthorized. Please log in again.");
          sessionStorage.removeItem("token"); // ✅ sessionStorage
          sessionStorage.removeItem("user"); // ✅ sessionStorage
          setCurrentUser(null);
          setCurrentToken(null);
          // window.location.href = '/login'; // Optional: Redirect to login
      } else {
          alert("Failed to fetch shops. Please check console for more details.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    if (!currentToken) {
      alert("Please log in to delete shops.");
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/shops/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      fetchShops(currentUser, currentToken);
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
          alert("Failed to delete shop: " + (err.response.data.error || err.response.data.msg || "Unknown error"));
      } else {
          alert("Failed to delete shop. Check console.");
      }
    }
  };

  const handleEditClick = (shop) => {
    setEditingShop(shop._id);
    setFormData({ shopName: shop.shopName, location: shop.location || '' });
  };

  const handleEditSave = async () => {
    if (!currentToken) {
      alert("Please log in to update shops.");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/shops/${editingShop}`, formData, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setEditingShop(null);
      fetchShops(currentUser, currentToken);
    } catch (err) {
      console.error("Update error:", err);
      if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
          alert("Failed to update shop: " + (err.response.data.error || err.response.data.msg || "Unknown error"));
      } else {
          alert("Failed to update shop. Check console.");
      }
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-4">
      <h3>{currentUser?.role === "owner" ? "My Shops" : "All Available Shops"}</h3>
      {shops.length === 0 ? (
        <p>No shops found.</p>
      ) : (
        shops.map((shop) => (
          <div key={shop._id} className="card mb-3">
            <div className="card-body">
              {editingShop === shop._id ? (
                // Edit Mode
                <>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleFormChange}
                    className="form-control mb-2"
                    placeholder="Shop Name"
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="form-control mb-2"
                    placeholder="Location"
                  />
                  <button onClick={handleEditSave} className="btn btn-success btn-sm me-2">Save</button>
                  <button onClick={() => setEditingShop(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </>
              ) : (
                // Display Mode
                <>
                  <h5 className="card-title">{shop.shopName}</h5>
                  <p><strong>Location:</strong> {shop.location || 'N/A'}</p>
                  {shop.owner && <p><strong>Owner:</strong> {shop.owner.name} ({shop.owner.email})</p>}
                  
                  <p className="card-text">Menu:</p>
                  <ul>
                    {shop.menuItems && shop.menuItems.length > 0 ? (
                      shop.menuItems.map((item, index) => (
                        <li key={index}>
                          🍽 {item.name} - Rs.{item.price} (B:{item.breakfastQty}, L:{item.lunchQty}, D:{item.dinnerQty})
                        </li>
                      ))
                    ) : (
                      <li>No menu items available.</li>
                    )}
                  </ul>
                  
                  {currentUser?.role === 'owner' && (
                    <>
                      <button onClick={() => handleEditClick(shop)} className="btn btn-primary btn-sm me-2">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(shop._id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ShopList;