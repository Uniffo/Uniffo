// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { classProjectManager } from '../../../classes/project_manager/project_manager.ts';
import { CLI_PROJECT_NAME_PREFIX } from '../../../constants/CLI_PROJECT_NAME_PREFIX.ts';
import { logger } from '../../../global/logger.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { commandProjectInitDocs, description } from './init.docs.ts';

const phrase = 'project init';
class classCommandProjectInit extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}

	public async exec() {
		logger.debugFn(arguments);

		const data = await this.getInputData();
		logger.debugVar('data', data);

		const newProjectPath = `${cwd()}/${data.projectName}`;
		logger.debugVar('newProjectPath', newProjectPath);

		const pm = new classProjectManager({ projectDir: newProjectPath });
		logger.debugVar('pm', pm);

		logger.info('Creating project structure...');

		await pm.ensureInitialStructure();

		if (!data.noChangeDir) {
			logger.info('Changing current directory to project directory.');
			Deno.chdir(newProjectPath);
		}
	}

	public async getInputData() {
		const validateProjectDir = async (value: string) => {
			logger.debugFn(arguments);

			const dirBasename = value;
			logger.debugVar('dirBasename', dirBasename);

			if (!dirBasename) {
				return `Invalid project name ${JSON.stringify(dirBasename)}!`;
			}

			const validateProjectNameResult = this.validateProjectName(dirBasename);

			if (validateProjectNameResult !== true) {
				return validateProjectNameResult;
			}

			const dirPath = `${cwd()}/${value}`;
			logger.debugVar('dirPath', dirPath);

			if (await pathExist(dirPath)) {
				return `Directory ${JSON.stringify(dirPath)} already exist!`;
			}

			return true;
		};

		return {
			projectName: await this.getOrAskForArg({
				name: 'project-name',
				askMessage: 'Enter project name:',
				required: false,
				defaultValue: await generateUniqueBasename({
					basePath: cwd(),
					prefix: `${CLI_PROJECT_NAME_PREFIX}-`,
				}),
				throwIfInvalid: true,
				validator: validateProjectDir,
			}),
			noChangeDir: this.args.hasBoolean(['ncd', 'no-change-dir'], 'OR'),
		};
	}
}

const meta: TCommandMeta<classCommandProjectInit> = {
	phrase,
	description,
	documentation: commandProjectInitDocs,
	class: classCommandProjectInit,
};

export default meta;
