// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assert } from '@std/assert';
import { getError } from '../../utils/get_error/get_error.ts';
import classDependencyChecker from './dependency_checker.ts';

Deno.test('classDependencyChecker', async function testClassDependencyChecker() {
	assert(
		['undefined', 'string'].includes(
			typeof (await getError(() =>
				classDependencyChecker.check([{
					cmd: 'command',
					args: ['-v', 'unavailableCommand'],
				}])
			)),
		),
		'check() failed',
	);
});
