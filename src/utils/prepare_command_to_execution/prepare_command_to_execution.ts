// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { fromFileUrl } from '@std/path/from-file-url';
import { classCliVersionManager } from '../../classes/cli_version_manager/cli_version_manager.ts';
import { TCommandMeta } from '../../classes/command/command.d.ts';
import { logger } from '../../global/logger.ts';
import { generateUniqueBasename } from '../generate_unique_basename/generate_unique_basename.ts';
import { getDbForTests } from '../get_db_for_tests/get_db_for_tests.ts';
import { getGhApiClientForTests } from '../get_gh_api_client_for_tests/get_gh_api_client_for_tests.ts';
import { parseCliArgs } from '../parser/parser.ts';
import { pathExistSync } from '../path_exist/path_exist.ts';

/**
 * The function `prepareCmd` takes in command metadata and arguments, creates a new command instance
 * based on the metadata, and returns it.
 * @param meta - `meta` is an object containing metadata for a command. It includes information such as
 * the class of the command, the command phrase, and documentation for the command.
 * @param {string[]} args - The `args` parameter in the `prepareCmd` function is an array of strings
 * that represent the command line arguments passed to the function. These arguments will be used along
 * with the command metadata (`meta`) to prepare and create a new command instance.
 * @returns An instance of a command object is being returned.
 */
export async function prepareCmd<T>(meta: TCommandMeta<T>, args: string[]) {
    logger.debugFn(arguments);
    const cmdMeta = meta;

    if (!cmdMeta) {
        throw `Can not find command!`;
    }

    const testDir = `${fromFileUrl(import.meta.resolve('../../..'))}/${await generateUniqueBasename(
        {
            basePath: fromFileUrl(import.meta.resolve('../../..')),
            prefix: `test_pc_`,
        },
    )}`;
    logger.debugVar('testDir', testDir);

    const testData = {
        dir: {
            test: `${testDir}`,
            cli: {
                main: `${testDir}/.cli`,
                tmp: `${testDir}/.cli/tmp`,
                versions: `${testDir}/.cli/versions`,
                localStorage: `${testDir}/.cli/localStorage`,
            },
        },
    };
    logger.debugVar('testData', testData);

    const { database, destroy: destroyDB } = await getDbForTests();
    logger.debugVar('database', database);
    logger.debugVar('destroyDB', destroyDB);

    const gitHubApiClient = getGhApiClientForTests(database);
    logger.debugVar('gitHubApiClient', gitHubApiClient);

    const cliVersionManager = new classCliVersionManager({
        cliDir: testData.dir.cli,
        gitHubApiClient,
        tmpDir: testData.dir.cli.tmp,
        database,
    });
    logger.debugVar('cliVersionManager', cliVersionManager);

    const _class = cmdMeta.class;
    logger.debugVar('_class', _class);

    const command = new _class(
        {
            commandArgs: parseCliArgs([...cmdMeta.phrase.split(' '), ...args]),
            documentation: cmdMeta.documentation,
            database,
            cliVersionManager,
        },
    );
    logger.debugVar('command', command);

    const destroy = async () => {
        await destroyDB();

        if (pathExistSync(testData.dir.test)) {
            await Deno.remove(testData.dir.test, { recursive: true });
        }
    };
    logger.debugVar('destroy', destroy);

    return { command, destroy };
}
