// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classCliVersionManager } from '../classes/cli_version_manager/cli_version_manager.ts';
import { classDatabase } from '../classes/database/database.ts';
import { classDatabaseService } from '../classes/database_service/database_service.ts';
import classDependencyChecker from '../classes/dependency_checker/dependency_checker.ts';
import { classGitHubApiClient } from '../classes/github/gh_api_client.ts';
import { CLI_DIR } from '../constants/CLI_DIR.ts';
import { DB_SCHEMA } from '../constants/DB_SCHEMA.ts';
import { DB_SERVER_SOCKET_PATH } from '../constants/DB_SERVER_SOCKET_PATH.ts';
import { DB_SERVICE_NAME } from '../constants/DB_SERVICE_NAME.ts';
import { logger } from '../global/logger.ts';
import { generateUniqueBasename } from '../utils/generate_unique_basename/generate_unique_basename.ts';
import meta from '../commands/service/db/start/start.ts';

await (async function installer() {
	classDependencyChecker.check();

	const tmpDir = `${CLI_DIR.tmp}/${await generateUniqueBasename({ basePath: CLI_DIR.tmp })}`;
	const database = new classDatabase({
		dbSchema: DB_SCHEMA,
		dbServerSocketPath: DB_SERVER_SOCKET_PATH,
	});
	const gitHubApiClient = new classGitHubApiClient({ database });
	const cliVersionManager = new classCliVersionManager({
		cliDir: CLI_DIR,
		gitHubApiClient,
		tmpDir,
		database,
	});

	logger.info('Initializing cli version manager');
	await cliVersionManager.init();

	logger.info('Installing latest version of Uniffo');
	const latest = await cliVersionManager.useLatest();

	const execArgs = meta.phrase.split(' ');
	logger.debugVar('cmdStartArgs', execArgs);

	logger.info(`Installing Uniffo database service`);
	const dbService = new classDatabaseService({
		name: DB_SERVICE_NAME,
		description: 'Uniffo database service',
		execPath: `${cliVersionManager.getDirInfo().main}/uniffo`,
		execArgs: execArgs,
		stdOutPath: `${CLI_DIR.localStorage}/logs/uniffodb/std.out.log`,
		stdErrPath: `${CLI_DIR.localStorage}/logs/uniffodb/std.err.log`,
	});

	await dbService.install(true);

	const shell = Deno.env.get('SHELL') || '';

	logger.info(`Adding Uniffo path to shell profile "${shell}"`);

	let profile = '';
	switch (shell.split('/').pop()) {
		case 'zsh':
			profile = '.zshrc';
			break;

		case 'bash':
			profile = '.bashrc';
			break;

		default:
			logger.error(
				`Not supported shell "${shell}"! Please add manually Uniffo path "${cliVersionManager.getDirInfo().main}" to your shell profile (${shell})`,
			);
			break;
	}

	if (profile) {
		const profileFilename = `${Deno.env.get('HOME')}/${profile}`;
		const profileContent = Deno.readTextFileSync(profileFilename);
		const beginUniffoContent = '# Uniffo - BEGIN';
		const endUniffoContent = '# Uniffo - END';
		const newContent: string[] = [];
		let uniffoContentBoolean = false;
		const splitedProfileContent = profileContent.split('\n');

		splitedProfileContent.forEach((line, index) => {
			const isLastLine = index == splitedProfileContent.length - 1;

			if (line.includes(beginUniffoContent)) {
				uniffoContentBoolean = true;
			}

			if (uniffoContentBoolean == false && !(isLastLine && line === '')) {
				newContent.push(`${line}`);
			}

			if (line.includes(endUniffoContent)) {
				uniffoContentBoolean = false;
			}
		});

		const addUninffoToPATH: string[] = [];

		addUninffoToPATH.push(`${beginUniffoContent}`);
		addUninffoToPATH.push(`PATH="\${PATH}:${cliVersionManager.getDirInfo().main}"`);
		addUninffoToPATH.push(`${endUniffoContent}`);

		newContent.push(...addUninffoToPATH);

		logger.info(
			`Add: \n${addUninffoToPATH.join('\n')}\n To shell profile file "${profileFilename}"`,
		);
		Deno.writeTextFileSync(profileFilename, `${newContent.join('\n')}\n`);
	}

	logger.success(
		`Uniffo ${latest} successfully installed. Please restart terminal and try to execute "uniffo"`,
	);
})();
