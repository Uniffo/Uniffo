// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
// import { cwd } from '../cwd/cwd.ts';

async function handleStreamShell(
	args: {
		readable: ReadableStream<Uint8Array>;
		outputChunks: string[];
		write: (p: Uint8Array) => Promise<number>;
		decoder: TextDecoder;
	},
) {
	logger.debugFn(arguments);

	for await (const chunk of args.readable) {
		logger.debugVar('chunk', chunk);

		const decoded = args.decoder.decode(chunk);
		logger.debugVar('decoded', decoded);

		args.outputChunks.push(decoded);

		await args.write(chunk);
	}
}

/**
 * Executes a shell command and returns the output.
 * @param args - The command and its arguments.
 * @returns The output of the command if successful, otherwise false.
 */
export async function shell(args: { cmd: string[]; cwd?: string }) {
	logger.debugFn(arguments);

	const cmd = new Deno.Command(args.cmd[0], { args: args.cmd.slice(1), cwd: args.cwd });
	logger.debugVar('cmd', cmd);

	const output = await cmd.output();
	logger.debugVar('output', output);

	if (!output.success) {
		const errorMessage = new TextDecoder().decode(output.stderr);
		logger.debugVar('errorMessage', errorMessage);

		throw new Error(
			`Shell: failed to execute \`${args.cmd.join(' ')}\` with error: ${errorMessage}`,
		);
	}

	const result = new TextDecoder().decode(output.stdout);
	logger.debugVar('result', result);

	return result;
}

export async function shellStream(args: { cmd: string[]; cwd?: string }) {
	logger.debugFn(arguments);

	const cmd = new Deno.Command(args.cmd[0], {
		args: args.cmd.slice(1),
		stdin: 'inherit',
		stdout: 'piped',
		stderr: 'piped',
		cwd: args.cwd,
	});

	logger.debugVar('cmd', cmd);

	const childProcess = cmd.spawn();
	logger.debugVar('childProcess', childProcess);

	const decoder = new TextDecoder();
	const stdoutChunks: string[] = [];
	const stderrChunks: string[] = [];
	const stdoutWrite = Deno.stdout.write.bind(Deno.stdout);
	const stderrWrite = Deno.stderr.write.bind(Deno.stderr);

	await Promise.all([
		handleStreamShell({
			readable: childProcess.stdout,
			outputChunks: stdoutChunks,
			write: stdoutWrite,
			decoder,
		}),
		handleStreamShell({
			readable: childProcess.stderr,
			outputChunks: stderrChunks,
			write: stderrWrite,
			decoder,
		}),
	]);

	logger.debugVar('stdoutChunks', stdoutChunks);
	logger.debugVar('stderrChunks', stderrChunks);

	const status = await childProcess.status;
	logger.debugVar('status', status);

	const output = await childProcess.output();
	logger.debugVar('output', output);

	if (!output.success) {
		const errorMessage = stderrChunks.join('');
		logger.debugVar('errorMessage', errorMessage);

		throw new Error(
			`Shell: failed to execute \`${args.cmd.join(' ')}\` with error: ${errorMessage}`,
		);
	}

	const result = stdoutChunks.join('');
	logger.debugVar('result', result);

	return result;
}
