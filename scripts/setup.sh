#!/bin/bash

#  Technical Assessment - Complete Setup Script
# This script sets up the entire project environment in one run

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if service is running
service_running() {
    pgrep -f "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to create database if it doesn't exist
create_database() {
    local db_name=$1
    local db_url=$2
    
    print_status "Creating database: $db_name"
    
    # Extract database name from URL
    local db_name_from_url=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\)$/\1/p')
    
    if createdb "$db_name_from_url" 2>/dev/null; then
        print_success "Database '$db_name_from_url' created successfully"
    else
        print_warning "Database '$db_name_from_url' already exists or creation failed"
    fi
}

# Main setup function
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Technical Assessment Setup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check for required tools
    print_status "Checking required tools..."
    
    local missing_tools=()
    
    if ! command_exists node; then
        missing_tools+=("Node.js")
    fi
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if ! command_exists psql; then
        missing_tools+=("PostgreSQL")
    fi
    
    if ! command_exists redis-server; then
        missing_tools+=("Redis")
    fi

    # Create .env file if it doesn't exist
    # THIS IS TO KEEP IT SIMPLE FOR THE ASSESSMENT
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cp .env.example .env
        print_success ".env file created"
        echo ""
    else
        print_success ".env file already exists"
        echo ""
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo ""
        echo "Please install the missing tools:"
        echo "  - Node.js: https://nodejs.org/"
        echo "  - PostgreSQL: brew install postgresql"
        echo "  - Redis: brew install redis"
        echo ""
        exit 1
    fi
    
    print_success "All required tools are available"
    echo ""
    
    # Start PostgreSQL if not running
    print_status "Starting PostgreSQL..."
    if ! service_running postgres; then
        if command_exists brew; then
            brew services start postgresql
        else
            print_warning "PostgreSQL not running. Please start it manually:"
            echo "  brew services start postgresql"
        fi
    else
        print_success "PostgreSQL is already running"
    fi
    
    # Start Redis if not running
    print_status "Starting Redis..."
    if ! service_running redis-server; then
        if command_exists brew; then
            brew services start redis
        else
            print_warning "Redis not running. Please start it manually:"
            echo "  brew services start redis"
        fi
    else
        print_success "Redis is already running"
    fi
    
    # Wait for services to be ready
    wait_for_service "PostgreSQL" 5432
    wait_for_service "Redis" 6379
    echo ""
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Dependencies installed"
    echo ""
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
    echo ""
    
    # Create Test databases
    print_status "Setting up databases..."
    create_database "Test Database" "postgresql://localhost:5432/taskflow_test"
    echo ""
    
    # Run migrations
    print_status "Running database migrations..."
    npx prisma migrate deploy
    print_success "Migrations completed"
    echo ""
    
    # Seed test data
    print_status "Seeding test data..."
    node scripts/seed-test-data.js
    print_success "Test data seeded"
    echo ""
    
    # Build the project
    print_status "Building the project..."
    npm run build
    print_success "Project built successfully"
    echo ""
    
    # Run tests to verify everything works
    print_status "Running tests to verify setup..."
    npm run test:unit
    npm run test:integration
    print_success "All tests passed!"
    echo ""
    
    # Test MCP server
    print_status "Testing MCP server..."
    timeout 10s node scripts/test-mcp-unified.js || {
        print_warning "MCP test timed out (this is normal if API server isn't running)"
    }
    echo ""
    
    # Create Test databases
    print_status "Setting up databases..."
    create_database "Main Database" "postgresql://localhost:5432/taskflow"
    echo ""
    
    # Run migrations
    print_status "Seeding test data..."
    node scripts/seed-test-data.js
    print_success "Test data seeded"
    echo ""

    # Final verification
    print_status "Performing final verification..."
    
    # Check if everything is working
    if npm run test:verify-env >/dev/null 2>&1; then
        print_success "Environment verification passed"
    else
        print_warning "Environment verification failed - check the logs above"
    fi
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  Setup Complete! 🎉${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the API server:"
    echo "   npm run dev"
    echo ""
    echo "2. In another terminal, test the MCP server:"
    echo "   npm run mcp:test"
    echo ""
    echo "3. For interactive MCP testing:"
    echo "   npm run mcp:inspector"
    echo ""
    echo "4. View the API documentation:"
    echo "   http://localhost:3000/api-docs"
    echo ""
    echo "5. Open Prisma Studio to view data:"
    echo "   npm run prisma:studio"
    echo ""
    echo "Project is ready for the  assessment! 🚀"
    echo ""
}

# Run the setup
main "$@" 