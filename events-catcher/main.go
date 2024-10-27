package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/event-monitor/chain-info/database"
	"github.com/event-monitor/chain-info/rpc"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // PostgreSQL driver
	tmhttp "github.com/tendermint/tendermint/rpc/client/http"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	rpcURL := os.Getenv("RPC_URL")
	enableStorage, _ := strconv.ParseBool(os.Getenv("ENABLE_STORAGE"))
	truncateStorage, _ := strconv.ParseBool(os.Getenv("TRUNCATE_STORAGE"))
	fetchInterval, _ := strconv.Atoi(os.Getenv("FETCH_INTERVAL"))

	interval := time.Duration(fetchInterval) * time.Second // Fetch interval

	client, err := tmhttp.New(rpcURL, "/websocket")
	if err != nil {
		log.Fatalf("Failed to create HTTP client: %v", err)
	}

	// Initialize database if storage is enabled
	var db *database.Database
	if enableStorage {
		connStr := fmt.Sprintf("user=%s dbname=%s password=%s sslmode=disable",
			os.Getenv("DB_USER"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PASSWORD"))
		db, err = database.NewDatabase(connStr)
		if err != nil {
			log.Fatalf("Database connection failed: %v", err)
		}
		if truncateStorage {
			err := db.ResetTables()
			if err != nil {
				log.Fatalf("Failed to truncate database: %v", err)
			}
		}
		defer db.Db.Close()
	}

	fmt.Println("Starting chain monitor...")
	rpc.FetchBlockData(client, db, interval)
}
