// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { CLI_DOCKER_CONTAINERS_ALLOWED_FOR_USER } from '../../constants/CLI_DOCKER_CONTAINERS_ALLOWED_FOR_USER.ts';
import { logger } from '../../global/logger.ts';
import {
    DOCKER_CONTAINERS_DEFINITIONS,
    DOCKER_CONTAINERS_DICTIONARY,
} from '../../pre_compiled/__docker_containers_definitions.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { TDirStructure } from '../../utils/map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';
import { classDockerContainer } from './docker_container.ts';

export default class classDockerContainers {
    private containers;
    constructor(definitions: typeof DOCKER_CONTAINERS_DEFINITIONS) {
        logger.debugFn(arguments);

        this.containers = definitions.map(d => new classDockerContainer({
            name: d.containerName as typeof DOCKER_CONTAINERS_DICTIONARY[number],
            allowedForUser: CLI_DOCKER_CONTAINERS_ALLOWED_FOR_USER.includes(d.containerName as typeof DOCKER_CONTAINERS_DICTIONARY[number]),
            structure: d.structure as unknown as TDirStructure
        }));
    }

    public getAll() {
        logger.debugFn(arguments);

        logger.debugVar('this.containers', this.containers);

        return this.containers;
    }

    public getByName(name: typeof DOCKER_CONTAINERS_DICTIONARY[number]) {
        logger.debugFn(arguments);

        const container = this.getAll().find(c => c.getName() === name);
        logger.debugVar('container', container);

        if (!container) {
            throw new Error(`Container ${name} not found!`);
        }

        return container;
    }

    public isSupported(containerName: string) {
        logger.debugFn(arguments);

        const isSupported = !!this.getAll().find(container => container.getName() == containerName as typeof DOCKER_CONTAINERS_DICTIONARY[number]);
        logger.debugVar('isSupported', isSupported);

        return isSupported;
    }

    public getWpRecommended() {
        logger.debugFn(arguments);

        const wpRecommendedContainers = [this.getByName('database'), this.getByName('wp-apache')];
        logger.debugVar('wpRecommendedContainers', wpRecommendedContainers);

        return wpRecommendedContainers;
    }

    public getAllowedForUser() {
        logger.debugFn(arguments);

        const allowedContainers = this.getAll().filter(c => c.isAllowedForUser());

        return allowedContainers;
    }
}
