// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals } from '@std/assert';
import { getError } from './get_error.ts';

Deno.test('getError', async function testGetError() {
	const throwMsg = 'Sample throw message';
	const callbackWithThrow = () => {
		throw throwMsg;
	};
	const callbackWithoutThrow = () => {};

	assertEquals(await getError<typeof throwMsg>(callbackWithThrow), throwMsg, 'throw message');
	assertEquals(await getError<undefined>(callbackWithoutThrow), undefined, 'no throw');
});
