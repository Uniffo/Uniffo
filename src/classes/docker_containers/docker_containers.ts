// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import {
    DOCKER_CONTAINERS_DEFINITIONS,
    DOCKER_CONTAINERS_DICTIONARY,
} from '../../pre_compiled/__docker_containers_definitions.ts';
import { _ } from '../../utils/lodash/lodash.ts';

export default class classDockerContainers {
    constructor() {
        logger.debugFn(arguments);
    }

    public static getSupportedContainersNames() {
        logger.debugFn(arguments);

        const names = [...DOCKER_CONTAINERS_DICTIONARY];
        logger.debugVar('names', names);

        return names;
    }

    public static getSupportedContainersDefinitions() {
        logger.debugFn(arguments);

        const definitions = this.getSupportedContainersNames().map((name) => {
            const definition = DOCKER_CONTAINERS_DEFINITIONS.find((def) =>
                def.containerName === name
            );
            logger.debugVar('definition', definition);

            if (!definition) {
                return definition;
            }

            return _.cloneDeep(definition);
        }).filter((p) => !!p);
        logger.debugVar('definitions', definitions);

        return definitions;
    }

    public static compileContainerDefinition(
        definition: ReturnType<typeof this.getSupportedContainersDefinitions>[number],
        container: string,
    ) {
        const newDefinition = { ...definition };
        logger.debugVar('newDefinition', newDefinition);

        function compile(value: any) {
            logger.debugFn(arguments);

            const isString = _.isString(value);
            logger.debugVar('isString', isString);

            if (!isString) {
                return value;
            }

            const compiled = value.replaceAll(
                '${{REPLACE_CONTAINER_NAME}}',
                container,
            );
            logger.debugVar('compiled', compiled);

            return compiled;
        }

        function walkThrough(currentObj: object, currentPath: string[]) {
            logger.debugFn(arguments);

            for (const [key, value] of Object.entries(currentObj)) {
                const newKey = compile(key);
                logger.debugVar('newKey', newKey);

                const newPath = [...currentPath, newKey];
                logger.debugVar('newPath', newPath);

                const newValue = compile(value);
                logger.debugVar('newValue', newValue);

                _.unset(newDefinition, [...currentPath, key]);
                _.set(newDefinition, newPath, newValue);

                if (_.isPlainObject(newValue)) {
                    walkThrough(newValue, newPath);
                }
            }
        }

        walkThrough(newDefinition, []);

        logger.debugVar('newDefinition', newDefinition);

        return newDefinition;
    }

    public static getContainerDefinition(
        container: ReturnType<typeof this.getSupportedContainersNames>[number],
        alias?: string,
    ) {
        logger.debugFn(arguments);

        const containerDefinition = this.getSupportedContainersDefinitions().find((def) =>
            def.containerName === container
        );
        logger.debugVar('containerDefinition', containerDefinition);

        if (!containerDefinition) {
            throw new Error(`Container definition not found for: ${container}`);
        }

        const compiled = this.compileContainerDefinition(containerDefinition, alias || container);
        logger.debugVar('compiled', compiled);

        return compiled;
    }

    public static getDockerComposeContentFromDefinition(
        definition: ReturnType<typeof this.getSupportedContainersDefinitions>[number],
    ) {
        logger.debugFn(arguments);

        const structure = definition.structure;
        logger.debugVar('structure', structure);

        const keys = Object.keys(structure);
        logger.debugVar('keys', keys);

        const dockerComposeKey = keys.find((k) => {
            const name = k.split('.');
            logger.debugVar('name', name);

            const isComposeFile = name[0] === 'docker-compose';
            logger.debugVar('isComposeFile', isComposeFile);

            const isYaml = name[name.length - 1] === 'yml';
            logger.debugVar('isYaml', isYaml);

            if (isComposeFile && isYaml) {
                return true;
            }

            return false;
        });
        logger.debugVar('dockerComposeKey', dockerComposeKey);

        if (!dockerComposeKey) {
            throw new Error('Docker compose file not found in container definition');
        }

        const content = (structure as any)[dockerComposeKey];
        logger.debugVar('content', content);

        return content;
    }

    public static getContainerDockerComposeContent(
        container: ReturnType<typeof this.getSupportedContainersNames>[number],
    ) {
        logger.debugFn(arguments);

        const definition = this.getContainerDefinition(container);
        logger.debugVar('definition', definition);

        const content = this.getDockerComposeContentFromDefinition(definition);
        logger.debugVar('content', content);

        return content;
    }

    public static isSupported(container: string) {
        logger.debugFn(arguments);

        const supported = [...this.getSupportedContainersNames()] as string[];
        logger.debugVar('supported', supported);

        const isSupported = supported.includes(container);
        logger.debugVar('isSupported', isSupported);

        return isSupported;
    }
}
