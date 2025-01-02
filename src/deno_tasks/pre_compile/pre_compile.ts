// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { cwd } from '../../utils/cwd/cwd.ts';
import { generateVersion } from './generate_version.ts';
import { generateCommandsMeta, generateEmptyCommandsMetaFile } from './generate_commands_meta.ts';
import {
	generateCommandsMetaFeed,
	generateEmptyCommandsMetaFeedFile,
} from './generate_commands_feed.ts';
import { generateDockerContainersDefinitions } from './generate_docker_containers_definitions.ts';

const PRECOMPILED_DIR = `${cwd()}/src/pre_compiled`;

await (async function () {
	await generateVersion(`${cwd()}/VERSION`, `${PRECOMPILED_DIR}/__cli_version.ts`);
	await generateDockerContainersDefinitions(PRECOMPILED_DIR);
	await generateEmptyCommandsMetaFeedFile(`${PRECOMPILED_DIR}/__commands_meta_feed.ts`);
	await generateEmptyCommandsMetaFile(`${PRECOMPILED_DIR}/__commands_meta.ts`);
	await generateCommandsMetaFeed(
		`${cwd()}/src/commands`,
		`${PRECOMPILED_DIR}/__commands_meta_feed.ts`,
	);
	await generateCommandsMeta(`${cwd()}/src/commands`, `${PRECOMPILED_DIR}/__commands_meta.ts`);
})();
