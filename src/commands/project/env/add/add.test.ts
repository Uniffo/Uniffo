// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { assert } from '@std/assert';
import { noError } from '../../../../utils/no_error/no_error.ts';
import _commandMeta from './add.ts';
import { generateUniqueBasename } from '../../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../../utils/cwd/cwd.ts';
import { _ } from '../../../../utils/lodash/lodash.ts';
import { pathExist } from '../../../../utils/path_exist/path_exist.ts';
import { getError } from '../../../../utils/get_error/get_error.ts';
import { logger } from '../../../../global/logger.ts';
import { shell } from '../../../../utils/shell/shell.ts';
import { prepareCmd } from '../../../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';
import _commandMetaInit from '../../init/init.ts';
import classDockerContainers from '../../../../classes/docker_containers/docker_containers.ts';
import { pwd } from '../../../../utils/pwd/pwd.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { classNonPremiumUserRestrictions } from '../../../../classes/non_premium_user_restrictions/non_premium_user_restrictions.ts';

Deno.test('commandProjectEnvAdd', async function testCommandProjectEnvAdd(t) {
	const _isPremiumUser = classNonPremiumUserRestrictions.isPremiumUser;

	classNonPremiumUserRestrictions.isPremiumUser = true;

	const testDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_cp_ea_`,
	})}`;

	Deno.mkdirSync(testDir);

	const projectName = 'uniffo-test-project';

	const args: string[] = [
		'--debug',
		`--project-name="${projectName}"`,
		`--no-change-dir`,
	];

	const { command, destroy } = await prepareCmd(_commandMetaInit, args);

	Deno.chdir(testDir);

	await t.step(async function _initProject() {
		logger.log(await shell({ cmd: ['realpath', '.'] }));
		logger.log(await shell({ cmd: ['ls', '-la'] }));

		await command._exec();

		logger.log(await shell({ cmd: ['realpath', '.'] }));
		logger.log(await shell({ cmd: ['ls', '-la'] }));

		Deno.chdir(projectName);

		logger.log(await shell({ cmd: ['realpath', '.'] }));
		logger.log(await shell({ cmd: ['ls', '-la'] }));

		await destroy();
	});

	await t.step(async function validEnvName() {
		const envName = 'my-custom-env-name';

		const { command, destroy } = await prepareCmd(_commandMeta, [
			'--debug',
			`--env-name="${envName}"`,
		]);

		assert(await noError(async () => await command._exec()), 'Check command execution');

		assert(
			await pathExist(
				`${await pwd()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${envName}/.env.root`,
			) === true,
			'Check if config file exists',
		);

		await destroy();

		const envName2 = 'my-custom-env-name2';

		const { command: command2, destroy: destory2 } = await prepareCmd(_commandMeta, [
			'--debug',
			`--env-name="${envName2}"`,
		]);

		assert(await noError(async () => await command2._exec()), 'Check command2 execution');

		assert(
			await pathExist(
				`${await pwd()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${envName2}/.env.root`,
			) === true,
			'Check if config file exists',
		);

		await destory2();
	});

	await t.step(async function invalidEnvName() {
		for (const envName of ['my-custom invalid -env-name', 'my-custom-$-env-name', '$%%%']) {
			const { command, destroy } = await prepareCmd(_commandMeta, [
				'--debug',
				`--env-name="${envName}"`,
			]);

			assert(
				await getError(async () => await command._exec()),
				`Command should throw an error for env name: "${envName}"`,
			);

			await destroy();
		}
	});

	await t.step(async function invalidLocation() {
		const envName = 'my-custom-env-name';
		const args: string[] = [
			'--debug',
			`--env-name="${envName}"`,
		];
		const { command, destroy } = await prepareCmd(_commandMeta, args);

		const _cwd = cwd();

		Deno.chdir(`${testDir}`);

		assert(
			_.isString(await getError<string>(async () => await command._exec())) === true,
			'Command should not be executed outside the project',
		);

		Deno.chdir(`${_cwd}`);

		await destroy();
	});

	await t.step(async function includedContainers() {
		const envName = 'my-custom-env-with-containers';

		const availableContainers = classDockerContainers.getSupportedContainersNames();
		const defaultContainers: (typeof availableContainers)[number][] = ['wp-apache', 'database'];

		const { command, destroy } = await prepareCmd(_commandMeta, [
			'--debug',
			`--env-name="${envName}"`,
			`--containers="${defaultContainers}"`,
		]);

		assert(await noError(async () => await command._exec()), 'Check command execution');

		assert(
			await pathExist(
				`${await pwd()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${envName}/.env.root`,
			) === true,
			'Check if config file exists',
		);

		await destroy();
	});

	classNonPremiumUserRestrictions.isPremiumUser = _isPremiumUser;

	Deno.chdir(`${testDir}/../`);
	await Deno.remove(testDir, { recursive: true });
});
