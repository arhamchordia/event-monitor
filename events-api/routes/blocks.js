const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// API to fetch all blocks
router.get('/blocks', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blocks ORDER BY height DESC');
        client.release();

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; // Export the router
