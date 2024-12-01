import { logger } from '../../global/logger.ts';
import { mapDirStructureToPathContentArray } from '../map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.ts';
import { pathExist, pathExistSync } from '../path_exist/path_exist.ts';
import { _ } from '../lodash/lodash.ts';
import type { TDirStructure } from '../map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';
import { dirname } from '@std/path';

export async function ensureDirStructure(
    structure: TDirStructure,
    path: string,
) {
    logger.debugFn(arguments);

    const pathContentArray = mapDirStructureToPathContentArray(structure, path);
    logger.debugVar('pathContentArray', pathContentArray);

    for (let i = 0; i < pathContentArray.length; i++) {
        const data = pathContentArray[i];
        logger.debugVar('data', data);

        if (await pathExist(data.path)) {
            logger.debug(`Path "${data.path}" already exist`);
            continue;
        }

        if (_.isString(data.content)) {
            const dir = dirname(data.path);
            logger.debugVar('dir', dir);

            if (!pathExistSync(dir)) {
                Deno.mkdirSync(dir, { recursive: true });
            }

            Deno.writeTextFileSync(data.path, data.content);
        } else if (!_.has(data, 'content')) {
            Deno.mkdirSync(data.path, { recursive: true });
        }
    }
}
