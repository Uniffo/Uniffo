// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { parseCliArgs } from '../../utils/parser/parser.ts';
import type { classCliVersionManager } from '../cli_version_manager/cli_version_manager.ts';
import type { classDatabase } from '../database/database.ts';

export type TCommandArgs = {
	commandArgs: ReturnType<typeof parseCliArgs>;
	documentation?: string;
	database: classDatabase;
	cliVersionManager: classCliVersionManager;
};

export type TCommandMeta<T> = {
	phrase: string;
	description: string;
	documentation?: string;
	class: new (args: TCommandArgs) => T;
};
