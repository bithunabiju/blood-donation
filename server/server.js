const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');

// Initialize express app
const app = express();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blooddonationdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Call the connect function
connectDB();

// Middleware
// Update this line in server.js
app.use(cors({
    origin: 'http://localhost:5000', // or whatever your frontend URL is
    credentials: true
  }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Add before your routes in server.js
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);

// Serve static files for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});