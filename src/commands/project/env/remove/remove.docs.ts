// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { DOCUMENTATION_COLOR_THEME } from '../../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments = [
	[
		'--env-name="..."',
		'Environment name. Allowed characters: a-z, A-Z, 0-9, - and _, spaces are not allowed',
	],
];

const feedOptions = [
	[['-h', '--help'], 'Display documentation'],
	[['-dbg', '--debug'], 'Display debug logs'],
	[['-y', '--yes'], 'Skip confirmation prompt'],
];

export const description = 'Remove environment from project';
export const commandProjectEnvRemoveDocs = generateDocumentation({
	usage: 'uniffo project env remove [ARGUMENTS] [OPTIONS]',
	description,
	commands: [],
	arguments: feedArguments,
	options: feedOptions,
	colorTheme: DOCUMENTATION_COLOR_THEME,
});
