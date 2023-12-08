import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { getRandomId } from './get_random_id.ts';

Deno.test('getRandomId', function testGetRandomId() {
	const id1 = getRandomId(0);
	const id2 = getRandomId(16);
	const id3 = getRandomId(999);

	assertEquals(typeof id1, 'string');
	assertEquals(typeof id2, 'string');
	assertEquals(typeof id3, 'string');
	assertEquals(id1.length, 0);
	assertEquals(id2.length, 16);
	assertEquals(id3.length, 999);
});
