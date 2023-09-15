import { UNIFFO_PROJECT_TOP_LEVEL_STRUCTURE } from '../../constants/constants.ts';
import { logger } from '../../entry.ts';
import { pathExist } from '../path/exist.ts';
import { cwd } from './cwd.ts';

const iAmInTopLevelOfUniffoProject = async (path: string) => {
	for (let i = 0; i < UNIFFO_PROJECT_TOP_LEVEL_STRUCTURE.length; i++) {
		const partOfPath = UNIFFO_PROJECT_TOP_LEVEL_STRUCTURE[i];
		const pathToCheck = `${path}/${partOfPath}`;

		logger.debug(pathToCheck);

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
 * The function `pwd` returns the top level directory of the Uniffo project.
 * @returns The `pwd` function is returning the result of the `findTopLevelOfUniffoProject` function
 * called with the current working directory (`cwd()`) as its argument.
 */
export const pwd = async () => {
	return await findTopLevelOfUniffoProject(cwd());
};
