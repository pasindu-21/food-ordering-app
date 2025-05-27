import React, { useState } from 'react';
import axios from 'axios';

const AddShop = () => {
  const [shopName, setShopName] = useState('');
  const [menuItems, setMenuItems] = useState([
    { name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' },
  ]);

  const handleAddItem = () => {
    setMenuItems([
      ...menuItems,
      { name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' },
    ]);
  };

  const handleChangeItem = (index, field, value) => {
    const updatedItems = [...menuItems];
    updatedItems[index][field] = value;
    setMenuItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Get token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert("ඔබ login වී නැහැ හෝ token එක කල් ඉකුත් වී ඇත.");
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/shops',
        {
          shopName: shopName,
          menuItems: menuItems.map((item) => ({
            name: item.name,
            price: Number(item.price),
            breakfastQty: Number(item.breakfastQty || 0),
            lunchQty: Number(item.lunchQty || 0),
            dinnerQty: Number(item.dinnerQty || 0),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Shop එක සාර්ථකව ඇතුළත් විය!');
      setShopName('');
      setMenuItems([{ name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' }]);
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 403) {
        alert('Shop එක add කිරීම සඳහා ඔබට අවසර නැහැ.');
      } else if (err.response?.status === 401) {
        alert("ඔබගේ session එක කල් ඉකුත් වී ඇත. නැවත login වන්න.");
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        // You might want to redirect to login page here
        // window.location.href = '/login';
      } else {
        alert('Shop එක add කිරීම අසාර්ථක විය.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h3>Add New Shop</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Shop Name</label>
          <input
            type="text"
            className="form-control"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
        </div>

        <h5>Menu Items</h5>
        {menuItems.map((item, index) => (
          <div key={index} className="border p-3 mb-3 rounded bg-light">
            <div className="row g-2">
              <div className="col-md-3">
                <input
                  type="text"
                  placeholder="Food Name"
                  className="form-control"
                  value={item.name}
                  onChange={(e) => handleChangeItem(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  placeholder="Price"
                  className="form-control"
                  value={item.price}
                  onChange={(e) => handleChangeItem(index, 'price', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  placeholder="Breakfast Qty"
                  className="form-control"
                  value={item.breakfastQty}
                  onChange={(e) => handleChangeItem(index, 'breakfastQty', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  placeholder="Lunch Qty"
                  className="form-control"
                  value={item.lunchQty}
                  onChange={(e) => handleChangeItem(index, 'lunchQty', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  placeholder="Dinner Qty"
                  className="form-control"
                  value={item.dinnerQty}
                  onChange={(e) => handleChangeItem(index, 'dinnerQty', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-secondary me-2" onClick={handleAddItem}>
          Add More
        </button>

        <button type="submit" className="btn btn-success mt-3">
          Save Shop
        </button>
      </form>
    </div>
  );
};

export default AddShop;