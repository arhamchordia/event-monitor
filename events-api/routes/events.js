const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// API to fetch events separately
router.get('/events', async (req, res) => {
    const { transactionId } = req.query;

    try {
        const client = await pool.connect();
        let eventsQuery = 'SELECT * FROM transaction_events';

        // Filter by transaction ID if provided
        const eventsResult = transactionId
            ? await client.query(`${eventsQuery} WHERE transaction_id = $1`, [transactionId])
            : await client.query(eventsQuery);

        client.release();
        res.json(eventsResult.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; // Export the router
