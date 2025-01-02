// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { COMMANDS_META } from './pre_compiled/__commands_meta.ts';
import { logger } from './global/logger.ts';
import { emojify } from './utils/emojify/emojify.ts';
import { commandInvokerFacade } from './global/command_invoker_facade.ts';

try {
	COMMANDS_META.forEach((commandMeta) => commandInvokerFacade.addCommand(commandMeta));

	await commandInvokerFacade.init();
	await commandInvokerFacade.exec();
	await commandInvokerFacade.destroy();
} catch (error) {
	logger.error(`${emojify(':grave:')} `, error);
}
