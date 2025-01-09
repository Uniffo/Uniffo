// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classDatabaseServer } from '../../classes/database_server/database_server.ts';
import { classDatabaseSqlLite } from '../../classes/database_sqllite/database_sqllite.ts';
import { DB_SCHEMA } from '../../constants/DB_SCHEMA.ts';
import { logger } from '../../global/logger.ts';

export function createDatabaseServer(
    socketPath: string,
    dbDirPath: string,
) {
    logger.debugFn(arguments);

    const db = new classDatabaseSqlLite({
        schema: DB_SCHEMA.json,
        path: `${dbDirPath}`,
    });
    logger.debugVar('db', db);

    const dbServer = new classDatabaseServer({
        unixSocket: socketPath,
        sqlLiteDatabase: db,
    });
    logger.debugVar('dbServer', dbServer);

    return dbServer;
}
