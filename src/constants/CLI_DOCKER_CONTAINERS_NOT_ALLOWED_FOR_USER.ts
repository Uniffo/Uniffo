// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { DOCKER_CONTAINERS_DICTIONARY } from '../pre_compiled/__docker_containers_definitions.ts';

export const CLI_DOCKER_CONTAINERS_NOT_ALLOWED_FOR_USER: typeof DOCKER_CONTAINERS_DICTIONARY[number][] = [
    'root',
    'uniffo-traefik-local',
]