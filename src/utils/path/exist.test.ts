import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { pathExist } from './exist.ts';

Deno.test('pathExist', async function testPathExist() {
	const shouldExist = await pathExist(Deno.cwd());
	const shouldNotExist = await pathExist(
		`${Deno.cwd()}/unrealistic-path-to-not-existed-sth.random.ext`,
	);

	assertEquals(shouldExist, true, 'Path should exist');
	assertEquals(shouldNotExist, false, 'Path should not exist');
});
