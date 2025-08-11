/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Telegraf } from 'telegraf';
import { TelegramSettings, TelegramSession, TelegramMessage } from './types.js';
import { Config } from '@qwen-code/qwen-code-core';
import { HistoryItem } from '../ui/types.js';

export class TelegramIntegration {
  private bot: Telegraf | null = null;
  private sessions: Map<string, TelegramSession> = new Map();
  private messageQueue: TelegramMessage[] = [];
  private config: Config;
  private onMessageCallback:
    | ((message: string, userId: string) => void)
    | null = null;

  constructor(config: Config) {
    this.config = config;
  }

  async initialize(settings: TelegramSettings): Promise<boolean> {
    console.log('Telegram initialize called with settings:', settings);
    if (!settings.botToken || !settings.enabled) {
      console.log('Telegram not initialized: botToken or enabled flag missing');
      return false;
    }

    try {
      console.log('Creating Telegraf instance...');
      this.bot = new Telegraf(settings.botToken);
      
      console.log('Setting up bot commands...');
      // Set up bot commands
      this.bot.command('start', (ctx) => {
        console.log('Received /start command from user:', ctx.from?.id);
        ctx.reply(
          'Welcome to Qwen Code! You can now send messages here to interact with the Qwen agent.',
        );
      });

      this.bot.command('help', (ctx) => {
        console.log('Received /help command from user:', ctx.from?.id);
        ctx.reply(
          'Send any message to interact with Qwen Code. Use /disconnect to stop the session.',
        );
      });

      this.bot.command('disconnect', (ctx) => {
        console.log('Received /disconnect command from user:', ctx.from?.id);
        const userId = String(ctx.from?.id);
        if (this.sessions.has(userId)) {
          this.sessions.delete(userId);
          ctx.reply('Disconnected from Qwen Code session.');
        } else {
          ctx.reply('You are not currently connected to a Qwen Code session.');
        }
      });

      console.log('Setting up text message handler...');
      // Handle text messages
      this.bot.on('text', (ctx) => {
        try {
          const userId = String(ctx.from?.id);
          const text = ctx.message.text;
          console.log('Received text message from user:', userId, 'text:', text);

          // If user is not yet connected, establish connection
          if (!this.sessions.has(userId)) {
            console.log('Creating new session for user:', userId);
            this.sessions.set(userId, {
              userId,
              chatId: ctx.chat.id,
              connected: true,
              lastActivity: new Date(),
            });
            ctx.reply(
              'Connected to Qwen Code session! Send /disconnect to end the session.',
            );
          }

          // Store message in queue
          this.messageQueue.push({
            text,
            userId,
            timestamp: new Date(),
          });

          // Notify callback if set
          if (this.onMessageCallback) {
            console.log('Notifying callback for message from user:', userId);
            this.onMessageCallback(text, userId);
          }
        } catch (error) {
          console.error('Error handling Telegram message:', error);
        }
      });

      console.log('Launching Telegram bot...');
      // Start bot with timeout
      const launchPromise = this.bot.launch();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Telegram bot launch timeout')), 10000);
      });
      
      Promise.race([launchPromise, timeoutPromise])
        .then(() => {
          console.log('Telegram bot launched successfully');
        })
        .catch((error) => {
          console.error('Failed to launch Telegram bot:', error);
        });
      
      // Give the bot a moment to start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Telegram bot initialization completed');
      return true;
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
      return false;
    }
  }

  async sendMessageToUser(userId: string, message: string): Promise<void> {
    if (!this.bot) return;

    const session = this.sessions.get(userId);
    if (!session) {
      console.warn(`No session found for user ${userId}`);
      return;
    }

    try {
      await this.bot.telegram.sendMessage(session.chatId, message);
      session.lastActivity = new Date();
    } catch (error) {
      console.error(`Failed to send message to user ${userId}:`, error);
    }
  }

  async sendHistoryToUser(
    userId: string,
    history: HistoryItem[],
  ): Promise<void> {
    if (!this.bot) return;

    const session = this.sessions.get(userId);
    if (!session) {
      console.warn(`No session found for user ${userId}`);
      return;
    }

    try {
      // Format history items for Telegram
      const formattedHistory = history
        .map((item) => {
          switch (item.type) {
            case 'user':
              return `👤 You: ${item.text}`;
            case 'gemini':
              return `🤖 Qwen: ${item.text}`;
            case 'info':
              return `ℹ️ ${item.text}`;
            case 'error':
              return `❌ ${item.text}`;
            default:
              return `${item.text}`;
          }
        })
        .join('\n\n');

      // Split long messages to comply with Telegram limits
      const chunks = this.splitMessageForTelegram(formattedHistory);
      for (const chunk of chunks) {
        await this.bot.telegram.sendMessage(session.chatId, chunk);
      }

      session.lastActivity = new Date();
    } catch (error) {
      console.error(`Failed to send history to user ${userId}:`, error);
    }
  }

  private splitMessageForTelegram(
    message: string,
    maxLength: number = 4096,
  ): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = message.split('\n');
    for (const line of lines) {
      // If adding this line would exceed the limit, push current chunk and start new one
      if (currentChunk.length + line.length + 1 > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = line;
        } else {
          // Line is longer than max length, split it
          const words = line.split(' ');
          let currentLine = '';
          for (const word of words) {
            if (currentLine.length + word.length + 1 > maxLength) {
              if (currentLine) {
                chunks.push(currentLine);
                currentLine = word;
              } else {
                // Word is longer than max length, split it
                while (word.length > maxLength) {
                  chunks.push(word.substring(0, maxLength));
                  const remaining = word.substring(maxLength);
                  if (remaining.length <= maxLength) {
                    currentLine = remaining;
                    break;
                  } else {
                    chunks.push(remaining.substring(0, maxLength));
                    const newRemaining = remaining.substring(maxLength);
                    if (newRemaining.length <= maxLength) {
                      currentLine = newRemaining;
                      break;
                    }
                  }
                }
              }
            } else {
              currentLine += (currentLine ? ' ' : '') + word;
            }
          }
          if (currentLine) {
            currentChunk = currentLine;
          }
        }
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  getNextMessage(): TelegramMessage | null {
    return this.messageQueue.shift() || null;
  }

  hasMessages(): boolean {
    return this.messageQueue.length > 0;
  }

  setOnMessageCallback(
    callback: (message: string, userId: string) => void,
  ): void {
    this.onMessageCallback = callback;
  }

  isConnected(userId: string): boolean {
    const session = this.sessions.get(userId);
    return !!session && session.connected;
  }

  disconnectUser(userId: string): void {
    this.sessions.delete(userId);
  }

  stop(): void {
    if (this.bot) {
      this.bot.stop();
      this.bot = null;
    }
    this.sessions.clear();
    this.messageQueue = [];
  }
}
