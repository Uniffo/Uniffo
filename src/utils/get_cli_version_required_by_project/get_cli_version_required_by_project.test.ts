// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals } from '@std/assert';
import { generateUniqueBasename } from '../generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../cwd/cwd.ts';
import { getCliVersionRequiredByProject } from './get_cli_version_required_by_project.ts';
import { logger } from '../../global/logger.ts';
import { loopOnDirStructure } from '../loop_on_dir_structure/loop_on_dir_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { CLI_PROJECT_STRUCTURE_VERSION_FILE_BASENAME } from '../../constants/CLI_PROJECT_STRUCTURE_VERSION_FILE_BASENAME.ts';
import { classProjectManager } from '../../classes/project_manager/project_manager.ts';
import { CLI_PROJECT_STRUCTURE_VERSION_FILE_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_VERSION_FILE_PATH.ts';

Deno.test('getCliVersionRequiredByProject', async function testGetCliVersionRequiredByProject() {
	const baseCwd = cwd();
	const testDirBasename = await generateUniqueBasename({
		basePath: cwd(),
		prefix: 'test_',
	});
	const testDir = `${cwd()}/${testDirBasename}`;

	await Deno.mkdir(testDir, { recursive: true });

	Deno.chdir(testDir);

	assertEquals(await getCliVersionRequiredByProject(), false, 'no project version');

	const testVersion = '99.99.99';

	logger.debug('Create project structure.');
	const pm = new classProjectManager({ projectDir: testDir });
	await pm.ensureInitialStructure();

	logger.debug('Loop project structure.');
	loopOnDirStructure(CLI_PROJECT_STRUCTURE, ({ key }) => {
		if (key !== CLI_PROJECT_STRUCTURE_VERSION_FILE_BASENAME) {
			return;
		}

		Deno.writeTextFileSync(CLI_PROJECT_STRUCTURE_VERSION_FILE_PATH, testVersion);
	}, testDir);

	assertEquals(await getCliVersionRequiredByProject(), testVersion, 'project version');

	Deno.chdir(baseCwd);

	await Deno.remove(testDir, { recursive: true });
});
