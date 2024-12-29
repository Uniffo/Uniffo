// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { getDirStructure } from '../../utils/get_dir_structure/get_dir_structure.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { TDirStructure } from '../../utils/map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';

type definition = {
    containerName: string;
    structure: TDirStructure;
};

function mapTDirStructureToDefinitionsArray(structure: TDirStructure) {
    const definitions = [] as definition[];

    const structureKeys = Object.keys(structure) as unknown as (keyof TDirStructure)[];
    logger.debugVar('structureKeys', structureKeys);

    for (let i = 0; i < structureKeys.length; i++) {
        const containerName = structureKeys[i];
        logger.debugVar('containerName', containerName);

        const containerStructure = structure[containerName];
        logger.debugVar('containerStructure', containerStructure);

        const definition: definition = {
            containerName: containerName.toString(),
            structure: _.isString(containerStructure) ? {} : containerStructure,
        };
        logger.debugVar('definition', definition);

        definitions.push(definition);
    }

    return definitions;
}

export async function generateDockerContainersDefinitions(preCompiledDir: string) {
    const definitionsDir = `${cwd()}/src/classes/docker_containers/definitions`;
    logger.debugVar('definitionsDir', definitionsDir);

    const structure = await getDirStructure(definitionsDir)
    logger.debugVar('structure', structure);

    const definitions = mapTDirStructureToDefinitionsArray(structure);
    logger.debugVar('definitions', definitions);

    let fileContent = `export const DOCKER_CONTAINERS_DICTIONARY = ${JSON.stringify(definitions.map((def) => def.containerName))
        } as const;\n`;
    fileContent += `export const DOCKER_CONTAINERS_DEFINITIONS = ${JSON.stringify(definitions)};\n`;
    logger.debugVar('fileContent', fileContent);

    const definitionsFile = `${preCompiledDir}/__docker_containers_definitions.ts`;
    logger.debugVar('definitionsFile', definitionsFile);

    Deno.writeTextFileSync(definitionsFile, fileContent);
}
