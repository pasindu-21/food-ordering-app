const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shopRoutes'); // <-- Changed 'shoproute' to 'shopRoutes' // Corrected import name to match file

dotenv.config();

const app = express();

// CORS Middleware එක add කරන්න (මේක අනිවාර්යයෙන්ම තිබිය යුතුයි)
app.use(cors());

// Middleware
app.use(express.json()); // Body parser for JSON requests

// Routes
app.use('/api/auth', authRoutes);
// ✅ Apply shop routes under '/api/shops' prefix
app.use('/api/shops', shopRoutes); 

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