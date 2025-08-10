#!/bin/bash

# simulate-agent.sh - Simulate the autonomous agent environment for testing

echo "Starting Qwen Code autonomous agent simulation..."

# Create simulation directory
SIM_DIR="/tmp/qwen-autonomous-sim"
mkdir -p "$SIM_DIR/.qwen"
echo "Created simulation directory: $SIM_DIR"

# Copy necessary scripts to simulation directory
cp /home/paul/qwen-code/scripts/telegram-bot.js "$SIM_DIR/"
cp /home/paul/qwen-code/scripts/autonomous-agent-interface.js "$SIM_DIR/"
cp /home/paul/qwen-code/scripts/test-oauth-communication.sh "$SIM_DIR/"

# Show instructions
echo ""
echo "Simulation environment created at: $SIM_DIR"
echo ""
echo "To test the OAuth functionality:"
echo "1. Install dependencies:"
echo "   cd $SIM_DIR && npm install node-telegram-bot-api"
echo ""
echo "2. Set your Telegram bot token:"
echo "   export TELEGRAM_BOT_TOKEN=your-telegram-bot-token"
echo ""
echo "3. Start the Telegram bot:"
echo "   cd $SIM_DIR && node telegram-bot.js"
echo ""
echo "4. In another terminal, run the OAuth test:"
echo "   cd $SIM_DIR && node -e '"
echo "   const { AutonomousAgentInterface } = require(\"./autonomous-agent-interface.js\");"
echo "   const agent = new AutonomousAgentInterface();"
echo "   const deviceAuth = {"
echo "     verification_uri: \"https://chat.qwen.ai/api/v1/oauth2/device\","
echo "     user_code: \"ABC123\","
echo "     verification_uri_complete: \"https://chat.qwen.ai/api/v1/oauth2/device?user_code=ABC123\""
echo "   };"
echo "   agent.requestOAuthAuthentication(deviceAuth).then(result => console.log(\"OAuth result:\", result));"
echo "   '"
echo ""
echo "5. Interact with your Telegram bot to complete the OAuth flow"
echo ""
echo "To test the communication files directly:"
echo "   cd $SIM_DIR && ./test-oauth-communication.sh $SIM_DIR"
echo ""