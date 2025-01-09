// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import * as emoji from 'https://deno.land/x/emoji@0.3.1/mod.ts';
import { logger } from '../../global/logger.ts';

export function emojify(text: string) {
	logger.debugFn(arguments);

	const emojifedText = emoji.emojify(text);
	logger.debugVar('emojifedText', emojifedText);

	return emojifedText;
}
