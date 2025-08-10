#!/bin/bash

# test-oauth-communication.sh - Test script for OAuth communication

echo "Testing OAuth communication..."

# Use current directory or default to /home/node/workspace
WORKSPACE_DIR="${1:-/home/node/workspace}"
QWEN_DIR="$WORKSPACE_DIR/.qwen"

# Create .qwen directory if it doesn't exist
mkdir -p "$QWEN_DIR"

# Test OAuth request
OAUTH_REQUEST='{
  "verification_uri": "https://chat.qwen.ai/api/v1/oauth2/device",
  "user_code": "ABC123",
  "verification_uri_complete": "https://chat.qwen.ai/api/v1/oauth2/device?user_code=ABC123",
  "message": "Please visit https://chat.qwen.ai/api/v1/oauth2/device and enter the code: ABC123\n\nOr visit this direct link: https://chat.qwen.ai/api/v1/oauth2/device?user_code=ABC123"
}'
echo "$OAUTH_REQUEST" > "$QWEN_DIR/oauth_request.txt"
echo "Sent test OAuth request"

# Test OAuth response
OAUTH_RESPONSE='{
  "status": "completed",
  "message": "User confirmed OAuth completion"
}'
echo "$OAUTH_RESPONSE" > "$QWEN_DIR/oauth_response.txt"
echo "Sent test OAuth response"

echo "OAuth communication test completed."