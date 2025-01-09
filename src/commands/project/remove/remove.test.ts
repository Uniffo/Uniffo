// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assert } from '@std/assert';
import { noError } from '../../../utils/no_error/no_error.ts';
import { COMMANDS_META } from '../../../pre_compiled/__commands_meta.ts';
import _commandMeta from './remove.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { _ } from '../../../utils/lodash/lodash.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { prepareCmd } from '../../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';
import { classProjectManager } from '../../../classes/project_manager/project_manager.ts';

Deno.test('commandProjectRemove', async function testCommandProjectRemove(t) {
	const _cwd = cwd();
	const testDir = `${_cwd}/${await generateUniqueBasename({
		basePath: _cwd,
		prefix: `test_command_project_remove_`,
	})}`;

	let error = undefined;
	try {
		const commandMeta = COMMANDS_META.find((item) => item.phrase === _commandMeta.phrase);

		assert(!!commandMeta == true, 'Get command meta');

		await t.step('Display help', async function testCommandRemoveHelp() {
			const args: string[] = [
				'-h',
				'--help',
				'--debug',
			];

			const { command, destroy } = await prepareCmd(commandMeta, args);

			assert(
				await noError(async () => await command._exec()),
				'Check command help execution',
			);

			await destroy();
		});

		await t.step('execution with force', async function testCommandRemoveWithForce() {
			const pm = new classProjectManager({ projectDir: testDir });
			await pm.ensureInitialStructure();

			const args: string[] = [
				'--debug',
				'--force',
			];

			const { command, destroy } = await prepareCmd(commandMeta, args);

			Deno.chdir(testDir);

			assert(
				await noError(async () => await command._exec()),
				'Check command execution with force',
			);
			assert(await pathExist(testDir) === false, 'Project path still exists');

			await destroy();
		});

		await t.step('execution without force', async function testCommandRemoveWithoutForce() {
			const pm = new classProjectManager({ projectDir: testDir });
			await pm.ensureInitialStructure();

			const args: string[] = [
				'--debug',
			];
			const { command, destroy } = await prepareCmd(commandMeta, args);

			const userInput = testDir;
			command.askForArg.bind(command);
			command.askForArg = async (args: {
				message: string;
				required: boolean;
				defaultValue: string;
				validator?: (value: string) => true | string;
			}) => {
				if (args.defaultValue) {
					return args.defaultValue;
				}
				return userInput;
			};

			Deno.chdir(testDir);

			assert(await noError(async () => await command._exec()), 'Check command execution');
			assert(await pathExist(testDir) === false, 'Project path still exists');

			await destroy();
		});
	} catch (e) {
		error = e;
	}

	Deno.chdir(`${_cwd}`);

	if (await pathExist(testDir)) {
		await Deno.remove(testDir, { recursive: true });
	}

	if (!_.isUndefined(error)) {
		throw error;
	}
});
