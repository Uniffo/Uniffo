// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { walk } from '@svarta/walk-it';
import { CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { CLI_PROJECT_STRUCTURE_EMPTY_DIR } from '../../constants/CLI_PROJECT_STRUCTURE_EMPTY_DIR.ts';

type definition = {
    containerName: string;
    structure: {
        [file: string]: string;
    };
};

function compileContent(str: string) {
    logger.debugFn(arguments);

    const replaceMap = {
        '${{REPLACE_CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}}':
            CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH,
        '${{REPLACE_CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH}}': CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH,
    };
    logger.debugVar('replaceMap', replaceMap);

    const replaceMapKeys = Object.keys(replaceMap) as unknown as (keyof typeof replaceMap)[];
    logger.debugVar('replaceMapKeys', replaceMapKeys);

    for (let i = 0; i < replaceMapKeys.length; i++) {
        const toReplace = replaceMapKeys[i];
        logger.debugVar('toReplace', toReplace);

        const replaceBy = replaceMap[toReplace];
        logger.debugVar('replaceBy', replaceBy);

        str = str.replaceAll(toReplace, replaceBy);
        logger.debugVar('str', str);
    }

    return str;
}

export async function generateDockerContainersDefinitions(preCompiledDir: string) {
    const definitionsDir = `${preCompiledDir}/../classes/docker_containers/definitions`;

    const definitions = [] as definition[];
    for await (
        const entry of walk(definitionsDir, { maxLevel: 0 })
    ) {
        const folders = entry.folders;
        logger.debugVar('folders', folders);

        for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];
            logger.debugVar('folder', folder);

            const definition = {
                containerName: folder.name,
                structure: {},
            } as definition;

            const fileBasename = folder.name;
            logger.debugVar('fileBasename', fileBasename);

            const absolutePath = `${folder.parentPath}/${fileBasename}`;
            logger.debugVar('absolutePath', absolutePath);

            for await (
                const entryInContainerDir of walk(absolutePath)
            ) {
                logger.debugVar('entryInContainerDir', entryInContainerDir);

                const filesInContainerDir = entryInContainerDir.files;
                logger.debugVar('filesInContainerDir', filesInContainerDir);

                const foldersInContainerDir = entryInContainerDir.folders;
                logger.debugVar('foldersInContainerDir', foldersInContainerDir);

                filesInContainerDir.forEach((fileInContainerDir) => {
                    logger.debugVar('fileInContainerDir', fileInContainerDir);

                    const absolutePathToFile =
                        `${fileInContainerDir.parentPath}/${fileInContainerDir.name}`;
                    logger.debugVar('absolutePathToFile', absolutePathToFile);

                    const relativePath = absolutePathToFile
                        .replace(absolutePath, '').split(
                            '/',
                        ).filter((p) => p).join('/');
                    logger.debugVar('relativePath', relativePath);

                    if (relativePath) {
                        _.set(
                            definition.structure,
                            relativePath.split('/'),
                            compileContent(Deno.readTextFileSync(absolutePathToFile)),
                        );
                    }
                });

                foldersInContainerDir.forEach((folderInContainerDir) => {
                    logger.debugVar('folderInContainerDir', folderInContainerDir);

                    const absolutePathToFolder =
                        `${folderInContainerDir.parentPath}/${folderInContainerDir.name}`;
                    logger.debugVar('absolutePathToFile', absolutePathToFolder);

                    const relativePath = absolutePathToFolder
                        .replace(absolutePath, '').split(
                            '/',
                        ).filter((p) => p).join('/');
                    logger.debugVar('relativePath', relativePath);

                    if (relativePath) {
                        _.set(
                            definition.structure,
                            relativePath.split('/'),
                            CLI_PROJECT_STRUCTURE_EMPTY_DIR,
                        );
                    }
                });
            }

            definitions.push(definition);
        }
    }

    logger.debugVar('definitions', definitions);

    let fileContent = `export const DOCKER_CONTAINERS_DICTIONARY = ${
        JSON.stringify(definitions.map((def) => def.containerName))
    } as const;\n`;
    fileContent += `export const DOCKER_CONTAINERS_DEFINITIONS = ${JSON.stringify(definitions)};\n`;
    logger.debugVar('fileContent', fileContent);

    const definitionsFile = `${preCompiledDir}/__docker_containers_definitions.ts`;
    logger.debugVar('definitionsFile', definitionsFile);

    Deno.writeTextFileSync(definitionsFile, fileContent);
}
