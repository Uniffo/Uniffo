// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { pathExist } from '../path_exist/path_exist.ts';
import { cwd } from '../cwd/cwd.ts';

const iAmInTopLevelOfUniffoProject = async (path: string) => {
	const topLevelKeys = Object.keys(CLI_PROJECT_STRUCTURE);
	for (let i = 0; i < topLevelKeys.length; i++) {
		const partOfPath = topLevelKeys[i];
		const pathToCheck = `${path}/${partOfPath}`;

		if (!await pathExist(`${pathToCheck}`)) {
			return false;
		}
	}

	return true;
};

const findTopLevelOfUniffoProject = async (path: string) => {
	const explodedPath = path.split('/');

	while (explodedPath.length) {
		const reconstructedPath = explodedPath.join('/');

		if (await iAmInTopLevelOfUniffoProject(reconstructedPath)) {
			return path;
		}

		explodedPath.pop();
	}

	return false;
};

/**
 * The function `pwd` in TypeScript returns the top level directory of a Uniffo project by using the
 * `findTopLevelOfUniffoProject` function with the current working directory `cwd()`.
 * @returns The `pwd` function is being exported as a constant. It is an asynchronous function that
 * returns the top level directory of a Uniffo project by calling the `findTopLevelOfUniffoProject` function
 * with the current working directory obtained from `cwd()`.
 */
export const pwd = async () => {
	return await findTopLevelOfUniffoProject(cwd());
};
