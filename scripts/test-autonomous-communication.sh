#!/bin/bash

# test-autonomous-communication.sh - Test script for autonomous agent communication

echo "Testing autonomous agent communication..."

# Use current directory or default to /home/node/workspace
WORKSPACE_DIR="${1:-/home/node/workspace}"
QWEN_DIR="$WORKSPACE_DIR/.qwen"

# Create .qwen directory if it doesn't exist
mkdir -p "$QWEN_DIR"

# Test sending output
echo "This is a test message from the autonomous agent" > "$QWEN_DIR/agent_output.txt"
echo "Sent test output message"

# Test requesting input
echo "This is a test input request from the autonomous agent" > "$QWEN_DIR/input_request.txt"
echo "Sent test input request"

echo "Test completed. Check if the Telegram bot received the messages."