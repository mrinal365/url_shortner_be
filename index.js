require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: err.message });
  }
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
