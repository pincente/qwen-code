# Qwen Code Autonomous Agent

This deployment package allows you to run Qwen Code as an autonomous agent that can work on a Git repository with minimal human intervention. When the agent requires input, it can notify you via Telegram.

## Features

- Clones a user-specified Git repository on startup
- Runs Qwen Code in autonomous mode
- Telegram integration for notifications and user input
- OAuth authentication support for Qwen
- Persistent data storage
- Docker-based sandboxing for security
- Health checks for monitoring
- Custom operating instructions via QWEN.md

## Custom Operating Instructions

The autonomous agent uses a special file called `QWEN.md` in the workspace directory to provide custom operating instructions. This file contains specific guidance on how the agent should behave when working on repositories. You can customize this file by modifying `QWEN.deploy.md` before building the Docker image.

Key aspects of the custom instructions:
- Primary responsibilities of the agent
- Guidelines for decision making and code quality
- Communication protocols for human interaction
- OAuth authentication procedures
- Git workflow expectations
- Environment-specific information

## OAuth Authentication

The autonomous agent supports Qwen OAuth authentication through Telegram. When OAuth is required:

1. The agent will send a notification with a URL and user code
2. You'll need to visit the URL and enter the provided code
3. Complete the authentication process in your browser
4. Return to the Telegram chat and send "done" to confirm completion
5. The agent will check if authentication was successful

To use OAuth authentication:
1. Set `selectedAuthType` to `qwen-oauth` in your settings
2. Do not set a pre-configured `QWEN_OAUTH_TOKEN` if you want to use the interactive flow
3. The agent will request authentication through Telegram when needed

Alternatively, you can use a pre-configured token by setting the `QWEN_OAUTH_TOKEN` environment variable.

## Prerequisites

1. Docker and Docker Compose installed
2. A Git repository you want the agent to work on
3. (Optional) A Telegram bot token for notifications

## Quick Start

1. Clone this repository:
   ```bash
   git clone <this-repo-url>
   cd qwen-code
   ```

2. Set required environment variables:
   ```bash
   export REPO_URL=https://github.com/your-username/your-repo.git
   export GEMINI_API_KEY=your-api-key
   export TELEGRAM_BOT_TOKEN=your-telegram-bot-token  # Optional
   ```

3. Build and run the agent:
   ```bash
   make -f Makefile.autonomous build
   make -f Makefile.autonomous run
   ```

## Setup

### Using Make (Recommended)

1. Set the required environment variables:
   ```bash
   export REPO_URL=https://github.com/your-username/your-repo.git
   export GEMINI_API_KEY=your-api-key
   export TELEGRAM_BOT_TOKEN=your-telegram-bot-token  # Optional
   ```

2. Build the image:
   ```bash
   make -f Makefile.autonomous build
   ```

3. Run the agent:
   ```bash
   make -f Makefile.autonomous run
   ```

4. View logs:
   ```bash
   make -f Makefile.autonomous logs
   ```

### Using Docker Compose Directly

1. Build the autonomous agent image:
   ```bash
   docker build -f Dockerfile.autonomous -t qwen-code-autonomous .
   ```

2. Configure your environment by editing the `docker-compose.autonomous.yml` file or setting environment variables:
   ```bash
   export REPO_URL=https://github.com/your-username/your-repo.git
   export GEMINI_API_KEY=your-api-key
   export TELEGRAM_BOT_TOKEN=your-telegram-bot-token  # Optional
   ```

3. Run the agent:
   ```bash
   docker-compose -f docker-compose.autonomous.yml up -d
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REPO_URL` | Yes | URL of the Git repository for the agent to work on |
| `GEMINI_API_KEY` | Yes | Your Qwen API key |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token for notifications |
| `GIT_USER_NAME` | No | Git username for commits (defaults to "Qwen Code Agent") |
| `GIT_USER_EMAIL` | No | Git email for commits (defaults to "qwen-code-agent@example.com") |

## Telegram Integration

To set up Telegram notifications:

1. Create a bot with BotFather on Telegram
2. Copy the bot token
3. Set the `TELEGRAM_BOT_TOKEN` environment variable
4. Start a chat with your bot and send `/start`
5. The bot will notify you when the agent needs input or has output to share

When the agent needs input, the Telegram bot will send you a message with the request. Simply reply to that message with your input, and it will be sent to the agent.

## Data Persistence

The agent's configuration and data are stored in a Docker volume named `qwen-code-data`. This ensures that your settings and conversation history persist across container restarts.

## Health Checks

The container includes a health check that verifies the Telegram bot and Qwen Code processes are running. You can check the health status with:

```bash
docker-compose -f docker-compose.autonomous.yml ps
```

## Updating

To update the agent:

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Rebuild the image:
   ```bash
   make -f Makefile.autonomous build
   ```

3. Restart the container:
   ```bash
   make -f Makefile.autonomous run
   ```

## Troubleshooting

- Check container logs:
  ```bash
  make -f Makefile.autonomous logs
  ```
  or
  ```bash
  docker-compose -f docker-compose.autonomous.yml logs
  ```

- Access the container shell:
  ```bash
  docker-compose -f docker-compose.autonomous.yml exec qwen-code-autonomous bash
  ```

- Test the communication system:
  ```bash
  make -f Makefile.autonomous test
  ```

## Customizing Operating Instructions

To customize the operating instructions for the autonomous agent:

1. Edit `QWEN.deploy.md` before building the Docker image
2. Rebuild the image with your changes:
   ```bash
   make -f Makefile.autonomous build
   ```
3. The updated instructions will be copied to `QWEN.md` in the workspace when the container starts

You can also use the helper script `scripts/customize-instructions.sh` to guide you through the customization process.

This allows you to tailor the agent's behavior for specific types of projects or workflows.

## Security Notes

- The agent runs in a Docker sandbox by default
- API keys are stored as environment variables
- The agent has access only to the cloned repository and its own configuration data
- Communication with the Telegram bot is encrypted through Telegram's API

## Development

For development, you can install the required dependencies locally:

```bash
make -f Makefile.autonomous dev-setup
```

This will install the `node-telegram-bot-api` package needed for the Telegram bot.