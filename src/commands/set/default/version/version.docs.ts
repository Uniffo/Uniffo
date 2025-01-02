// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { DOCUMENTATION_COLOR_THEME } from '../../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments = [
    ['--release="..."', 'Uniffo release version'],
];

const feedOptions = [
    [['-h', '--help'], 'Display documentation'],
    [['-dbg', '--debug'], 'Display debug logs'],
];

export const description = 'Set default version of Uniffo';
export const commandSetDefaultVersionDocs = generateDocumentation({
    usage: 'uniffo set default version [ARGUMENTS] [OPTIONS]',
    description,
    commands: [],
    arguments: feedArguments,
    options: feedOptions,
    colorTheme: DOCUMENTATION_COLOR_THEME,
});
