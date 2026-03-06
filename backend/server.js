const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/citizen',    require('./routes/citizen'));
app.use('/api/government', require('./routes/government'));
app.use('/api/industry',   require('./routes/industry'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
  res.json({ message: '🌿 EcoConnect API Running', status: 'OK', version: '1.0.0' });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n=========================================');
  console.log('  🌿 EcoConnect Backend Server');
  console.log('=========================================');
  console.log(`  ✅ Running at: http://localhost:${PORT}`);
  console.log(`  📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=========================================\n');
});
