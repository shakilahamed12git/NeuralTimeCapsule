const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

// Middleware
app.use(cors());
app.use(express.json());
const fs = require('fs');
app.use((req, res, next) => {
    const logMsg = `${new Date().toISOString()} - ${req.method} ${req.url} - ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync(path.join(__dirname, 'server_debug.log'), logMsg);
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/memories', require('./routes/memories'));
app.use('/api/capsules', require('./routes/capsules'));

app.get('/', (req, res) => {
    res.send('Neural Time Capsules API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neural-time-capsule')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error Handling Middleware
app.use((err, req, res, next) => {
    const errMsg = `${new Date().toISOString()} - GLOBAL ERROR: ${err.stack || err}\n`;
    fs.appendFileSync(path.join(__dirname, 'server_debug.log'), errMsg);
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
