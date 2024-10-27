import React, { useState } from 'react';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';
import { Tooltip } from '@mui/material';
import './downloads.css';

const Downloads = () => {
    const [txHash, setTxHash] = useState('');

    const downloadData = (url) => {
        axios.get(url)
            .then(response => {
                const dataStr = JSON.stringify(response.data);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "data.json";
                link.click();
            })
            .catch(error => console.error("Error downloading data:", error));
    };

    return (
        <div className="container">
            <div className="title">Download Chain Data</div>

            <div className="section">
                <h3><DownloadIcon /> Download Block Data</h3>
                <div className="instructions">Get all block data as a JSON file.</div>
                <button className="download-button" onClick={() => downloadData('http://localhost:30001/api/blocks')}>
                    DOWNLOAD BLOCKS
                </button>
            </div>

            <div className="section">
                <h3><DownloadIcon /> Download Transactions</h3>
                <div className="instructions">Get all transaction data as a JSON file.</div>
                <button className="download-button" onClick={() => downloadData('http://localhost:30001/api/transactions')}>
                    DOWNLOAD TRANSACTIONS
                </button>
            </div>

            <div className="section">
                <h3><DownloadIcon /> Download Events Data</h3>
                <div className="instructions">Enter a transaction hash to download specific event data.</div>
                <Tooltip title="Enter a valid transaction hash" arrow>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Transaction Hash"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                    />
                </Tooltip>
                <button
                    className="download-button"
                    onClick={() => downloadData(`http://localhost:30001/api/event_of_transaction/${txHash}`)}
                    disabled={!txHash}
                >
                    DOWNLOAD EVENTS FOR TX HASH
                </button>
            </div>
        </div>
    );
};

export default Downloads;
