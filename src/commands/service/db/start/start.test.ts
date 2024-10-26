// Copyright 2023-2024 Maciej Koralewski. All rights reserved. MIT license.

import { assert } from '@std/assert';
import { cwd } from '../../../../utils/cwd/cwd.ts';
import { generateUniqueBasename } from '../../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { noError } from '../../../../utils/no_error/no_error.ts';
import { prepareCmd } from '../../../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';
import { sleep } from '../../../../utils/sleep/sleep.ts';
import _commandMeta from './start.ts';
Deno.test('commandServiceStart', async (t) => {
    const testDir = `${cwd()}/${await generateUniqueBasename({
        basePath: cwd(),
        prefix: `test_command_db_service_start_`,
    })}`;

    Deno.mkdirSync(testDir);

    const produceCommand = async () => {
        const { command, destroy } = await prepareCmd(_commandMeta, ['--debug']);

        command.dbServer.sqlLiteDatabase.destroy();

        command.dbServerSocketPath = `${testDir}/db.sock`;
        command.dbPath = `${testDir}`;

        command.recreateDbServer();

        return { command, destroy };
    };

    const startServer = async (
        command: Awaited<ReturnType<typeof produceCommand>>['command'],
        testName: string,
    ) => {
        assert(
            await noError(async () => {
                command._exec();
                await sleep(1000);
            }),
            `${testName}: Error on command execution`,
        );
        assert(command.running, `${testName}: Command is not running`);
        assert(command.dbServer, `${testName}: DB server is not created`);
        assert(command.dbServer.listening, `${testName}: DB server is not listening`);
    };

    await t.step('SIGTERM', async (t) => {
        const { command, destroy } = await produceCommand();

        await startServer(command, t.name);

        assert(
            await noError(async () => {
                Deno.kill(Deno.pid, 'SIGTERM');
                await sleep(1000);
            }),
            'Error on handle signal SIGTERM',
        );
        assert(!command.running, 'Command is running');
        assert(!command.dbServer.listening, 'DB server is listening');

        await destroy();
    });
    await t.step('SIGINT', async (t) => {
        const { command, destroy } = await produceCommand();

        await startServer(command, t.name);

        assert(
            await noError(async () => {
                command.handleSignalSIGINT();
                await sleep(1000);
            }),
            'Error on handle signal SIGINT',
        );
        assert(!command.running, 'Command is running');
        assert(!command.dbServer.listening, 'DB server is listening');

        await destroy();
    });
    await t.step('SIGHUP', async (t) => {
        const { command, destroy } = await produceCommand();

        await startServer(command, t.name);

        assert(
            await noError(async () => {
                Deno.kill(Deno.pid, 'SIGHUP');
                await sleep(1000);
            }),
            'Error on handle signal SIGHUP',
        );
        assert(command.running, 'Command is not running');
        assert(command.dbServer, 'DB server is not created');
        assert(command.dbServer.listening, 'DB server is not listening');
        assert(
            await noError(async () => {
                Deno.kill(Deno.pid, 'SIGTERM');
                await sleep(1000);
            }),
            'Error on handle signal SIGTERM',
        );
        assert(!command.running, 'Command is running');

        await destroy();
    });

    await Deno.remove(testDir, { recursive: true });
});