// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals } from '@std/assert';
import { noError } from './no_error.ts';

Deno.test('noError', async function testNoError() {
	const throwMsg = 'Sample throw message';
	const callbackWithThrow = () => {
		throw throwMsg;
	};
	const callbackWithoutThrow = () => {};

	assertEquals(await noError(callbackWithThrow), false, 'throw message');
	assertEquals(await noError(callbackWithoutThrow), true, 'no throw');
});
