#!/bin/bash

# autonomous-startup.sh - Startup script for autonomous Qwen Code instance

set -e

echo "Starting Qwen Code autonomous agent..."

# Check if repository URL is provided
if [ -z "$REPO_URL" ]; then
  echo "ERROR: REPO_URL environment variable is required"
  exit 1
fi

# Clone the repository if directory is empty
if [ -z "$(ls -A /home/node/workspace)" ] || [ ! -d "/home/node/workspace/.git" ]; then
  echo "Cloning repository: $REPO_URL"
  rm -rf /home/node/workspace/* /home/node/workspace/.* 2>/dev/null || true
  git clone "$REPO_URL" /home/node/workspace
else
  echo "Repository already exists in workspace"
fi

# Set up git identity if provided
if [ -n "$GIT_USER_NAME" ] && [ -n "$GIT_USER_EMAIL" ]; then
  git config --global user.name "$GIT_USER_NAME"
  git config --global user.email "$GIT_USER_EMAIL"
fi

# Configure Qwen Code for autonomous mode
echo "Configuring Qwen Code for autonomous mode..."

# Set up API keys if provided
if [ -n "$GEMINI_API_KEY" ]; then
  echo "Setting up Qwen Code with Qwen API key"
  # The API key will be available in the environment
elif [ -n "$QWEN_OAUTH_TOKEN" ]; then
  echo "Setting up Qwen Code with pre-configured OAuth token"
  # The OAuth token will be available in the environment
else
  echo "No API key or OAuth token provided. Will use interactive OAuth flow if needed."
fi

# Create .qwen directory for communication with Telegram bot
mkdir -p /home/node/workspace/.qwen

# Start Telegram bot in background if token is provided
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Starting Telegram bot..."
  node /home/node/telegram-bot.js &
  echo "Telegram bot started"
  
  # Notify that the agent is starting up
  echo "Qwen Code autonomous agent is starting up..." > /home/node/workspace/.qwen/agent_output.txt
fi

# Change to workspace directory
cd /home/node/workspace

# Ensure QWEN.md is in place for the agent's custom instructions
if [ ! -f "QWEN.md" ]; then
  # Copy from the default location if it doesn't exist
  if [ -f "/home/node/QWEN.md" ]; then
    echo "Copying QWEN.md to workspace"
    cp /home/node/QWEN.md QWEN.md
  else
    echo "Warning: QWEN.md not found"
  fi
else
  echo "QWEN.md already exists in workspace"
fi

# Show the agent its instructions
echo "Agent instructions:"
echo "=================="
if [ -f "QWEN.md" ]; then
  head -10 QWEN.md
  echo "..."
else
  echo "No QWEN.md file found"
fi
echo ""

# Show authentication information
if [ -n "$GEMINI_API_KEY" ]; then
  echo "Authentication: Using Qwen API key"
elif [ -n "$QWEN_OAUTH_TOKEN" ]; then
  echo "Authentication: Using pre-configured OAuth token"
else
  echo "Authentication: Will use interactive OAuth flow when needed"
  echo "Note: For OAuth authentication, you'll need to respond to Telegram messages with 'done' after completing the browser authentication."
fi

# Start Qwen Code in autonomous mode
echo "Starting Qwen Code in autonomous mode..."
exec qwen --prompt "You are an autonomous agent working on the repository in the current directory. Review the codebase and identify tasks that need to be completed. Follow the instructions in QWEN.md. Only request human input when absolutely necessary."