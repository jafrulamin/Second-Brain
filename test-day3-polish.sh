#!/bin/bash
# Day 3 Polish - Test Script
# Tests duplicate prevention, error handling, and UI messages

echo "=========================================="
echo "  DAY 3 POLISH - Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
DOC_ID_WITH_EMBEDDING=1  # Document that's already embedded
DOC_ID_WITHOUT_EMBEDDING=3  # Document that hasn't been embedded yet

echo "Prerequisites:"
echo "  1. Ollama server running: ollama serve"
echo "  2. Dev server running: npm run dev"
echo "  3. Model pulled: ollama pull all-minilm"
echo ""
read -p "Press Enter when ready..."

echo ""
echo "Test 1: Duplicate Prevention (409 Conflict)"
echo "=========================================="
echo "Attempting to embed document $DOC_ID_WITH_EMBEDDING (already embedded)..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/embed" \
  -H "Content-Type: application/json" \
  -d "{\"documentId\": $DOC_ID_WITH_EMBEDDING}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "409" ]; then
  echo -e "${GREEN}✓ PASS${NC}: Got 409 Conflict as expected"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ FAIL${NC}: Expected 409, got $HTTP_STATUS"
  echo "Response: $BODY"
fi

echo ""
echo "Test 2: Success Case (200 OK)"
echo "=========================================="
echo "Attempting to embed document $DOC_ID_WITHOUT_EMBEDDING (not yet embedded)..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/embed" \
  -H "Content-Type: application/json" \
  -d "{\"documentId\": $DOC_ID_WITHOUT_EMBEDDING}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC}: Successfully embedded"
  echo "Response: $BODY"
else
  echo -e "${YELLOW}⚠ WARNING${NC}: Got $HTTP_STATUS (may need to check document exists)"
  echo "Response: $BODY"
fi

echo ""
echo "Test 3: Invalid documentId (400 Bad Request)"
echo "=========================================="
echo "Testing with invalid documentId..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/embed" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "invalid"}')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "400" ]; then
  echo -e "${GREEN}✓ PASS${NC}: Got 400 Bad Request as expected"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ FAIL${NC}: Expected 400, got $HTTP_STATUS"
  echo "Response: $BODY"
fi

echo ""
echo "Test 4: Non-existent Document (404 Not Found)"
echo "=========================================="
echo "Testing with non-existent documentId..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/embed" \
  -H "Content-Type: application/json" \
  -d '{"documentId": 99999}')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "404" ]; then
  echo -e "${GREEN}✓ PASS${NC}: Got 404 Not Found as expected"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ FAIL${NC}: Expected 404, got $HTTP_STATUS"
  echo "Response: $BODY"
fi

echo ""
echo "=========================================="
echo "  Test Suite Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "  1. Check Prisma Studio: npx prisma studio"
echo "  2. Verify chunks/embeddings counts match"
echo "  3. Try embedding in UI and verify messages"

