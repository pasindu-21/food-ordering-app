const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shopRoutes');
const orderRoutes = require('./routes/orderRoutes'); // <-- Order routes import

dotenv.config();

const app = express(); // <-- app variable එක මෙහි declare කරන්න

// Middleware
app.use(cors());
app.use(express.json()); // Body parser for JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes); // <-- Order routes add කරන්න

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
