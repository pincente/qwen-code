/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand, CommandKind, CommandContext } from './types.js';
import { TelegramIntegration } from '../../telegram/telegramIntegration.js';

export const tgCommand: SlashCommand = {
  name: 'tg',
  description: 'Switch conversation to Telegram',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext) => {
    const { services, ui } = context;
    const { config, settings } = services;
    const { addItem, setTelegramMode, setTelegramIntegration } = ui;

    if (!config) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Configuration not available.',
      };
    }

    try {
      // Check if Telegram is configured
      const telegramSettings = settings.merged.telegram;
      console.log('Telegram settings:', telegramSettings);
      if (
        !telegramSettings ||
        !telegramSettings.enabled ||
        !telegramSettings.botToken
      ) {
        console.log('Telegram not properly configured');
        return {
          type: 'message',
          messageType: 'error',
          content:
            'Telegram is not configured. Please set up Telegram bot token in settings.',
        };
      }

      // Initialize Telegram integration
      console.log('Creating TelegramIntegration instance...');
      const telegramIntegration = new TelegramIntegration(config);
      console.log('Initializing Telegram integration...');
      
      // Add timeout to prevent hanging
      const initPromise = telegramIntegration.initialize(telegramSettings);
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.log('Telegram initialization timeout');
          resolve(false);
        }, 15000); // 15 second timeout
      });
      
      const success = await Promise.race([initPromise, timeoutPromise]);
      console.log('Telegram initialization result:', success);

      if (success) {
        console.log('Telegram integration initialized successfully');
        // Store reference to the Telegram integration
        if (setTelegramIntegration) {
          setTelegramIntegration(telegramIntegration);
        }
        if (setTelegramMode) {
          setTelegramMode(true);
        }

        // Set up message callback
        telegramIntegration.setOnMessageCallback(
          (_message: string, _userId: string) => {
            // This will be handled by the main app loop
            console.log('Received message callback from Telegram');
          },
        );

        const connectionMessage = `Telegram mode enabled successfully!
        
To connect to this Qwen session:
1. Open Telegram
2. Search for your bot (using the token you configured)
3. Send any message to start the session

All conversation will continue in Telegram while status updates appear here.`;

        addItem(
          {
            type: 'info',
            text: connectionMessage,
          },
          Date.now(),
        );

        return {
          type: 'message',
          messageType: 'info',
          content:
            'Telegram integration initialized. Check the instructions above to connect. Send a message from Telegram to begin.',
        };
      } else {
        console.log('Failed to initialize Telegram integration');
        return {
          type: 'message',
          messageType: 'error',
          content:
            'Failed to initialize Telegram bot. Check your configuration.',
        };
      }
    } catch (error) {
      console.error('Error in tgCommand:', error);
      return {
        type: 'message',
        messageType: 'error',
        content: `Error initializing Telegram: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
