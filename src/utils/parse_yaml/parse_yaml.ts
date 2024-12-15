// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { parse } from '@std/yaml/parse';
import { logger } from '../../global/logger.ts';
import { _ } from '../lodash/lodash.ts';
import { TNestedObject } from './parse_yaml.d.ts';

export function parseYaml<T = TNestedObject>(content: string) {
	logger.debugFn(arguments);

	const parsedYaml = parse(content);
	logger.debugVar('parsedYaml', parsedYaml);

	return parsedYaml as T;
}
