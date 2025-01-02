// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { getDirStructure } from '../../utils/get_dir_structure/get_dir_structure.ts';
import { ensureDirStructure } from '../../utils/ensure_dir_structure/ensure_dir_structure.ts';
import type { TDirStructure } from '../../utils/map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { pathExistSync } from '../../utils/path_exist/path_exist.ts';
import { CLI_PROJECT_ENVIRONMENT_STRUCTURE } from '../../constants/CLI_PROJECT_ENVIRONMENT_STRUCTURE.ts';
import { basename } from '@std/path';
import { classDotenv } from '../dotenv/dotenv.ts';
import { CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_PATH } from '../../constants/CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_PATH.ts';
import { CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_PATH } from '../../constants/CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_PATH.ts';
import { parseYaml } from '../../utils/parse_yaml/parse_yaml.ts';
import type { mapProvidedContainersToObject } from '../../utils/map_provided_containers_to_object/map_provided_containers_to_object.ts';
import { CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME } from '../../constants/CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME.ts';
import { classNonPremiumUserRestrictions } from '../non_premium_user_restrictions/non_premium_user_restrictions.ts';
import { DOCKER_CONTAINERS_DICTIONARY } from '../../pre_compiled/__docker_containers_definitions.ts';
import { classDockerContainer } from '../docker_containers/docker_container.ts';
import { docker } from '../../global/docker.ts';

/* The class `ProjectManager` in TypeScript handles project directory structure operations such as
ensuring initial structure, converting structure to path content array, and getting the project
structure. */
export class classProjectManager {
	private projectDir;
	private nonPremiumUserRestrictions;

	constructor(args: { projectDir: string }) {
		logger.debugFn(arguments);

		this.projectDir = args.projectDir;
		logger.debugVar('this.projectDir', this.projectDir);

		this.nonPremiumUserRestrictions = classNonPremiumUserRestrictions;
	}

	/**
	 * This function returns the project directory.
	 * @returns The `projectDir` property is being returned.
	 */
	public getProjectDir() {
		logger.debugFn(arguments);

		return this.projectDir;
	}

	public getProjectName() {
		logger.debugFn(arguments);

		return basename(this.getProjectDir());
	}

	public getDotEnvManager(path: string) {
		logger.debugFn(arguments);

		return new classDotenv(path);
	}

	public getStructure() {
		return getDirStructure(this.getProjectDir());
	}

	public getEnvironmentsDirPath() {
		logger.debugFn(arguments);

		const path = `${this.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}`;
		logger.debugVar('path', path);

		return path;
	}

	public getEnvironmentDirPath(environment: string) {
		logger.debugFn(arguments);

		const path = `${this.getEnvironmentsDirPath()}/${environment}`;
		logger.debugVar('path', path);

		return path;
	}

	public getEnvironmentComposeDirPath(environment: string) {
		logger.debugFn(arguments);

		const path = `${this.getEnvironmentDirPath(environment)
			}/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_PATH}`;
		logger.debugVar('path', path);

		return path;
	}

	public getEnvironmentRootDotenvFilePath(environment: string) {
		logger.debugFn(arguments);

		const path = `${this.getEnvironmentDirPath(environment)
			}/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_PATH}`;
		logger.debugVar('path', path);

		return path;
	}

	public getEnvironmentContainerComposeFilePath(args: { environment: string, container: classDockerContainer, containerAlias: string }) {
		logger.debugFn(arguments);

		const path = `${this.getEnvironmentComposeDirPath(args.environment)
			}/${args.containerAlias}/${args.container.composeFileBasename(args.containerAlias)}`;
		logger.debugVar('path', path);

		return path;
	}

	public getEnvironmentFinalDockerCompose(environment: string) {
		logger.debugFn(arguments);

		const dotenvManager = this.getDotEnvManager(
			this.getEnvironmentRootDotenvFilePath(environment),
		);
		logger.debugVar('dotenvManager', dotenvManager);

		const composeFiles = (dotenvManager.getVariable('COMPOSE_FILE') || '').split(':');
		logger.debugVar('composeFiles', composeFiles);

		const composeFilesWithAbsolutePath = composeFiles.map((p) =>
			`${this.getProjectDir()}/${p}`
		);
		logger.debugVar('composeFilesWithAbsolutePath', composeFilesWithAbsolutePath);

		const composeFilesContent = composeFilesWithAbsolutePath.map((p) =>
			Deno.readTextFileSync(p)
		);
		logger.debugVar('composeFilesContent', composeFilesContent);

		const composeFilesYaml = composeFilesContent.map((p) => parseYaml(p));
		logger.debugVar('composeFilesYaml', composeFilesYaml);

		const finalYaml = composeFilesYaml.reduce((acc, p) => {
			return _.merge({}, acc, p);
		});
		logger.debugVar('finalYaml', finalYaml);

		return finalYaml;
	}

