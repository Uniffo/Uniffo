// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { CLI_DIR } from '../constants/CLI_DIR.ts';
import { generateUniqueBasename } from '../utils/generate_unique_basename/generate_unique_basename.ts';

export const tmpDir = `${CLI_DIR.tmp}/${await generateUniqueBasename({ basePath: CLI_DIR.tmp })}`;
