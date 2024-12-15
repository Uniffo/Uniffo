// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { DOCKER_CONTAINERS_DICTIONARY } from '../pre_compiled/__docker_containers_definitions.ts';

const allowedContainers: (typeof DOCKER_CONTAINERS_DICTIONARY)[number][] = [
	'wp-apache',
	'database',
];

export const NON_PREMIUM_USER_RESTRICTIONS = {
	MAX_NUMBER_OF_RUNNING_PROJECTS: 1,
	MAX_PROJECT_ENVIRONMENTS: 1,
	ALLOWED_DOMAINS: 'localhost',
	ALLOWED_PROTOCOLS: 'http',
	ALLOWED_NUMBER_OF_CONTAINERS: 3,
	ALLOWED_TYPES_OF_CONTAINERS: allowedContainers,
} as const;
