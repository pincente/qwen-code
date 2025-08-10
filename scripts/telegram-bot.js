#!/usr/bin/env node

// telegram-bot.js - Telegram bot for Qwen Code autonomous agent

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Get token from environment variable
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store chat IDs for sending notifications
let chatIds = new Set();

// Create .qwen directory if it doesn't exist
const qwenDir = '/home/node/workspace/.qwen';
if (!fs.existsSync(qwenDir)) {
  fs.mkdirSync(qwenDir, { recursive: true });
}

// Paths for communication
const userInputPath = path.join(qwenDir, 'user_input.txt');
const agentOutputPath = path.join(qwenDir, 'agent_output.txt');
const agentInputRequestPath = path.join(qwenDir, 'input_request.txt');
const oauthRequestPath = path.join(qwenDir, 'oauth_request.txt');
const oauthResponsePath = path.join(qwenDir, 'oauth_response.txt');

console.log('Telegram bot started');

// Listen for any kind of message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  chatIds.add(chatId);
  
  console.log(`Received message from ${chatId}: ${msg.text}`);
  
  // Handle commands
  if (msg.text === '/start') {
    bot.sendMessage(chatId, 'Welcome to Qwen Code Autonomous Agent! I will notify you when the agent needs input.');
    return;
  }
  
  if (msg.text === '/status') {
    bot.sendMessage(chatId, 'Qwen Code autonomous agent is running.');
    return;
  }
  
  // Check if we're waiting for OAuth response
  if (fs.existsSync(oauthRequestPath)) {
    // If the message is "done" or "completed", assume OAuth is complete
    if (msg.text.toLowerCase() === 'done' || msg.text.toLowerCase() === 'completed') {
      // Write OAuth completion response
      const oauthResponse = {
        status: 'completed',
        message: 'User confirmed OAuth completion'
      };
      fs.writeFileSync(oauthResponsePath, JSON.stringify(oauthResponse), 'utf8');
      
      // Remove OAuth request file
      if (fs.existsSync(oauthRequestPath)) {
        fs.unlinkSync(oauthRequestPath);
      }
      
      bot.sendMessage(chatId, 'Thank you! I will check if the OAuth authentication was successful.');
      return;
    } else {
      bot.sendMessage(chatId, 'I am currently waiting for OAuth authentication. Please complete the authentication process and reply with "done" when finished.');
      return;
    }
  }
  
  // Save user input for Qwen Code
  fs.writeFileSync(userInputPath, msg.text, 'utf8');
  // Remove input request flag
  if (fs.existsSync(agentInputRequestPath)) {
    fs.unlinkSync(agentInputRequestPath);
  }
  bot.sendMessage(chatId, 'Your input has been sent to the agent.');
});

// Function to send notifications to all chats
function notifyAllChats(message) {
  for (const chatId of chatIds) {
    try {
      bot.sendMessage(chatId, message);
    } catch (err) {
      console.error(`Failed to send message to ${chatId}:`, err);
    }
  }
}

// Monitor for agent output and input requests
setInterval(() => {
  // Check for agent output
  if (fs.existsSync(agentOutputPath)) {
    try {
      const output = fs.readFileSync(agentOutputPath, 'utf8');
      if (output.trim()) {
        notifyAllChats("Agent output:\n```\n" + output + "\n```");
        // Clear the output file
        fs.writeFileSync(agentOutputPath, '', 'utf8');
      }
    } catch (err) {
      console.error('Error reading agent output:', err);
    }
  }
  
  // Check for input requests
  if (fs.existsSync(agentInputRequestPath)) {
    try {
      const request = fs.readFileSync(agentInputRequestPath, 'utf8');
      if (request.trim()) {
        notifyAllChats(`The agent needs your input:

${request}`);
      }
    } catch (err) {
      console.error('Error reading input request:', err);
    }
  }
  
  // Check for OAuth requests
  if (fs.existsSync(oauthRequestPath)) {
    try {
      const requestContent = fs.readFileSync(oauthRequestPath, 'utf8');
      if (requestContent.trim()) {
        const oauthRequest = JSON.parse(requestContent);
        const message = `🔐 Qwen OAuth Authentication Required

${oauthRequest.message}

Please complete the authentication and reply with "done" when finished.`;
        notifyAllChats(message);
      }
    } catch (err) {
      console.error('Error reading OAuth request:', err);
    }
  }
}, 5000); // Check every 5 seconds

// Notify on startup
setTimeout(() => {
  notifyAllChats('Qwen Code autonomous agent is now running!');
}, 5000);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  notifyAllChats('Qwen Code autonomous agent is shutting down.');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  notifyAllChats('Qwen Code autonomous agent is shutting down.');
  process.exit(0);
});

console.log('Telegram bot is ready to receive messages')