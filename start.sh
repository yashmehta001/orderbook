#!/bin/sh

set -e

echo "🚀 Starting application..."

# Run DB migrations (no need to rebuild here)
echo "🔄 Running migrations..."
npm run migrations

# Start app
echo "🎉 Starting NestJS..."
exec npm run start:prod
