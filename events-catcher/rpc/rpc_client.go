package rpc

import (
	"context"
	"encoding/hex"
	"fmt"
	"github.com/event-monitor/chain-info/database"
	tmhttp "github.com/tendermint/tendermint/rpc/client/http"
	coretypes "github.com/tendermint/tendermint/rpc/core/types"
	"log"
	"os"
	"strconv"
	"time"
)

// FetchBlockData connects to the RPC client and retrieves block events
func FetchBlockData(client *tmhttp.HTTP, db *database.Database, interval time.Duration) {
	// Read starting height from environment variable
	startHeightStr := os.Getenv("START_HEIGHT")
	if startHeightStr == "" {
		log.Fatal("START_HEIGHT environment variable is not set")
	}

	latestHeight, err := strconv.ParseInt(startHeightStr, 10, 64)
	if err != nil {
		log.Fatalf("Invalid START_HEIGHT value: %v", err)
	}
	fmt.Printf("Starting from block height: %d\n", latestHeight)

	for {
		block, err := client.Block(context.Background(), &latestHeight)
		if err != nil {
			log.Printf("Error fetching block at height %d: %v", latestHeight, err)
			time.Sleep(interval)
			continue
		}

		// Insert block data if storage is enabled
		if db != nil {
			// Assuming `block` contains the data structure with all fields
			var txs []string
			for _, tx := range block.Block.Txs {
				txs = append(txs, hex.EncodeToString(tx.Hash()))
			}
			err := db.InsertBlock(block.BlockID.Hash.String(), block.Block.ChainID, block.Block.Height, block.Block.Time, block.Block.ProposerAddress.String(), txs, len(block.Block.Data.Txs))
			if err != nil {
				log.Printf("Failed to insert block data: %v", err)
			} else {
				log.Printf("Block data inserted for height: %d", block.Block.Height)
			}
		}

		processBlock(client, db, block)
		latestHeight++
		time.Sleep(interval)
	}
}

func processBlock(client *tmhttp.HTTP, db *database.Database, block *coretypes.ResultBlock) {
	fmt.Printf("Processing Block: %d\n", block.Block.Height)

	for _, tx := range block.Block.Data.Txs {
		txHash := fmt.Sprintf("%X", tx.Hash())

		txResult, err := fetchTxByHash(client, txHash)
		if err != nil {
			log.Printf("Error fetching tx by hash %s: %v", txHash, err)
			continue
		}

		//Insert transaction data if storage is enabled
		if db != nil {
			// insert all the events from this transaction to the events table
			err := db.InsertTransactionWithEvents(*txResult, block.Block.Time)
			if err != nil {
				log.Printf("Failed to insert transaction data: %v", err)
			}
		}
	}
}

// fetchTxByHash queries a transaction by its hash
func fetchTxByHash(client *tmhttp.HTTP, txHash string) (*coretypes.ResultTx, error) {
	hash, err := hex.DecodeString(txHash)
	if err != nil {
		return nil, fmt.Errorf("invalid transaction hash: %v", err)
	}

	txResult, err := client.Tx(context.Background(), hash, false)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %v", err)
	}

	return txResult, nil
}
