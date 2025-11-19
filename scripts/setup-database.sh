#!/bin/bash

# Database setup script for task management application

echo "Setting up database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one with database configuration."
    exit 1
fi

# Load environment variables
source .env

# Check if database exists, create if not
echo "Checking database connection..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -lqt | cut -d \| -f 1 | grep -qw $DB_NAME
if [ $? -ne 0 ]; then
    echo "Database $DB_NAME not found. Creating..."
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME
fi

# Build the project
echo "Building project..."
npm run build

# Run migrations
echo "Running migrations..."
npm run migration:run

# Run seeds
echo "Running seeds..."
npm run seed:run

echo "Database setup completed successfully!"
echo "Admin login: admin@example.com / Admin123!"
echo "User login: user1@example.com / User123!"