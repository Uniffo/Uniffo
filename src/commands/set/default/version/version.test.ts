// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assert } from '@std/assert';
import { prepareCmd } from '../../../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';
import meta from './version.ts';
import { noError } from '../../../../utils/no_error/no_error.ts';
import { releasesMockup } from '../../../../utils/get_gh_api_client_for_tests/releases.ts';

Deno.test('commandSetDefaultVersion', async function testCommandSetDefaultVersion(t) {
    const { command, destroy } = await prepareCmd(meta, [
        '--debug',
        `--release="${releasesMockup[0].tag_name}"`,
    ]);

    assert(await noError(async () => await command._exec()), 'Check command execution');

    await destroy();
});
