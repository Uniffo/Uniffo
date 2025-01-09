// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { TCommandArgs, TCommandMeta } from '../../../../classes/command/command.d.ts';
import { classCommand } from '../../../../classes/command/command.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { logger } from '../../../../global/logger.ts';
import { pathExist } from '../../../../utils/path_exist/path_exist.ts';
import { pwd } from '../../../../utils/pwd/pwd.ts';
import { commandProjectEnvRemoveDocs, description } from './remove.docs.ts';

const phrase = 'project env remove';

class classCommandProjectEnvRemove extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}

	public async exec() {
		logger.debugFn(arguments);

		await this.onlyInsideProject();

		const data = await this.getInputData();
		logger.debugVar('data', data);

		const projectManager = await this.getProjectManager();
		logger.debugVar('projectManager', projectManager);

		const envName = data.envName;
		logger.debugVar('envName', envName);

		const confirm = data.confirm;
		logger.debugVar('confirm', confirm);

		logger.log(`Removing environment ${JSON.stringify(envName)}...`);
		projectManager.removeEnvironment(envName, confirm);
	}

	public async getInputData() {
		const validatorEnvName = async (value: string) => {
			logger.debugFn(arguments);

			const envPath =
				`${await pwd()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${value}`;
			logger.debugVar('envPath', envPath);

			if (!await pathExist(envPath)) {
				return `Environment ${JSON.stringify(value)} does not exist`;
			}

			return this.validateEnvName(value);
		};

		return {
			envName: await this.getOrAskForArg({
				name: 'env-name',
				askMessage: 'Enter environment name (only A-z 0-9 - _ are allowed):',
				required: true,
				throwIfInvalid: true,
				validator: validatorEnvName,
			}),
			confirm: this.args.hasBoolean(['y', 'yes'], 'OR'),
		};
	}
}

const meta: TCommandMeta<classCommandProjectEnvRemove> = {
	phrase,
	description,
	documentation: commandProjectEnvRemoveDocs,
	class: classCommandProjectEnvRemove,
};

export default meta;
