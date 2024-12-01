// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { walk } from '@svarta/walk-it';
import type { TDirStructure } from '../map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';
import { logger } from '../../global/logger.ts';
import { _ } from '../lodash/lodash.ts';

export async function getDirStructure(path: string) {
    const structure: TDirStructure = {};

    for await (const x of walk(path)) {
        const entries = [...(x?.files || []), ...(x?.folders || [])];
        logger.debugVar('entries', entries);

        entries.forEach((entry) => {
            logger.debugVar('entry', entry);

            const absolutePath = `${entry.parentPath}/${entry.name}`;
            logger.debugVar('absolutePath', absolutePath);

            const relativePath = `${entry.parentPath.replace(path, '')}/${entry.name}`.slice(1);
            logger.debugVar('relativePath', relativePath);

            const content = entry.isFile() ? Deno.readTextFileSync(absolutePath) : {};
            logger.debugVar('content', content);

            if (!_.isEmpty(relativePath) && !_.has(structure, relativePath.split('/'))) {
                logger.debug('Adding to structure', relativePath);

                _.set(structure, relativePath.split('/'), content);
            }
        });
    }

    logger.debugVar('structure', structure);

    return structure;
}
