// routes/transactions.js
const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// New endpoint to fetch events by transaction hash
router.get('/event_of_transaction/:txHash', async (req, res) => {
    const { txHash } = req.params;

    try {
        const client = await pool.connect();

        // Step 1: Fetch transaction ID based on txHash
        const transactionIdQuery = `SELECT id FROM transactions WHERE tx_hash = $1`;
        const transactionIdResult = await client.query(transactionIdQuery, [txHash]);

        if (transactionIdResult.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found for the provided hash.' });
        }

        const transactionId = transactionIdResult.rows[0].id;

        // Step 2: Fetch events using the transaction ID
        const eventsQuery = `SELECT * FROM transaction_events WHERE transaction_id = $1`;
        const eventsResult = await client.query(eventsQuery, [transactionId]);

        client.release();

        if (eventsResult.rows.length === 0) {
            return res.status(404).json({ message: 'No events found for this transaction hash.' });
        }

        res.json(eventsResult.rows);
    } catch (error) {
        console.error('Error fetching events for transaction:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
