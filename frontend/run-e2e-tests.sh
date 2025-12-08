#!/bin/bash

# E2E Test Runner Script
# This script ensures both backend and frontend are running before executing E2E tests

echo "🚀 Starting E2E Test Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${YELLOW}Checking if backend is running on http://localhost:5000...${NC}"
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Please start the backend server:"
    echo "  cd backend && npm run dev"
    exit 1
fi

# Check if frontend is running
echo -e "${YELLOW}Checking if frontend is running on http://localhost:3001...${NC}"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not running${NC}"
    echo "Please start the frontend server:"
    echo "  cd frontend && npm run dev"
    exit 1
fi

echo -e "${GREEN}All services are running!${NC}"
echo -e "${YELLOW}Starting Cypress E2E tests...${NC}"

# Run Cypress tests
npm run e2e

