const express = require('express');
const db = require('./db'); // Import database connection
const blocksRoutes = require('./routes/blocks'); // Import blocks routes
const transactionsRoutes = require('./routes/transactions'); // Import transactions routes
const eventsRoutes = require('./routes/events'); // Import events routes
const eventsOfTransactions = require('./routes/eventsOfTransactions');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 30001; // Use PORT from .env or default to 30001

// Middleware
app.use(express.json()); // Parse JSON bodies

// Enable CORS for all routes
app.use(cors());

// Use routes
app.use('/api', blocksRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', eventsRoutes);
app.use('/api', eventsOfTransactions);

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
