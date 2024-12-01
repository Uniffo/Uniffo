// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import classDockerContainers from '../docker_containers/docker_containers.ts';
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
import { parse as parseYaml } from '@std/yaml';
import type { mapProvidedContainersToObject } from '../../utils/map_provided_containers_to_object/map_provided_containers_to_object.ts';

/* The class `ProjectManager` in TypeScript handles project directory structure operations such as
ensuring initial structure, converting structure to path content array, and getting the project
structure. */
export class classProjectManager {
    private projectDir;
    private dockerContainers;

    constructor(args: { projectDir: string }) {
        logger.debugFn(arguments);

        this.projectDir = args.projectDir;
        logger.debugVar('this.projectDir', this.projectDir);

        this.dockerContainers = classDockerContainers;
        logger.debugVar('this.dockerContainers', this.dockerContainers);
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

    public getEnvironmentDirPath(environment: string) {
        logger.debugFn(arguments);

        const path =
            `${this.getProjectDir()}/${CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}/${environment}`;
        logger.debugVar('path', path);

        return path;
    }

    public getEnvironmentComposeDirPath(environment: string) {
        logger.debugFn(arguments);

        const path = `${
            this.getEnvironmentDirPath(environment)
        }/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_COMPOSE_DIR_PATH}`;
        logger.debugVar('path', path);

        return path;
    }

    public getEnvironmentRootDotenvFilePath(environment: string) {
        logger.debugFn(arguments);

        const path = `${
            this.getEnvironmentDirPath(environment)
        }/${CLI_PROJECT_ENVIRONMENT_STRUCTURE_ROOT_ENV_FILE_PATH}`;
        logger.debugVar('path', path);

        return path;
    }

    public getEnvironmentContainerComposeFilePath(environment: string, container: string) {
        logger.debugFn(arguments);

        const path = `${
            this.getEnvironmentComposeDirPath(environment)
        }/${container}/docker-compose.${container}.yml`;
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

        const composeFilesYaml = composeFilesContent.map((p) => parseYaml(p) as Object);
        logger.debugVar('composeFilesYaml', composeFilesYaml);

        const finalYaml = composeFilesYaml.reduce((acc, p) => {
            return _.merge({}, acc, p);
        });
        logger.debugVar('finalYaml', finalYaml);

        return finalYaml;
    }

    public async ensureInitialStructure() {
        logger.debugFn(arguments);

        await ensureDirStructure(
            CLI_PROJECT_STRUCTURE as unknown as TDirStructure,
            this.getProjectDir(),
        );
    }
    public async ensureContainerStructure(
        container: ReturnType<typeof classDockerContainers.getSupportedContainersNames>[number],
        path: string,
    ) {
        logger.debugFn(arguments);

        const containerDefinition = this.dockerContainers.getContainerDefinition(container);
        logger.debugVar('containerDefinition', containerDefinition);

        if (!_.isObject(containerDefinition?.structure)) {
            throw new Error(`Container ${container} does not have structure defined!`);
        }

        await ensureDirStructure(containerDefinition.structure as unknown as TDirStructure, path);
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

        let key = 0;
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

    public enableContainerInEnvironment(environment: string, container: string) {
        logger.debugFn(arguments);

        const containerComposeFilePath = this.getEnvironmentContainerComposeFilePath(
            environment,
            container,
        );
        logger.debugVar('containerComposeFilePath', containerComposeFilePath);

        const relativeComposeFilePath = containerComposeFilePath.replace(
            `${this.getProjectDir()}/`,
            './',
        );
        logger.debugVar('relativeComposeFilePath', relativeComposeFilePath);

        const dotenvManager = this.getDotEnvManager(
            this.getEnvironmentRootDotenvFilePath(environment),
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
        container: ReturnType<typeof classDockerContainers.getSupportedContainersNames>[number],
        alias?: string,
    ) {
        logger.debugFn(arguments);

        const containerName = this.generateUniqueContainerName(environment, alias || container);
        logger.debugVar('containerName', containerName);

        const containerDefinition = this.dockerContainers.getContainerDefinition(
            container,
            containerName,
        );
        logger.debugVar('containerDefinition', containerDefinition);

        const structure = containerDefinition.structure as unknown as TDirStructure;
        logger.debugVar('structure', structure);

        const containerDirPath = `${
            this.getEnvironmentComposeDirPath(environment)
        }/${containerName}`;
        logger.debugVar('containerDirPath', containerDirPath);

        await ensureDirStructure(structure, containerDirPath);

        this.enableContainerInEnvironment(environment, containerName);
    }

    public async addEnvironment(
        name: string,
        containersWithAliases: ReturnType<typeof mapProvidedContainersToObject>,
    ) {
        logger.debugFn(arguments);

        await this.ensureInitialStructure();

        if (this.isEnvironmentExist(name)) {
            throw new Error(`Environment ${JSON.stringify(name)} already exist!`);
        }

        const envDir = this.getEnvironmentDirPath(name);
        logger.debugVar('envDir', envDir);

        await ensureDirStructure(CLI_PROJECT_ENVIRONMENT_STRUCTURE, envDir);

        const rootDotEnvFile = this.getEnvironmentRootDotenvFilePath(name);
        logger.debugVar('rootDotEnvFile', rootDotEnvFile);

        const dotenvManager = this.getDotEnvManager(rootDotEnvFile);
        logger.debugVar('dotenvManager', dotenvManager);

        dotenvManager.setVariable('ENVIRONMENT_NAME', name);
        dotenvManager.setVariable('PROJECT_NAME', this.getProjectName());
        dotenvManager.setVariable(
            'COMPOSE_FILE',
            `./docker-compose.${
                this.dockerContainers.getSupportedContainersNames().filter((p) => p === 'root')[0]
            }.yml`,
        );

        for (const container of containersWithAliases) {
            if (!this.dockerContainers.isSupported(container.name)) {
                throw new Error(`Container ${container.name} is not supported!`);
            }

            await this.addContainerToEnvironment(
                name,
                container.name as ReturnType<
                    typeof classDockerContainers.getSupportedContainersNames
                >[number],
                container.alias,
            );
        }
    }
}
