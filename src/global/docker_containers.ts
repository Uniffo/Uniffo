// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import classDockerContainers from '../classes/docker_containers/docker_containers.ts';
import { DOCKER_CONTAINERS_DEFINITIONS } from '../pre_compiled/__docker_containers_definitions.ts';

export const dockerContainers = new classDockerContainers(DOCKER_CONTAINERS_DEFINITIONS);
