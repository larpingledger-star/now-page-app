#!/bin/bash
set -e

echo "=========================================="
echo "  Now Page - Cloudflare Deployment Script"
echo "=========================================="
echo ""

# Step 1: Check wrangler login
echo "[1/7] Checking wrangler login..."
if ! npx wrangler whoami 2>/dev/null; then
    echo "You need to log in first."
    npx wrangler login
fi
echo ""

# Step 2: Create D1 Database
echo "[2/7] Creating D1 Database..."
DB_OUTPUT=$(npx wrangler d1 create now-page-db 2>&1)
echo "$DB_OUTPUT"

# Extract database_id from output
DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || echo "")
if [ -z "$DB_ID" ]; then
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'databaseId: \K\S+' || echo "")
fi

if [ -z "$DB_ID" ]; then
    echo "ERROR: Could not extract database_id. Please update wrangler.toml manually."
    echo "Look for the database_id in the output above."
    exit 1
fi
echo "Database ID: $DB_ID"

# Update wrangler.toml with actual database ID
sed -i "s/PLACEHOLDER_DB_ID/$DB_ID/" wrangler.toml
echo "Updated wrangler.toml with database ID"
echo ""

# Step 3: Run database migrations
echo "[3/7] Running database migrations..."
npx wrangler d1 execute now-page-db --file=worker/schema.sql --remote
echo ""

# Step 4: Create R2 Bucket
echo "[4/7] Creating R2 Bucket..."
npx wrangler r2 bucket create now-page-uploads 2>&1 || echo "Bucket may already exist"
echo ""

# Step 5: Generate JWT Secret
echo "[5/7] Generating JWT Secret..."
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | xxd -p | tr -d '\n' | head -c 64)
echo "Generated JWT Secret: ${JWT_SECRET:0:8}..."

# Update wrangler.toml with JWT secret
sed -i "s/CHANGE_ME_BEFORE_DEPLOY/$JWT_SECRET/" wrangler.toml
echo "Updated wrangler.toml with JWT secret"
echo ""

# Step 6: Deploy Worker API
echo "[6/7] Deploying Worker API..."
npx wrangler deploy
echo ""

# Get the worker URL
ACCOUNT_ID=$(npx wrangler whoami 2>&1 | grep -oP 'Account ID\s+│\s+\K\S+' || echo "YOUR_SUBDOMAIN")
WORKER_URL="https://now-page-api.YOUR_SUBDOMAIN.workers.dev"
echo "Worker deployed at: $WORKER_URL"
echo ""

# Step 7: Deploy Frontend to Cloudflare Pages
echo "[7/7] Deploying Frontend to Cloudflare Pages..."
echo "Note: Set VITE_API_URL to your worker URL when configuring Pages"
echo "  VITE_API_URL=$WORKER_URL"
npx wrangler pages deploy dist --project-name=now-page
echo ""

echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to Cloudflare Dashboard > Pages > now-page > Settings > Environment variables"
echo "2. Add VITE_API_URL = $WORKER_URL"
echo "3. Redeploy the Pages project to pick up the env var"
echo ""
echo "To connect your custom domain:"
echo "  1. Go to Cloudflare Dashboard > Pages > now-page > Custom domains"
echo "  2. Add your domain"
echo ""
echo "To register your first admin user:"
echo "  curl -X POST $WORKER_URL/api/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}'"
echo ""
