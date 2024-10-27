#!/bin/bash

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing..."
    # For Ubuntu/Debian
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
else
    echo "PostgreSQL is already installed."
fi

# Start PostgreSQL service
sudo service postgresql start

# Set up database and tables
DB_NAME="chain_monitor"
DB_USER="myuser"
DB_PASSWORD="mypassword"

# Create the database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Create tables
TABLES_SQL="CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    block_id_hash VARCHAR(255),
    chain_id VARCHAR(255),
    height BIGINT,
    timestamp TIMESTAMPTZ,
    proposer_address VARCHAR(255),
    txs TEXT[],
    num_txs INT
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(255),
    height BIGINT,
    timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transaction_events (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id),
    event_type VARCHAR(255),
    attributes JSONB
);"

sudo -u postgres psql -d ${DB_NAME} -c "${TABLES_SQL}"

echo "Database setup complete."
