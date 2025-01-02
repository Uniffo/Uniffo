// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { DOCUMENTATION_COLOR_THEME } from '../../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments: string[][] = [];

const feedOptions = [
    [['-h', '--help'], 'Display documentation'],
    [['-dbg', '--debug'], 'Display debug logs'],
];

export const description = 'Start the database service';
export const classCommandDbServiceStartDocs = generateDocumentation({
    usage: 'uniffo service db start [OPTIONS]',
    description,
    commands: [],
    arguments: feedArguments,
    options: feedOptions,
    colorTheme: DOCUMENTATION_COLOR_THEME,
});
