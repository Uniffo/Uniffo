// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assert } from '@std/assert';
import { classCommandInvoker } from './command_invoker.ts';
import { classCommand } from '../command/command.ts';
import { TCommandArgs, type TCommandMeta } from '../command/command.d.ts';
import { logger } from '../../global/logger.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { prepareCmd } from '../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';
Deno.test('classCommandInvoker', async function testClassCommandInvoker() {
	const commandInvokerFactory = () => new classCommandInvoker();

	let invoker = commandInvokerFactory();

	invoker.setCheckDependencies(true);

	assert(invoker.checkDependencies === true, 'setCheckDependencies');

	invoker.setOutsourceTarget('myTarget');

	assert(invoker.outsourceTarget?.[0] === 'myTarget', 'setOutsourceTarget');

	assert(
		_.isFunction(invoker.getCommandExecutionCallback()),
		'getCommandExecutionCallback for not empty string',
	);

	invoker.setOutsourceTarget('');

	assert(
		_.isFunction(invoker.getCommandExecutionCallback()),
		'getCommandExecutionCallback for empty string',
	);

	invoker = commandInvokerFactory();

	assert(
		_.isFunction(invoker.getCommandExecutionCallback()),
		'getCommandExecutionCallback for undefined',
	);

	class myClassCommand extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}

		exec(): void | Promise<void> {
			logger.debug('My command');
		}
	}

	const meta_1: TCommandMeta<myClassCommand> = {
		phrase: 'myCommand',
		documentation: 'My command',
		description: 'My command',
		class: myClassCommand,
	};

	const args_1 = ['./'];

	let command = await prepareCmd(meta_1, args_1);

	const cmdPath = (new TextDecoder()).decode(
		(new Deno.Command('which', { args: ['ls'] })).outputSync().stdout,
	).trim();

	invoker.setOutsourceTarget(cmdPath);

	assert(
		await noError(async () => await invoker.outsourceCommand(command.command)),
		'outsource command',
	);

	invoker.setOutsourceTarget('');

	assert(
		_.isString(await getError(async () => await invoker.outsourceCommand(command.command))),
		'outsource command with error',
	);

	invoker = commandInvokerFactory();

	invoker.setCheckDependencies(false);

	const noErrorResultDispatchCommand = await noError(async () =>
		await invoker.dispatchCommand(command.command)
	);
	assert(noErrorResultDispatchCommand == true, 'dispatch command');

	invoker = commandInvokerFactory();
	invoker.setCheckDependencies(false);
	invoker.setOutsourceTarget('');

	const noErrorResultExecWithDispatch = await noError(async () =>
		await invoker.exec(command.command)
	);
	assert(noErrorResultExecWithDispatch == true, 'exec with dispatch');

	invoker.setOutsourceTarget(cmdPath);

	const noErrorResultExecWithOutsource = await noError(async () =>
		await invoker.exec(command.command)
	);
	assert(noErrorResultExecWithOutsource, 'exec with outsource');

	await command.destroy();

	const errorMsg = 'Expected error throw!';
	class myClassCommandWithError extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}

		exec(): void | Promise<void> {
			logger.debug('My command with error');

			throw errorMsg;
		}
	}

	const meta: TCommandMeta<myClassCommandWithError> = {
		phrase: 'myCommand',
		documentation: 'My command',
		description: 'My command',
		class: myClassCommandWithError,
	};

	const args = ['./'];

	command = await prepareCmd(meta, args);

	invoker.setOutsourceTarget('');

	assert(
		await getError(async () => await invoker.exec(command.command)) === errorMsg,
		'exec with dispatch Error',
	);

	await command.destroy();
});
