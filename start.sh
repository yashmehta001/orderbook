set -e

echo "🚀 Starting application initialization..."

# Wait for database
echo "⏳ Waiting for database to be ready..."
until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
    echo "Database not ready, waiting..."
    sleep 2
done
echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npm run typeorm:run-migration
echo "✅ Migrations completed!"

# Start application  
echo "🎉 Starting the application..."
exec npm run start:prod