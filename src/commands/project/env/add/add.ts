// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { TCommandArgs, TCommandMeta } from '../../../../classes/command/command.d.ts';
import { classCommand } from '../../../../classes/command/command.ts';
import classDockerContainers from '../../../../classes/docker_containers/docker_containers.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { logger } from '../../../../global/logger.ts';
import { generateUniqueBasename } from '../../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { mapProvidedContainersToObject } from '../../../../utils/map_provided_containers_to_object/map_provided_containers_to_object.ts';
import { pathExist } from '../../../../utils/path_exist/path_exist.ts';
import { pwd } from '../../../../utils/pwd/pwd.ts';
import { commandProjectEnvAddDocs, description } from './add.docs.ts';

const phrase = 'project env add';

class classCommandProjectEnvAdd extends classCommand {
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

		const mappedContainers = mapProvidedContainersToObject(data.containers);
		logger.debugVar('mappedContainers', mappedContainers);

		logger.log(`Adding environment ${JSON.stringify(envName)}...`);
		await projectManager.addEnvironment(data.envName, mappedContainers);
	}

	public async getInputData() {
		const validatorEnvName = async (value: string) => {
			logger.debugFn(arguments);

			const envPath =
				`${await pwd()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${value}`;
			logger.debugVar('envPath', envPath);

			if (await pathExist(envPath)) {
				return `Environment already exist! "${envPath}"`;
			}

			return this.validateEnvName(value);
		};

		const validatorContainers = (value: string) => {
			logger.debugFn(arguments);
			return this.validateNamesOfSupportedContainersAndAliases(value);
		};

		const availableContainers = classDockerContainers.getSupportedContainersNames();
		const defaultContainers: (typeof availableContainers)[number][] = ['wp-apache', 'database'];

		return {
			envName: await this.getOrAskForArg({
				name: 'env-name',
				askMessage: 'Enter environment name (only A-z 0-9 - _ are allowed):',
				required: false,
				throwIfInvalid: true,
				defaultValue: await generateUniqueBasename({
					prefix: 'my-env',
					basePath: `${await pwd()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}`,
				}),
				validator: validatorEnvName,
			}),
			containers: await this.getOrAskForArg({
				name: 'containers',
				defaultValue: defaultContainers.join(','),
				askMessage: `Enter list of container to setup example "${
					availableContainers.filter((name) => name != 'root').join(',')
				}"`,
				required: false,
				throwIfInvalid: true,
				validator: validatorContainers,
			}),
		};
	}
}

const meta: TCommandMeta<classCommandProjectEnvAdd> = {
	phrase,
	description,
	documentation: commandProjectEnvAddDocs,
	class: classCommandProjectEnvAdd,
};

export default meta;
