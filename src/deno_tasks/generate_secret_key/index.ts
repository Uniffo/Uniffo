// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { generateSecretKey } from './generate_secret_key.ts';

const CWD = Deno.cwd();
const PRECOMPILED_DIR = `${CWD}/src/pre_compiled`;

await (async function () {
	await generateSecretKey(`${CWD}/SECRET_KEY`, `${PRECOMPILED_DIR}/__secret_key.ts`);
})();