	public async getEnvironmentsCount() {
		logger.debugFn(arguments);

		const environmentsDirPath = this.getEnvironmentsDirPath();
		logger.debugVar('environmentsDirPath', environmentsDirPath);

		const structure = await getDirStructure(environmentsDirPath);
		logger.debugVar('structure', structure);

		const environmentsCount = (await Promise.all(
			Object.keys(structure).map((p) => this.isEnvironmentDir(this.getEnvironmentDirPath(p))),
		))
			.filter((p) => p).length;
		logger.debugVar('environmentsCount', environmentsCount);

		return environmentsCount;
	}

	public getEnvironmentContainersCount(environment: string) {
		logger.debugFn(arguments);

		const dockerComposeConfigYaml = this.getEnvironmentFinalDockerCompose(environment);
		logger.debugVar('dockerComposeConfigYaml', dockerComposeConfigYaml);

		const services = dockerComposeConfigYaml?.services;
		logger.debugVar('services', services);

		if (!services || !_.isObject(services) || _.isEmpty(services)) {
			logger.debug('No containers found in the environment');
			return 0;
		}

		const containersCount = Object.keys(services).length;
		logger.debugVar('containersCount', containersCount);

		return containersCount;
	}

	public async ensureInitialStructure() {
		logger.debugFn(arguments);

		await ensureDirStructure(
			CLI_PROJECT_STRUCTURE as unknown as TDirStructure,
			this.getProjectDir(),
		);
	}

	public async isEnvironmentDir(path: string) {
		const structure = await getDirStructure(path);

		const hasDotEnv = _.has(structure, [
			CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_BASENAME,
		]);
		logger.debugVar('hasDotEnv', hasDotEnv);

		const hasCompose = _.has(structure, [
			CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_PATH,
		]);
		logger.debugVar('hasCompose', hasCompose);

		const composeIsDir = _.isObject(
			structure[CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_PATH],
		);
		logger.debugVar('composeIsDir', composeIsDir);

		const isEnvironmentDir = hasDotEnv && hasCompose && composeIsDir;
		logger.debugVar('isEnvironmentDir', isEnvironmentDir);

		return isEnvironmentDir;
	}

	public isEnvironmentExist(name: string) {
		logger.debugFn(arguments);

		const envDir = this.getEnvironmentDirPath(name);
		logger.debugVar('envDir', envDir);

		const exist = pathExistSync(envDir);
		logger.debugVar('exist', exist);

		return exist;
	}

	public containerExistInEnvironment(environment: string, container: string) {
		logger.debugFn(arguments);

		const composeDirPath = this.getEnvironmentComposeDirPath(environment);
		logger.debugVar('composeDirPath', composeDirPath);

		const composeContainerDirPath = `${composeDirPath}/${container}`;
		logger.debugVar('composeContainerDirPath', composeContainerDirPath);

		const containerDirExist = pathExistSync(composeContainerDirPath);
		logger.debugVar('containerDirExist', containerDirExist);

		if (containerDirExist) {
			return true;
		}

		const finalYaml = this.getEnvironmentFinalDockerCompose(environment);
		logger.debugVar('finalYaml', finalYaml);

		const dockerServiceExist = _.has(finalYaml, ['services', container]);
		logger.debugVar('dockerServiceExist', dockerServiceExist);

		if (dockerServiceExist) {
			return true;
		}

		return false;
	}

	public generateUniqueContainerName(environment: string, container: string) {
		logger.debugFn(arguments);

		let key = 1;
		logger.debugVar('key', key);

		let containerName = container;
		logger.debugVar('containerName', containerName);

		while (this.containerExistInEnvironment(environment, containerName)) {
			containerName = `${container}-${key}`;
			logger.debugVar('containerName', containerName);

			key++;
			logger.debugVar('key', key);
		}

		return containerName;
	}

	public enableContainerInEnvironment(args: { environment: string, container: classDockerContainer, containerAlias: string }) {
		logger.debugFn(arguments);

		const containerComposeFilePath = this.getEnvironmentContainerComposeFilePath({
			environment: args.environment,
			containerAlias: args.containerAlias,
			container: args.container,
		});
		logger.debugVar('containerComposeFilePath', containerComposeFilePath);

		const relativeComposeFilePath = containerComposeFilePath.replace(
			`${this.getProjectDir()}/`,
			'./',
		);
		logger.debugVar('relativeComposeFilePath', relativeComposeFilePath);

		const dotenvManager = this.getDotEnvManager(
			this.getEnvironmentRootDotenvFilePath(args.environment),
		);
		logger.debugVar('dotenvManager', dotenvManager);

		const composeFiles = (dotenvManager.getVariable('COMPOSE_FILE') || '').split(':');
		logger.debugVar('composeFiles', composeFiles);

		if (composeFiles.includes(relativeComposeFilePath)) {
			return;
		}

		composeFiles.push(relativeComposeFilePath);
		logger.debugVar('composeFiles', composeFiles);

		dotenvManager.setVariable('COMPOSE_FILE', composeFiles.join(':'));
	}

