// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classCommandInvokerFacade } from '../classes/command_invoker_facade/command_invoker_facade.ts';
import { cliVersionManager } from './cli_version_manager.ts';
import { commandArguments } from './command_arguments.ts';
import { commandInvoker } from './command_invoker.ts';
import { commandsRepository } from './commands_repository.ts';
import { database } from './database.ts';
import { tmpDir } from './tmp_dir.ts';

export const commandInvokerFacade = new classCommandInvokerFacade({
    tmpDir,
    commandArguments,
    database,
    cliVersionManager,
    commandsRepository,
    commandInvoker,
});
