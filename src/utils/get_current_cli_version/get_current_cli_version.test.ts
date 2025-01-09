// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals } from '@std/assert';
import { getCurrentCliVersion } from './get_current_cli_version.ts';

Deno.test('getCurrentCliVersion', async function testGetCurrentCliVersion() {
	assertEquals(typeof await getCurrentCliVersion() === 'string', true, 'version');
});
