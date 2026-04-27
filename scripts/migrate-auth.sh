#!/bin/bash

# Migration script for authentication and auto-detection features
# This script runs SQL migrations directly using psql

echo "🔄 Starting database migration for authentication and auto-detection..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env.local"
else
    echo "⚠️  Warning: .env.local not found"
fi

# Set defaults if not set
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-aria_postmortem}
POSTGRES_USER=${POSTGRES_USER:-postgres}

echo ""
echo "Database configuration:"
echo "  Host: $POSTGRES_HOST"
echo "  Port: $POSTGRES_PORT"
echo "  Database: $POSTGRES_DB"
echo "  User: $POSTGRES_USER"
echo ""

# Test connection
echo "Testing database connection..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT NOW();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed!"
    echo "Please check your database credentials in .env.local"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Run migration
echo "Running migration..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -f lib/db/auth-schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Created/Updated tables:"
    echo "  - users"
    echo "  - sessions"
    echo "  - audit_logs"
    echo "  - postmortem_comments"
    echo ""
    echo "Updated tables:"
    echo "  - incidents (added auto-detection columns)"
    echo "  - slack_messages (added auto-detection columns)"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    exit 1
fi
