// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { _ } from '../lodash/lodash.ts';
import { logger } from '../../global/logger.ts';
import { loopOnDirStructure } from '../loop_on_dir_structure/loop_on_dir_structure.ts';
import type { TDirStructure } from './map_dir_structure_to_path_content_array.d.ts';

export function mapDirStructureToPathContentArray(structure: TDirStructure, path: string) {
    logger.debugFn(arguments);

    const pathContentArray: { path: string; content?: string }[] = [];

    loopOnDirStructure(structure, (data) => {
        logger.debug(`Map data to path & content`);

        const path = data.path;
        logger.debugVar('path', path);

        const content = data.value;
        logger.debugVar('content', content);

        const isEmptyDirectory = !_.isString(content) && _.isEmpty(content) &&
            _.isObject(content);
        logger.debugVar('isEmptyDirectory', isEmptyDirectory);

        if (isEmptyDirectory) {
            logger.debug('Adding empty directory to pathContentArray');

            pathContentArray.push({ path });
            return;
        }

        if (_.isString(content)) {
            logger.debug('Adding file to pathContentArray');

            pathContentArray.push({ path, content });
            return;
        }

        logger.debug('Unknown type');
    }, path);

    return pathContentArray;
}
