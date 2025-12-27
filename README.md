## CF Worker

Cloudflare Worker with Hono framework, D1 database, and GitHub Actions CI/CD.

## Setup for New Cloudflare Account

### 1. Create API Token

Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > My Profile > API Tokens > Create Token

Required permissions:
- **Account > D1 > Edit**
- **Account > Account Settings > Read**
- **Account > Workers Scripts > Edit**
- **User > User Details > Read**

Copy the generated token.

### 2. Add Token to GitHub Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions > New repository secret

- Name: `CLOUDFLARE_API_TOKEN`
- Value: Your API token from step 1

### 3. Create D1 Databases

Create two D1 databases (staging and production):

```bash
# Set your API token
export CLOUDFLARE_API_TOKEN="your-api-token"

# Create staging database
npx wrangler d1 create tensorcode-db-stag

# Create production database
npx wrangler d1 create tensorcode-db-prod
```

Copy the `database_id` from each command output.

### 4. Update Wrangler Config Files

Update `wrangler.toml` (staging):
```toml
name = "tensorcode-cf-worker-stag"
main = "src/index.ts"
compatibility_date = "2024-12-01"
account_id = "your-account-id"

[[d1_databases]]
binding = "DB"
database_name = "tensorcode-db-stag"
database_id = "your-staging-database-id"
```

Update `wrangler.prod.toml` (production):
```toml
name = "tensorcode-cf-worker-prod"
main = "src/index.ts"
compatibility_date = "2024-12-01"
account_id = "your-account-id"

[[d1_databases]]
binding = "DB"
database_name = "tensorcode-db-prod"
database_id = "your-production-database-id"
```

### 5. Import Database Backup

If you have a SQL backup file:

```bash
# Import to staging
npx wrangler d1 execute tensorcode-db-stag --remote --file=tensorcode-db-backup.sql -y

# Import to production
npx wrangler d1 execute tensorcode-db-prod --remote --file=tensorcode-db-backup.sql -y
```

### 6. Add CF-Token Secret

Add the authentication token for API endpoints. This is a **different token** from the Cloudflare API token - generate a custom secret:

```bash
# Generate a random token
openssl rand -hex 32
```

Then add it as a wrangler secret:

```bash
# For staging
npx wrangler secret put CLOUDFLARE_API_TOKEN --config wrangler.toml

# For production
npx wrangler secret put CLOUDFLARE_API_TOKEN --config wrangler.prod.toml
```

Enter your generated secret token when prompted. This token is used in the `CF-Token` header for API authentication.

## Deployment

- Push to `dev` branch: Deploys to staging
- Push to `main` branch: Deploys to production

## API Authentication

All endpoints require the `CF-Token` header:

```
CF-Token: your-secret-token
```
