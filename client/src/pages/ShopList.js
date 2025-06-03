import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm';

const ShopList = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [shops, setShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ shopName: '', location: '' });
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuEditData, setMenuEditData] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    price: '',
    breakfastQty: '',
    lunchQty: '',
    dinnerQty: ''
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");
    setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
    setCurrentToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentToken) {
      fetchShops();
    } else {
      setShops([]);
    }
    // eslint-disable-next-line
  }, [currentToken]);

  const fetchShops = async () => {
    if (!currentToken) return;
    try {
      let res;
      if (currentUser?.role === "owner") {
        res = await axios.get("http://localhost:5000/api/shops/my", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } else {
        res = await axios.get("http://localhost:5000/api/shops/all", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      }
      setShops(res.data);
    } catch (err) {
      setShops([]);
    }
  };

  // Shop name/location edit
  const handleEditClick = (shop) => {
    setEditingShop(shop._id);
    setFormData({ shopName: shop.shopName, location: shop.location || '' });
    setEditingMenuItem(null);
  };

  const handleEditSave = async () => {
    await axios.put(`http://localhost:5000/api/shops/${editingShop}`, formData, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    setEditingShop(null);
    fetchShops();
  };

  // Menu item edit
  const handleMenuItemEdit = (item) => {
    setEditingMenuItem(item._id);
    setMenuEditData({ ...item });
  };

  const handleMenuItemSave = async (shopId) => {
    await axios.put(`http://localhost:5000/api/shops/${shopId}`, {
      menuItemUpdate: {
        itemId: editingMenuItem,
        ...menuEditData
      }
    }, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    setEditingMenuItem(null);
    setMenuEditData({});
    fetchShops();
  };

  // Menu item delete
  const handleMenuItemDelete = async (shopId, itemId) => {
    await axios.put(`http://localhost:5000/api/shops/${shopId}`, {
      menuItemDeleteId: itemId
    }, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    setEditingMenuItem(null);
    setMenuEditData({});
    fetchShops();
  };

  // Add new menu item
  const handleAddMenuItem = async (shop) => {
    const updatedMenu = [
      ...shop.menuItems,
      {
        name: newMenuItem.name,
        price: Number(newMenuItem.price),
        breakfastQty: Number(newMenuItem.breakfastQty || 0),
        lunchQty: Number(newMenuItem.lunchQty || 0),
        dinnerQty: Number(newMenuItem.dinnerQty || 0)
      }
    ];
    await axios.put(`http://localhost:5000/api/shops/${shop._id}`, {
      menuItems: updatedMenu
    }, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    setNewMenuItem({ name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' });
    fetchShops();
  };

  // Shop delete
  const handleDeleteShop = async (shopId) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    await axios.delete(`http://localhost:5000/api/shops/${shopId}`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    fetchShops();
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
                // Edit Shop name/location
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
                <>
                  <h5 className="card-title">{shop.shopName}</h5>
                  <p><strong>Location:</strong> {shop.location || 'N/A'}</p>
                  {shop.owner && <p><strong>Owner:</strong> {shop.owner.name} ({shop.owner.email})</p>}
                  <p className="card-text">Menu:</p>
                  <ul>
                    {shop.menuItems && shop.menuItems.length > 0 ? (
                      shop.menuItems.map((item) => (
                        <li key={item._id}>
                          {editingMenuItem === item._id ? (
                            <>
                              <input
                                type="text"
                                value={menuEditData.name}
                                onChange={e => setMenuEditData({ ...menuEditData, name: e.target.value })}
                                style={{ width: '100px' }}
                              />
                              <input
                                type="number"
                                value={menuEditData.price}
                                onChange={e => setMenuEditData({ ...menuEditData, price: e.target.value })}
                                style={{ width: '70px' }}
                              />
                              <input
                                type="number"
                                value={menuEditData.breakfastQty}
                                onChange={e => setMenuEditData({ ...menuEditData, breakfastQty: e.target.value })}
                                style={{ width: '70px' }}
                              />
                              <input
                                type="number"
                                value={menuEditData.lunchQty}
                                onChange={e => setMenuEditData({ ...menuEditData, lunchQty: e.target.value })}
                                style={{ width: '70px' }}
                              />
                              <input
                                type="number"
                                value={menuEditData.dinnerQty}
                                onChange={e => setMenuEditData({ ...menuEditData, dinnerQty: e.target.value })}
                                style={{ width: '70px' }}
                              />
                              <button className="btn btn-success btn-sm me-2" onClick={() => handleMenuItemSave(shop._id)}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setEditingMenuItem(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              🍽 {item.name} - Rs.{item.price} (B:{item.breakfastQty}, L:{item.lunchQty}, D:{item.dinnerQty})
                              {currentUser?.role === 'owner' && (
                                <>
                                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleMenuItemEdit(item)}>Edit</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleMenuItemDelete(shop._id, item._id)}>Delete</button>
                                </>
                              )}
                            </>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>No menu items available.</li>
                    )}
                  </ul>
                  {/* Add new menu item form */}
                  {currentUser?.role === 'owner' && (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleAddMenuItem(shop);
                      }}
                      className="mb-3"
                      style={{ display: 'flex', gap: '5px', alignItems: 'center' }}
                    >
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={newMenuItem.name}
                        onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                        required
                        style={{ width: '100px' }}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={newMenuItem.price}
                        onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                        required
                        style={{ width: '70px' }}
                      />
                      <input
                        type="number"
                        placeholder="B.Qty"
                        value={newMenuItem.breakfastQty}
                        onChange={e => setNewMenuItem({ ...newMenuItem, breakfastQty: e.target.value })}
                        style={{ width: '60px' }}
                      />
                      <input
                        type="number"
                        placeholder="L.Qty"
                        value={newMenuItem.lunchQty}
                        onChange={e => setNewMenuItem({ ...newMenuItem, lunchQty: e.target.value })}
                        style={{ width: '60px' }}
                      />
                      <input
                        type="number"
                        placeholder="D.Qty"
                        value={newMenuItem.dinnerQty}
                        onChange={e => setNewMenuItem({ ...newMenuItem, dinnerQty: e.target.value })}
                        style={{ width: '60px' }}
                      />
                      <button className="btn btn-success btn-sm" type="submit">Add Item</button>
                    </form>
                  )}
                  {/* User Order Button & OrderForm */}
                  {currentUser?.role === 'user' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowOrderForm(shop)}
                      >
                        Order
                      </button>
                      {showOrderForm && showOrderForm._id === shop._id && (
                        <OrderForm shop={shop} onOrderPlaced={() => setShowOrderForm(null)} />
                      )}
                    </>
                  )}
                  {/* Owner: Shop Edit/Delete */}
                  {currentUser?.role === 'owner' && (
                    <>
                      <button onClick={() => handleEditClick(shop)} className="btn btn-primary btn-sm me-2">
                        Edit Shop
                      </button>
                      <button onClick={() => handleDeleteShop(shop._id)} className="btn btn-danger btn-sm">
                        Delete Shop
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
