#!/bin/bash

# This script automates the process of rebuilding the database environment.
# It regenerates the Prisma client, force-pushes the schema to the database,
# and then seeds the database with initial data.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting database rebuild..."

# 1. Regenerate Prisma Client to ensure types are up-to-date
echo "Regenerating Prisma Client..."
npx prisma generate

# 2. Force a push of the schema to the database.
# The --force-reset flag will drop the database if it exists, ensuring a clean state.
echo "Forcing database push and reset..."
npx prisma db push --force-reset

# 3. Seed the database with initial data.
echo "Seeding the database..."
npm run seed

echo "Database rebuild complete!"