// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classDatabase } from '../classes/database/database.ts';
import { DB_SCHEMA } from '../constants/DB_SCHEMA.ts';
import { DB_SERVER_SOCKET_PATH } from '../constants/DB_SERVER_SOCKET_PATH.ts';

export const database = new classDatabase({
    dbSchema: DB_SCHEMA,
    dbServerSocketPath: DB_SERVER_SOCKET_PATH,
});
