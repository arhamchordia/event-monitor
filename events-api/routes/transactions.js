const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// API to fetch transactions with an option to include events
router.get('/transactions', async (req, res) => {
    const { includeEvents } = req.query;

    try {
        const client = await pool.connect();
        let transactionsQuery = 'SELECT * FROM transactions ORDER BY timestamp DESC';

        // Fetch transactions
        const transactionsResult = await client.query(transactionsQuery);
        const transactions = transactionsResult.rows;

        // If `includeEvents` is true, fetch events for each transaction
        if (includeEvents === 'true') {
            for (const transaction of transactions) {
                const eventsQuery = `
                    SELECT * FROM transaction_events WHERE transaction_id = $1
                `;
                const eventsResult = await client.query(eventsQuery, [transaction.id]);
                transaction.events = eventsResult.rows;
            }
        }

        client.release();
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; // Export the router
