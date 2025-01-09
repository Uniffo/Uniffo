// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { basename } from '@std/path/basename';

export const getBasename = (path: string) => {
	return basename(path);
};
