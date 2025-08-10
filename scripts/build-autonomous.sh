#!/bin/bash

# build-autonomous.sh - Script to build and deploy Qwen Code autonomous agent

set -e

echo "Building Qwen Code autonomous agent..."

# Check if required environment variables are set
if [ -z "$REPO_URL" ]; then
  echo "ERROR: REPO_URL environment variable is required"
  echo "Please set it to the Git repository URL you want the agent to work on"
  echo "Example: export REPO_URL=https://github.com/your-username/your-repo.git"
  exit 1
fi

# Build the autonomous agent image
echo "Building Docker image..."
docker build -f Dockerfile.autonomous -t qwen-code-autonomous .

# Create .env file for docker-compose if it doesn't exist
if [ ! -f .env.autonomous ]; then
  echo "Creating .env.autonomous file..."
  cat > .env.autonomous << EOF
# Qwen Code Autonomous Agent Configuration

# Required - URL of the repository to clone
REPO_URL=$REPO_URL

# Optional - Git user configuration
GIT_USER_NAME=Qwen Code Agent
GIT_USER_EMAIL=qwen-code-agent@example.com

# Required - Qwen API key
# GEMINI_API_KEY=your-api-key-here

# Optional - Telegram bot token for notifications
# TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here

# Sandbox configuration
GEMINI_SANDBOX=true
EOF

  echo "Created .env.autonomous file. Please edit it to add your API key and other configuration."
fi

echo "Build complete!"
echo ""
echo "To deploy the autonomous agent:"
echo "1. Edit .env.autonomous to add your GEMINI_API_KEY and other settings"
echo "2. Run: docker-compose -f docker-compose.autonomous.yml --env-file .env.autonomous up -d"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.autonomous.yml --env-file .env.autonomous logs -f"