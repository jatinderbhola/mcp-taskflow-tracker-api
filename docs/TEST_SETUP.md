# Test Database Setup

## 🚨 Important: Test Database Configuration

The tests are configured to use a **separate test database** to prevent accidentally deleting data from your main database.

## 📊 Database Configuration

### Option 1: Use Environment Variables (Recommended)

Create a `.env` file in your project root with:

```bash
# Main database
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow"

# Test database (separate from main)
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/taskflow_test"

# Redis configuration
REDIS_URL="redis://localhost:6379/0"
TEST_REDIS_URL="redis://localhost:6379/1"
```

### Option 2: Automatic Test Database (Fallback)

If `TEST_DATABASE_URL` is not set, the system will automatically append `_test` to your main database URL:

- Main: `postgresql://localhost:5432/taskflow`
- Test: `postgresql://localhost:5432/taskflow_test`

## 🗄️ Setting Up Test Database

### 1. Create Test Database

```bash
# Create test database
createdb taskflow_test

# Or if using the same database with different schema
psql -d taskflow -c "CREATE DATABASE taskflow_test;"
```

### 2. Run Migrations on Test Database

```bash
# Set test database URL
export TEST_DATABASE_URL="postgresql://localhost:5432/taskflow_test"

# Run migrations on test database
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 3. Verify Configuration

Run tests to verify the setup:

```bash
npm run test:unit
```

You should see output like:
```
🧪 Test Environment Variables:
📊 TEST_DATABASE_URL: postgresql://localhost:5432/taskflow_test
🔴 TEST_REDIS_URL: redis://localhost:6379/1
🌍 NODE_ENV: test
```

## 🔧 Test Configuration Files

- `src/test/config.ts` - Test-specific configuration
- `src/test/env-setup.ts` - Environment variable setup
- `src/test/setup.ts` - Jest test setup

## 🛡️ Safety Features

1. **Separate Database**: Tests use `taskflow_test` instead of `taskflow`
2. **Separate Redis**: Tests use database `1` instead of `0`
3. **Environment Detection**: `NODE_ENV=test` prevents accidental production data deletion
4. **Clear Logging**: Shows which database is being used

## 🚨 Troubleshooting

### Error: "Database does not exist"
```bash
# Create the test database
createdb taskflow_test
```

### Error: "Connection refused"
```bash
# Start PostgreSQL
brew services start postgresql

# Start Redis
brew services start redis
```

### Error: "Permission denied"
```bash
# Check PostgreSQL permissions
psql -l

# Create user if needed
createuser -s your_username
```

## 📝 Environment Variables Reference

| Variable | Purpose | Default |
|----------|---------|---------|
| `TEST_DATABASE_URL` | Test database connection | `{DATABASE_URL}_test` |
| `TEST_REDIS_URL` | Test Redis connection | `redis://localhost:6379/1` |
| `NODE_ENV` | Environment mode | `test` (set automatically) |
| `LOG_LEVEL` | Logging level | `error` (set automatically) |

## ✅ Verification

To verify your test setup is working correctly:

1. **Check Database Separation**:
   ```bash
   # Main database should have your data
   psql -d taskflow -c "SELECT COUNT(*) FROM projects;"
   
   # Test database should be empty
   psql -d taskflow_test -c "SELECT COUNT(*) FROM projects;"
   ```

2. **Run Tests**:
   ```bash
   npm run test:unit
   ```

3. **Verify No Data Loss**:
   ```bash
   # Main database should still have your data
   psql -d taskflow -c "SELECT COUNT(*) FROM projects;"
   ```

## 🔄 Reset Test Database

If you need to reset the test database:

```bash
# Drop and recreate test database
dropdb taskflow_test
createdb taskflow_test

# Run migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma
``` 