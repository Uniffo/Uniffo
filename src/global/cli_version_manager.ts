// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classCliVersionManager } from '../classes/cli_version_manager/cli_version_manager.ts';
import { CLI_DIR } from '../constants/CLI_DIR.ts';
import { gitHubApiClient } from './github_api_client.ts';
import { tmpDir } from './tmp_dir.ts';
import { database } from './database.ts';

export const cliVersionManager = new classCliVersionManager({
    cliDir: CLI_DIR,
    gitHubApiClient,
    tmpDir,
    database,
});
