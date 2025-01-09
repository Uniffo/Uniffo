// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classCommand } from './command.ts';
import { TCommandArgs, type TCommandMeta } from './command.d.ts';
import { assert } from '@std/assert';
import { noError } from '../../utils/no_error/no_error.ts';
import { returnsNext, stub } from '@std/testing/mock';
import { prepareCmd } from '../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';

Deno.test('classCommand', async function testClassCommand(t) {
	class myCommand extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}
		public exec() {}
	}

	const meta: TCommandMeta<myCommand> = {
		phrase: 'myCommand',
		documentation: 'My command docs',
		description: 'My command desc',
		class: myCommand,
	};

	await t.step(async function testClassCommandDocs() {
		const args = ['-h'];
		const { command, destroy } = await prepareCmd(meta, args);

		assert(command instanceof classCommand === true, 'Command is instanceof classCommand');
		assert(command.args.primitive[0] === meta.phrase, 'Command phrase');
		assert(command.getDocs() === meta.documentation, 'Command docs');
		assert(await noError(() => command._exec()), 'Command display docs');

		await destroy();
	});

	await t.step(async function testClassCommandExecution() {
		const args = [] as string[];
		const { command, destroy } = await prepareCmd(meta, args);
		assert(await noError(() => command._exec()), 'Command just exec');

		await destroy();
	});

	await t.step(async function testClassCommandGetOrAskForArgument() {
		const argName = 'my-argument-custom';
		const argName2 = 'my-argument-custom2';
		const argVal = 'my custom value!';
		const argVal2 = 'my custom value for prompt!';
		const argVal3 = '';
		const askForArgMessage = 'Provide your custom value:';
		const args = [`--${argName}=${argVal}`];
		const { command, destroy } = await prepareCmd(meta, args);

		assert(
			await command.getOrAskForArg({ name: argName, askMessage: askForArgMessage }) == argVal,
			'test arg value',
		);
		const promptStub = stub(
			globalThis,
			'prompt',
			returnsNext([argVal2, argVal3, argVal3, argVal3, null, argVal2]),
		);
		assert(
			await command.getOrAskForArg({ name: argName2, askMessage: askForArgMessage }) ==
				argVal2,
			'prompt asking',
		);
		assert(
			await command.getOrAskForArg({ name: argName2, askMessage: askForArgMessage }) ==
				argVal3,
			'prompt empty',
		);
		assert(
			await command.getOrAskForArg({
				name: argName2,
				askMessage: askForArgMessage,
				required: true,
			}) == argVal2,
			'prompt required argument',
		);
		promptStub.restore();

		await destroy();
	});
});
