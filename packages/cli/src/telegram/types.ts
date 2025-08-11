/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TelegramSettings {
  botToken?: string;
  enabled?: boolean;
  allowedUserIds?: string[];
}

export interface TelegramSession {
  userId: string;
  chatId: number;
  connected: boolean;
  lastActivity: Date;
}

export interface TelegramMessage {
  text: string;
  userId: string;
  timestamp: Date;
}
