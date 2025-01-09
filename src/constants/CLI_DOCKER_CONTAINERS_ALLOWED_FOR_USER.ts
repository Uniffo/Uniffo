// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { DOCKER_CONTAINERS_DICTIONARY } from '../pre_compiled/__docker_containers_definitions.ts';
import { CLI_DOCKER_CONTAINERS_NOT_ALLOWED_FOR_USER } from './CLI_DOCKER_CONTAINERS_NOT_ALLOWED_FOR_USER.ts';

export const CLI_DOCKER_CONTAINERS_ALLOWED_FOR_USER = DOCKER_CONTAINERS_DICTIONARY.filter(container => !CLI_DOCKER_CONTAINERS_NOT_ALLOWED_FOR_USER.includes(container));