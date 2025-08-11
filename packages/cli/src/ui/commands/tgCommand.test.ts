/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { tgCommand } from './tgCommand.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import { CommandKind } from './types.js';

describe('tgCommand', () => {
  it('should have correct name, description, and kind', () => {
    expect(tgCommand.name).toBe('tg');
    expect(tgCommand.description).toBe('Switch conversation to Telegram');
    expect(tgCommand.kind).toBe(CommandKind.BUILT_IN);
  });

  it('should have an action function', () => {
    expect(tgCommand.action).toBeDefined();
    expect(typeof tgCommand.action).toBe('function');
  });

  it('should execute without errors', async () => {
    const context = createMockCommandContext();
    // The action function should not throw an error
    await expect(tgCommand.action!(context, '')).resolves.not.toThrow();
  });
});
