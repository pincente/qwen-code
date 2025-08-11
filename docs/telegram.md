# Telegram Integration

Qwen Code supports switching conversations to Telegram for a more flexible interaction model.

## Setup

1. Create a Telegram bot by talking to [@BotFather](https://t.me/BotFather) on Telegram
2. Copy the bot token you receive
3. Configure your bot token in `.qwen/settings.json`:

```json
{
  "telegram": {
    "botToken": "YOUR_BOT_TOKEN_HERE",
    "enabled": true,
    "allowedUserIds": ["OPTIONAL_LIST_OF_USER_IDS"]
  }
}
```

## Usage

1. Run Qwen Code in your terminal: `qwen`
2. Type `/tg` to switch to Telegram mode
3. Follow the instructions to connect via Telegram
4. Continue your conversation in Telegram while seeing status updates in your terminal

## Features

- Seamless conversation switching between terminal and Telegram
- Persistent session state across platforms
- File transfer capabilities between terminal and Telegram
- Multi-user support with access control

## Limitations

This is a prototype implementation. Full features will include:

- Complete message bridging between platforms
- Rich media support (images, documents)
- Advanced conversation context management
- Real-time synchronization between platforms

## Security

- Only specified user IDs can interact with your bot (if configured)
- All conversation data remains private to your bot
- No data is shared with third parties
