// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { _ } from '../lodash/lodash.ts';
import type { TDirStructure } from '../map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';

/**
 * The function `loopOnDirStructure` recursively iterates over a directory structure object and
 * executes a callback function for each item found, providing information about the path, value, and
 * key.
 * @param {TDirStructure} structure - The `structure` parameter in the `loopOnDirStructure` function
 * represents the directory structure that you want to loop through. It is an object where each key
 * represents a file or directory name, and the corresponding value can be either a string (file
 * content) or another object (sub-directory).
 * @param callback - The `callback` parameter in the `loopOnDirStructure` function is a function that
 * will be called for each item in the directory structure. It takes an object as an argument with the
 * following properties:
 * @param [initialPath=.] - The `initialPath` parameter in the `loopOnDirStructure` function represents
 * the starting path from which the directory structure traversal will begin. It defaults to `'.'`,
 * which typically represents the current directory. You can provide a different starting path if you
 * want the traversal to start from a specific directory within
 */
export function loopOnDirStructure(
	structure: TDirStructure,
	callback: (args: {
		path: string;
		value: TDirStructure[string];
		key: keyof TDirStructure;
	}) => void,
	initialPath = '.',
) {
	logger.debugFn(arguments);

	const isContent: typeof _.isString = (arg: TDirStructure[string]) => _.isString(arg);
	const isDirectory: typeof _.isObject = (arg: TDirStructure[string]) => _.isObject(arg);
	const walker = (obj: typeof structure, path: string) => {
		logger.debugFn(arguments);

		const keys = Object.keys(obj);
		logger.debugVar('keys', keys);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			logger.debugVar('key', key);

			const value = obj[key];
			logger.debugVar('value', value);

			const updatedPath = `${path}/${key}`;
			logger.debugVar('updatedPath', updatedPath);

			if (isContent(value)) {
				logger.debug('Content found');

				const pathContent = { path: updatedPath, content: value };
				logger.debugVar('pathContent', pathContent);

				callback({ path: updatedPath, value, key });
			} else if (isDirectory(value)) {
				logger.debug('Directory found');

				callback({ path: updatedPath, value, key });

				walker(value, updatedPath);
			} else {
				logger.debug('Unknown type');
			}
		}
	};

	walker(structure, initialPath);
}
