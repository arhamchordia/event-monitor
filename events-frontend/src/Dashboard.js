// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    IconButton,
    TextField,
    Button,
    Snackbar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';

const Dashboard = () => {
    const [blocks, setBlocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [events, setEvents] = useState([]);
    const [txHashInput, setTxHashInput] = useState('');
    const [fetchedEvents, setFetchedEvents] = useState([]);
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const blocksResponse = await axios.get('http://localhost:30001/api/blocks');
                const transactionsResponse = await axios.get('http://localhost:30001/api/transactions');
                const eventsResponse = await axios.get('http://localhost:30001/api/events');
                setBlocks(blocksResponse.data);
                setTransactions(transactionsResponse.data);
                setEvents(eventsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSnackMessage('Copied to clipboard!');
        setSnackOpen(true);
    };

    const fetchEventsForTxHash = async () => {
        if (!txHashInput) return; // Don't fetch if input is empty

        try {
            const response = await axios.get(`http://localhost:30001/api/event_of_transaction/${txHashInput}`);
            setFetchedEvents(response.data);
        } catch (error) {
            console.error('Error fetching events for txHash:', error);
            setFetchedEvents([]); // Clear previous events on error
        }
    };

    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    return (
        <Container style={{ marginTop: '2em' }}>
            <Typography variant="h4" gutterBottom align="center">
                Chain Event Dashboard
            </Typography>

            <Grid container spacing={4}>
                {/* Blocks and Transactions Section */}
                <Grid container item xs={12} spacing={4}>
                    {/* Blocks Section */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} style={{ padding: '1.5em' }}>
                            <Typography variant="h6" align="center" gutterBottom>Blocks</Typography>
                            <TableContainer style={{ maxHeight: 600, overflowY: 'auto' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Copy JSON</TableCell>
                                            <TableCell>Height</TableCell>
                                            <TableCell>Timestamp</TableCell>
                                            <TableCell>Txs</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {blocks.map((block) => (
                                            <TableRow key={block.height}>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleCopyToClipboard(JSON.stringify(block))}
                                                        size="small"
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{block.height}</TableCell>
                                                <TableCell>{new Date(block.timestamp).toLocaleString()}</TableCell>
                                                <TableCell>{block.num_txs}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    {/* Transactions Section */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} style={{ padding: '1.5em' }}>
                            <Typography variant="h6" align="center" gutterBottom>Transactions</Typography>
                            <TableContainer style={{ maxHeight: 600, overflowY: 'auto' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Copy JSON</TableCell>
                                            <TableCell>Tx Hash</TableCell>
                                            <TableCell>Height</TableCell>
                                            <TableCell>Timestamp</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx.tx_hash}>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleCopyToClipboard(JSON.stringify(tx))}
                                                        size="small"
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tooltip title={tx.tx_hash}>
                                                            <span>{tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-10)}</span>
                                                        </Tooltip>
                                                        <IconButton
                                                            onClick={() => handleCopyToClipboard(tx.tx_hash)}
                                                            size="small"
                                                            style={{ marginLeft: 8 }}
                                                        >
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{tx.height}</TableCell>
                                                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>

                {/* TxHash Input Section moved above Events Section */}
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '1.5em', marginTop: '2em' }}>
                        <Typography variant="h6" align="center" gutterBottom>Fetch Events by Tx Hash</Typography>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={8}>
                                <TextField
                                    label="Enter Tx Hash"
                                    variant="outlined"
                                    fullWidth
                                    value={txHashInput}
                                    onChange={(e) => setTxHashInput(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={fetchEventsForTxHash}
                                    fullWidth
                                >
                                    Fetch Events
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Fetched Events Section */}
                        <Typography variant="h6" align="center" gutterBottom style={{ marginTop: '1em' }}>Fetched Events</Typography>
                        <TableContainer style={{ maxHeight: 400, overflowY: 'auto', marginTop: '1em' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Copy JSON</TableCell>
                                        <TableCell>Event Type</TableCell>
                                        <TableCell>Attributes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fetchedEvents.map((event, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleCopyToClipboard(JSON.stringify(event.attributes))}
                                                    size="small"
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{event.event_type}</TableCell>
                                            <TableCell>{JSON.stringify(event.attributes)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Events Section */}
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '1.5em' }}>
                        <Typography variant="h6" align="center" gutterBottom>Events</Typography>
                        <TableContainer style={{ maxHeight: 600, overflowY: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Copy JSON</TableCell>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Event Type</TableCell>
                                        <TableCell>Attributes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.map((event, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleCopyToClipboard(JSON.stringify(event.attributes))}
                                                    size="small"
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{event.id}</TableCell>
                                            <TableCell>{event.event_type}</TableCell>
                                            <TableCell>{JSON.stringify(event.attributes)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar for copying feedback */}
            <Snackbar open={snackOpen} autoHideDuration={3000} onClose={handleSnackClose}>
                <Alert onClose={handleSnackClose} severity="success">{snackMessage}</Alert>
            </Snackbar>
        </Container>
    );
};

export default Dashboard;
