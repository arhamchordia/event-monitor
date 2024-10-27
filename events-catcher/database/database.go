package database

import (
	"database/sql"
	"fmt"
	"github.com/lib/pq"
	_ "github.com/lib/pq" // PostgreSQL driver
	abcitypes "github.com/tendermint/tendermint/abci/types"
	"github.com/tendermint/tendermint/libs/json"
	coretypes "github.com/tendermint/tendermint/rpc/core/types"
	"time"
)

type Database struct {
	Db *sql.DB
}

// NewDatabase initializes a new database connection
func NewDatabase(connStr string) (*Database, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Db: %w", err)
	}

	// Verify connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Db connection error: %w", err)
	}

	return &Database{Db: db}, nil
}

func (d *Database) ResetTables() error {
	// Truncate tables and reset IDs
	_, err := d.Db.Exec(`
        TRUNCATE TABLE blocks RESTART IDENTITY CASCADE;
        TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;
        TRUNCATE TABLE transaction_events RESTART IDENTITY CASCADE;
    `)
	return err
}

// InsertBlock inserts block data into the blocks table.
func (d *Database) InsertBlock(
	blockIDHash string,
	chainID string,
	height int64,
	timestamp time.Time,
	proposerAddress string,
	txs []string,
	numTxs int,
) error {
	query := `
        INSERT INTO blocks (
            block_id_hash, chain_id, height, timestamp, proposer_address, txs, num_txs
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7
        )
        ON CONFLICT (height) DO NOTHING
    `

	_, err := d.Db.Exec(query,
		blockIDHash, chainID, height, timestamp, proposerAddress, pq.Array(txs), numTxs,
	)
	return err
}

// InsertTransaction inserts transaction data into the transactions table.
func (d *Database) InsertTransaction(txHash string, height int64, timestamp time.Time) error {
	query := `
        INSERT INTO transactions (tx_hash, height, timestamp)
        VALUES ($1, $2, $3)
        ON CONFLICT (tx_hash) DO NOTHING
    `

	_, err := d.Db.Exec(query, txHash, height, timestamp)
	return err
}

// EventAttribute is a single key-value pair, associated with an event.
type EventAttribute struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Index bool   `json:"index"`
}

// InsertTransactionEvent inserts an event related to a transaction into the transaction_events table.
func (d *Database) InsertTransactionEvent(transactionID int, eventType string, attributes []abcitypes.EventAttribute) error {
	// Decode base64 attributes
	var newEvents []EventAttribute
	for _, attr := range attributes {
		newEvents = append(newEvents, EventAttribute{
			Key:   string(attr.Key),
			Value: string(attr.Value),
			Index: attr.Index,
		})
	}

	// Convert the decoded attributes to JSON format for insertion
	attributesJSON, err := json.Marshal(newEvents)
	if err != nil {
		return fmt.Errorf("failed to marshal attributes to JSON: %v", err)
	}

	// Insert event into the database
	query := `
        INSERT INTO transaction_events (transaction_id, event_type, attributes)
        VALUES ($1, $2, $3)
    `

	_, err = d.Db.Exec(query, transactionID, eventType, attributesJSON)
	if err != nil {
		return fmt.Errorf("failed to insert transaction event: %v", err)
	}
	return nil
}

// Example function to insert transaction and events
func (d *Database) InsertTransactionWithEvents(tx coretypes.ResultTx, time time.Time) error {
	// Call InsertTransaction first
	err := d.InsertTransaction(
		tx.Hash.String(),
		tx.Height,
		time,
	)
	if err != nil {
		return err
	}

	// Get transaction ID for foreign key
	var transactionID int
	err = d.Db.QueryRow("SELECT id FROM transactions WHERE tx_hash = $1", tx.Hash.String()).Scan(&transactionID)
	if err != nil {
		return err
	}

	// Insert each event
	for _, event := range tx.TxResult.Events {
		err = d.InsertTransactionEvent(transactionID, event.Type, event.Attributes)
		if err != nil {
			return err
		}
	}

	return nil
}
