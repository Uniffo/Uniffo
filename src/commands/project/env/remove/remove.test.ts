// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assert } from '@std/assert';
import _commandMeta from './remove.ts';
import { generateUniqueBasename } from '../../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../../utils/cwd/cwd.ts';
import { prepareCmd } from '../../../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';
import { noError } from '../../../../utils/no_error/no_error.ts';
import { classProjectManager } from '../../../../classes/project_manager/project_manager.ts';
import { mapProvidedContainersToObject } from '../../../../utils/map_provided_containers_to_object/map_provided_containers_to_object.ts';
import { pathExistSync } from '../../../../utils/path_exist/path_exist.ts';
import { docker } from '../../../../global/docker.ts';

Deno.test('commandProjectEnvRemove', async function testCommandProjectEnvRemove(t) {
	const testDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_cp_er_`,
	})}`;

	Deno.mkdirSync(testDir);

	const projectName = 'uniffo-test-project';

	const projectDir = `${testDir}/${projectName}`;

	const environmentName = 'test-env';

	const containersWithAliases = mapProvidedContainersToObject(
		`${docker.composeDefinitions().getByName('wp-apache').getName()}:my-wp-alias,${docker.composeDefinitions().getByName('database').getName()}:my-db-alias`,
	);

	const pm = new classProjectManager({ projectDir });

	await t.step('prepare testing environment', async function () {
		assert(
			await noError(async () => {
				await pm.ensureInitialStructure();
			}),
			`Error during project structure creation`,
		);
		assert(
			await noError(async () => {
				await pm.addEnvironment(environmentName, containersWithAliases);
			}),
			`Error during environment creation`,
		);
		assert(
			pathExistSync(pm.getEnvironmentDirPath(environmentName)),
			`Environment directory does not exist`,
		);
	});

	Deno.chdir(projectDir);

	await t.step('remove project environment', async function () {
		const args: string[] = [
			`--env-name="${environmentName}"`,
			`--yes`,
		];

		const { command, destroy } = await prepareCmd(_commandMeta, args);

		assert(
			await noError(async () => {
				await command.exec();
			}),
			`Error during command execution`,
		);
		assert(
			await noError(async () => {
				await destroy();
			}),
			`Error during destroy`,
		);
		assert(
			!pathExistSync(pm.getEnvironmentDirPath(environmentName)),
			`Environment directory still exists`,
		);
	});

	Deno.chdir(`${testDir}/../`);
	await Deno.remove(testDir, { recursive: true });
});
