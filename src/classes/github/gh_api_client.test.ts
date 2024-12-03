// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals } from '@std/assert';
import { getDbForTests } from '../../utils/get_db_for_tests/get_db_for_tests.ts';
import { getGhApiClientForTests } from '../../utils/get_gh_api_client_for_tests/get_gh_api_client_for_tests.ts';

Deno.test('classGitHubApiClient', async function testClassGitHubApiClient() {
	const { database, destroy } = await getDbForTests();

	const ghApi = getGhApiClientForTests(database);

	const releases = await ghApi.fetchReleases();
	const releaseTagName = releases[0].tag_name;
	const release = await ghApi.fetchReleaseByTagName(releaseTagName);

	assertEquals(Array.isArray(releases), true, 'ghApi.fetchReleases() return array');
	assertEquals(releaseTagName.length > 0, true, 'release tag name');
	assertEquals(
		typeof release,
		'object',
		'ghApi.fetchReleaseByTagName(releaseTagName) return object',
	);

	await destroy();
});
