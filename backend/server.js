require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const predictRoutes = require("./routes/predict");

const app = express();
connectDB();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/citizen', require('./routes/citizen'));
app.use('/api/officer', require('./routes/officer'));
app.use('/api/collector', require('./routes/collector'));
app.use('/api/industry', require('./routes/industry'));
app.use('/api/tracker', require('./routes/tracker'));
app.use('/api/predict', predictRoutes);
app.use('/api/chat', require('./routes/chat.cjs'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;

function startServer(port, attempt = 0) {
	const server = app.listen(port, () => {
		console.log(`EcoConnect server running on port ${port}`);
	});

	server.on('error', (error) => {
		if (error.code === 'EADDRINUSE' && attempt < 10) {
			const nextPort = Number(port) + 1;
			console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
			startServer(nextPort, attempt + 1);
			return;
		}

		console.error('Failed to start server:', error.message);
		process.exit(1);
	});
}

startServer(Number(PORT));
