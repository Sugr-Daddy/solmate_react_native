#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Solmate Full Stack Application...${NC}"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}⏹️  Stopping services...${NC}"
    # Kill all background jobs
    jobs -p | xargs -r kill
    exit 0
}

# Trap CTRL+C and cleanup
trap cleanup SIGINT

# Start the API server
echo -e "${GREEN}📡 Starting API Server...${NC}"
cd server
node index.js &
API_PID=$!

# Wait a moment for server to start
sleep 3

# Check if API server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ API Server running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ API Server failed to start${NC}"
    exit 1
fi

# Go back to main directory
cd ..

# Start React Native app
echo -e "${GREEN}📱 Starting React Native App...${NC}"
npm start &
RN_PID=$!

echo -e "${BLUE}🎉 Both services are starting up!${NC}"
echo -e "${YELLOW}📍 API Server: http://localhost:3001${NC}"
echo -e "${YELLOW}📍 React Native: http://localhost:8081${NC}"
echo -e "${YELLOW}📍 Press Ctrl+C to stop all services${NC}"

# Wait for background processes
wait
