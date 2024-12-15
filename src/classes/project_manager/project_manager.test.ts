// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { cwd } from '../../utils/cwd/cwd.ts';
import { generateUniqueBasename } from '../../utils/generate_unique_basename/generate_unique_basename.ts';
import _commandMetaInit from '../../commands/project/init/init.ts';
import { classProjectManager } from './project_manager.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { assert } from '@std/assert';
import { _ } from '../../utils/lodash/lodash.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import classDockerContainers from '../docker_containers/docker_containers.ts';
import { pathExistSync } from '../../utils/path_exist/path_exist.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_BASENAME } from '../../constants/CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_BASENAME.ts';
import { CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME } from '../../constants/CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME.ts';
import { logger } from '../../global/logger.ts';
import { mapProvidedContainersToObject } from '../../utils/map_provided_containers_to_object/map_provided_containers_to_object.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import { classNonPremiumUserRestrictions } from '../non_premium_user_restrictions/non_premium_user_restrictions.ts';

Deno.test('projectManager', async function testProjectManager(t) {
	const testDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_pm_`,
	})}`;

	Deno.mkdirSync(testDir);

	const projectName = 'uniffo-test-project';
	const projectDir = `${testDir}/${projectName}`;
	const pm = new classProjectManager({ projectDir });

	async function isFileExistsInFsAndStructure(path: string) {
		if (!pathExistSync(path)) {
			logger.debugVar('path', path);
			return false;
		}

		const structure = await pm.getStructure();
		logger.debugVar('structure', structure);

		const pathToProperty = path.replace(`${pm.getProjectDir()}/`, '').split('/');
		logger.debugVar('pathToProperty', pathToProperty);

		if (!_.has(structure, pathToProperty)) {
			return false;
		}

		return true;
	}

	await t.step('ensureInitialStructure', async function () {
		assert(
			await noError(async () => {
				await pm.ensureInitialStructure();
			}),
			'Setup project structure',
		);
		assert(_.isEqual(await pm.getStructure(), CLI_PROJECT_STRUCTURE), 'Structure is not equal');
	});

	await t.step('addEnvrionment', async function () {
		const args = {
			name: 'my-custom-env-name',
			containers: mapProvidedContainersToObject(
				classDockerContainers.getSupportedContainersNames().filter((p) => p !== 'root')
					.join(','),
			),
		};
		const args2 = {
			name: 'my-custom-env-name2',
			containers: mapProvidedContainersToObject(
				classDockerContainers.getSupportedContainersNames().filter((p) => p !== 'root')
					.join(','),
			),
		};

		assert(
			await noError(async () => {
				await pm.addEnvironment(args.name, args.containers);
			}),
			'Add environment',
		);

		assert(
			await getError(async () => {
				await pm.addEnvironment(args2.name, args2.containers);
			}),
			`Add second environment as non-premium user`,
		);

		assert(
			await isFileExistsInFsAndStructure(
				`${pm.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${args.name}`,
			),
			'Environment directory exists',
		);
		assert(
			await isFileExistsInFsAndStructure(`${pm.getProjectDir()}/docker-compose.root.yml`),
			'Root docker-compose file exists',
		);
		assert(
			await isFileExistsInFsAndStructure(
				`${pm.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${args.name}/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME}`,
			),
			'Environment root env file exists',
		);
		assert(
			await isFileExistsInFsAndStructure(
				`${pm.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${args.name}/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_BASENAME}`,
			),
			'Environment root env file exists',
		);
		assert(
			await noError(() => {
				pm.removeEnvironment(args.name, true);
			}),
			'Remove environment',
		);
	});

	await t.step('addEnvrionmentWithContainersAliases', async function () {
		const args = {
			name: 'my-custom-env-name-2',
			containers: mapProvidedContainersToObject(
				classDockerContainers.getSupportedContainersNames().filter((p) => p !== 'root')
					.map((container) => `${container}:alias-${container}`)
					.join(','),
			),
		};

		assert(
			await noError(async () => {
				await pm.addEnvironment(args.name, args.containers);
			}),
			'Add environment',
		);
		assert(
			await isFileExistsInFsAndStructure(
				`${pm.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${args.name}`,
			),
			'Environment directory exists',
		);
		assert(
			await isFileExistsInFsAndStructure(`${pm.getProjectDir()}/docker-compose.root.yml`),
			'Root docker-compose file exists',
		);
		assert(
			await isFileExistsInFsAndStructure(
				`${pm.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${args.name}/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME}`,
			),
			'Environment root env file exists',
		);
		assert(
			await isFileExistsInFsAndStructure(
				`${pm.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${args.name}/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_BASENAME}`,
			),
			'Environment root env file exists',
		);
		assert(
			await noError(() => {
				pm.removeEnvironment(args.name, true);
			}),
			'Remove environment',
		);
	});

	await t.step('NonPremiumUser', async function () {
		const nonPremiumUserMaxContainers = classNonPremiumUserRestrictions
			.getMaxNumberOfProjectContainers();
		const containersAboveLimit = new Array(nonPremiumUserMaxContainers + 1).fill('wp-apache');

		const args = {
			name: 'my-custom-env-name-3',
			containers: mapProvidedContainersToObject(containersAboveLimit.join(',')),
		};

		assert(
			await getError(async () => {
				await pm.addEnvironment(args.name, args.containers);
			}),
			'Add environment with too many containers',
		);

		assert(
			await getError(async () => {
				await pm.addContainersToEnvironment(args.name, args.containers);
			}),
			'Add containers to environment with too many containers',
		);

		assert(
			await noError(async () => {
				await pm.addContainersToEnvironment(args.name, args.containers.slice(0, -1));
			}),
			'Add environment with max non premium user containers',
		);

		assert(
			await getError(async () => {
				await pm.addContainersToEnvironment(args.name, args.containers.slice(0, 1));
			}),
			'Add containers to environment with no space for containers',
		);
	});

	Deno.removeSync(testDir, { recursive: true });
});
