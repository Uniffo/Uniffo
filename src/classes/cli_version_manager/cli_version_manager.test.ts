// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { cwd } from '../../utils/cwd/cwd.ts';
import { classCliVersionManager } from './cli_version_manager.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { getDbForTests } from '../../utils/get_db_for_tests/get_db_for_tests.ts';
import { getGhApiClientForTests } from '../../utils/get_gh_api_client_for_tests/get_gh_api_client_for_tests.ts';
import { assert } from '@std/assert';
import { generateUniqueBasename } from '../../utils/generate_unique_basename/generate_unique_basename.ts';
import { classProjectManager } from '../project_manager/project_manager.ts';
import { CLI_PROJECT_STRUCTURE_VERSION_FILE_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_VERSION_FILE_PATH.ts';

Deno.test('classCliVersionManager', async function testClassCliVersionManager() {
	const testDir = `${cwd()}/test_classCliVersionManager`;
	const testProjectDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_pr_`,
	})}`;
	const testData = {
		dir: {
			test: `${testDir}`,
			project: `${testProjectDir}`,
			cli: {
				main: `${testDir}/.cli`,
				tmp: `${testDir}/.cli/tmp`,
				versions: `${testDir}/.cli/versions`,
				localStorage: `${testDir}/.cli/localStorage`,
				localRouter: `${testDir}/.cli/localRouter`,
			},
		},
	};

	const pm = new classProjectManager({ projectDir: `${testData.dir.project}` });

	await pm.ensureInitialStructure();

	const { database, destroy } = await getDbForTests();

	const gitHubApiClient = getGhApiClientForTests(database);

	const cliVersionManager = new classCliVersionManager({
		cliDir: testData.dir.cli,
		gitHubApiClient,
		tmpDir: testData.dir.cli.tmp,
		database,
	});

	const latestVer = (await cliVersionManager.getVersionsList()).at(-1)?.tagName;

	if (!latestVer) {
		throw 'Undefined latest version of cli!';
	}

	cliVersionManager.setPrefferdCliVersion(latestVer);
	await cliVersionManager.init();

	const _cwd = cwd();

	let error;

	try {
		Deno.chdir(testData.dir.project);

		cliVersionManager.setPrefferdCliVersion(latestVer);
		await cliVersionManager.init();
		cliVersionManager.unsetPrefferdCliVersion();

		Deno.writeTextFileSync(
			`${testData.dir.project}/${CLI_PROJECT_STRUCTURE_VERSION_FILE_PATH}`,
			`999.999.999`,
		);

		assert(
			(await getError<string>(async () => {
				await cliVersionManager.init();
			})).length > 0,
			'try to get unavailable version',
		);

		assert(
			cliVersionManager.getDispatchTarget().map((p) => p.includes(testData.dir.cli.versions))
				.includes(true),
			'get dispatch path',
		);

		const version = `0.1.0`;

		assert(
			(await getError<string>(async () => {
				await cliVersionManager.downloadVersion(version);
			})) === undefined,
			'download version',
		);

		assert(
			await pathExist(`${testData.dir.cli.versions}/${version}/uniffo`),
			'verify download',
		);

		assert(await cliVersionManager.ensureVersion(version) === undefined, 'ensure version');

		const useLatest = await getError<string>(async () => {
			await cliVersionManager.useLatest();
		});

		assert(
			useLatest === undefined,
			`use latest version = "${useLatest}"`,
		);

		assert(Array.isArray(await cliVersionManager.getVersionsList()), 'versions list');

		assert(_.isObject(cliVersionManager.getDirInfo()), 'get dir info');

		assert(_.isBoolean(cliVersionManager.shouldOutsourceCmd()), 'should outsource cmd');
	} catch (err) {
		error = err;
	}

	Deno.chdir(_cwd);

	await destroy();

	if (error) {
		throw error;
	}

	await Deno.remove(testDir, { recursive: true });
	await Deno.remove(testProjectDir, { recursive: true });
});
