#!/bin/bash

# healthcheck.sh - Health check script for Qwen Code autonomous agent

# Check if the main processes are running
if pgrep -f "node.*telegram-bot" > /dev/null && pgrep -f "qwen.*--non-interactive" > /dev/null; then
  echo "Health check passed: All processes are running"
  exit 0
else
  echo "Health check failed: Required processes are not running"
  exit 1
fi