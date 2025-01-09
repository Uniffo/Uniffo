// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { DOCUMENTATION_COLOR_THEME } from '../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments = [
	[
		'--project-name="..."',
		'Project directory name. Allowed characters: a-z, A-Z, 0-9, - and _, spaces are not allowed',
	],
];

const feedOptions = [
	[['-h', '--help'], 'Display documentation'],
	[['-dbg', '--debug'], 'Display debug logs'],
	[['-ncd', '--no-change-dir'], 'Do not change the current directory to the project directory'],
];

export const description = 'Initialize the project';
export const commandProjectInitDocs = generateDocumentation({
	usage: 'uniffo project init [ARGUMENTS] [OPTIONS]',
	description,
	commands: [],
	arguments: feedArguments,
	options: feedOptions,
	colorTheme: DOCUMENTATION_COLOR_THEME,
});
