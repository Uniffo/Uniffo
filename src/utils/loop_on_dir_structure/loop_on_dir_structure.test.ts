// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals } from '@std/assert';
import { loopOnDirStructure } from './loop_on_dir_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { CLI_PROJECT_STRUCTURE_EMPTY_DIR } from '../../constants/CLI_PROJECT_STRUCTURE_EMPTY_DIR.ts';
import type { TDirStructure } from '../map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';

Deno.test('loopOnDirStructure', function testLoopOnDirStructure() {
	const testStructure = Object.assign(CLI_PROJECT_STRUCTURE, {
		testDir: { emptyTestDir: CLI_PROJECT_STRUCTURE_EMPTY_DIR, testFile: 'test content' },
	}) as TDirStructure;

	const customKeys = ['testDir', 'emptyTestDir', 'testFile'];
	const customPathsIncludes = ['testDir', 'testDir/emptyTestDir', 'testFile', 'testDir/testFile'];
	const customValue = [['testFile', 'test content']];
	const pass = {
		keys: [] as string[],
		paths: [] as string[],
		values: [] as [string, string][],
	};

	loopOnDirStructure(testStructure, ({ path, value, key }) => {
		customKeys.forEach((ckey) => {
			if (key != ckey) {
				return;
			}

			pass.keys.push(ckey);
		});

		customPathsIncludes.forEach((cpath) => {
			if (!path.includes(cpath) || pass.paths.includes(cpath)) {
				return;
			}

			pass.paths.push(cpath);
		});

		customValue.forEach((cvalue) => {
			if (cvalue[1] !== value || cvalue[0] !== key) {
				return;
			}

			pass.values.push([cvalue[0], cvalue[1]]);
		});
	});

	assertEquals(pass, { keys: customKeys, paths: customPathsIncludes, values: customValue });
});
