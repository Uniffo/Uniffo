// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { DOCUMENTATION_COLOR_THEME } from '../../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments = [
	[
		'--env-name="..."',
		'Environment name. Allowed characters: a-z, A-Z, 0-9, - and _, spaces are not allowed',
	],
	[
		'--containers="..."',
		'List of container to setup ex. "wp,db" or "wp:my-wp-alias,db:my-db-alias".Allowed characters for alias: a-z, A-Z, 0-9, - and _, spaces are not allowed',
	],
];

const feedOptions = [
	[['-h', '--help'], 'Display documentation'],
	[['-dbg', '--debug'], 'Display debug logs'],
];

export const description = 'Initialize the project';
export const commandProjectEnvAddDocs = generateDocumentation({
	usage: 'uniffo project env add [ARGUMENTS] [OPTIONS]',
	description,
	commands: [],
	arguments: feedArguments,
	options: feedOptions,
	colorTheme: DOCUMENTATION_COLOR_THEME,
});