	public async addContainerToEnvironment(
		environment: string,
		containerName: typeof DOCKER_CONTAINERS_DICTIONARY[number],
		alias?: string,
	) {
		logger.debugFn(arguments);

		if (!this.nonPremiumUserRestrictions.isContainerTypeAllowedForNonPremiumUsers(containerName)) {
			throw new Error(`Container ${containerName} is not allowed for non-premium users!`);
		}

		if (
			!this.nonPremiumUserRestrictions.isContainersCountAllowedForNonPremiumUsers(
				this.getEnvironmentContainersCount(environment) + 1,
			)
		) {
			throw new Error(
				`Non-premium users can have only ${this.nonPremiumUserRestrictions.getMaxNumberOfProjectContainers()} containers!`,
			);
		}

		const containerAlias = this.generateUniqueContainerName(environment, alias || containerName);
		logger.debugVar('containerAlias', containerAlias);

		const container = docker.composeDefinitions().getByName(containerName);
		logger.debugVar('container', container);

		const containerDirPath = `${this.getEnvironmentComposeDirPath(environment)
			}/${containerAlias}`;
		logger.debugVar('containerDirPath', containerDirPath);

		const containerStructure = container.getStructure(containerAlias);
		logger.debugVar('containerStructure', containerStructure);

		await ensureDirStructure(containerStructure, containerDirPath);

		this.enableContainerInEnvironment({ environment, containerAlias, container });
	}

	public async addContainersToEnvironment(
		environment: string,
		containers: ReturnType<typeof mapProvidedContainersToObject>,
	) {
		logger.debugFn(arguments);

		if (
			!this.nonPremiumUserRestrictions.isContainersCountAllowedForNonPremiumUsers(
				this.getEnvironmentContainersCount(environment) + containers.length,
			)
		) {
			throw new Error(
				`Non-premium users can have only ${this.nonPremiumUserRestrictions.getMaxNumberOfProjectContainers()} containers!`,
			);
		}

		for (const container of containers) {
			if (!docker.composeDefinitions().isSupported(container.name)) {
				throw new Error(`Container ${container.name} is not supported!`);
			}

			await this.addContainerToEnvironment(
				environment,
				container.name as typeof DOCKER_CONTAINERS_DICTIONARY[number],
				container.alias,
			);
		}
	}

	public async addEnvironment(
		name: string,
		containersWithAliases: ReturnType<typeof mapProvidedContainersToObject>,
	) {
		logger.debugFn(arguments);

		await this.ensureInitialStructure();

		if (
			!this.nonPremiumUserRestrictions.isEnvironmentsCountAllowedForNonPremiumUsers(
				(await this.getEnvironmentsCount()) + 1,
			)
		) {
			throw new Error(
				`Non-premium users can have only ${this.nonPremiumUserRestrictions.getMaxNumberOfProjectEnvironments()} environments!`,
			);
		}

		if (this.isEnvironmentExist(name)) {
			throw new Error(`Environment ${JSON.stringify(name)} already exist!`);
		}

		const envDir = this.getEnvironmentDirPath(name);
		logger.debugVar('envDir', envDir);

		Deno.mkdirSync(envDir, { recursive: true });

		await ensureDirStructure(CLI_PROJECT_ENVIRONMENT_STRUCTURE, envDir);

		const rootDotEnvFile = this.getEnvironmentRootDotenvFilePath(name);
		logger.debugVar('rootDotEnvFile', rootDotEnvFile);

		const dotenvManager = this.getDotEnvManager(rootDotEnvFile);
		logger.debugVar('dotenvManager', dotenvManager);

		dotenvManager.setVariable('ENVIRONMENT_NAME', name);
		dotenvManager.setVariable('PROJECT_NAME', this.getProjectName());
		dotenvManager.setVariable(
			'COMPOSE_FILE',
			`./${docker.composeDefinitions().getByName('root').composeFileBasename()}`,
		);

		await this.addContainersToEnvironment(name, containersWithAliases);
	}

	public removeEnvironment(name: string, force: boolean = false) {
		logger.debugFn(arguments);

		if (!this.isEnvironmentExist(name)) {
			throw new Error(`Environment ${JSON.stringify(name)} does not exist!`);
		}

		const envDir = this.getEnvironmentDirPath(name);
		logger.debugVar('envDir', envDir);

		if (
			force === false &&
			!confirm(`Are you sure you want to remove environment ${JSON.stringify(name)}?`)
		) {
			logger.info(`Environment ${JSON.stringify(name)} was not removed.`);
			return;
		}

		Deno.removeSync(envDir, { recursive: true });
		logger.info(`Environment ${JSON.stringify(name)} was removed.`);
	}
}
