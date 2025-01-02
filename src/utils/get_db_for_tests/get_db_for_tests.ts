// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { fromFileUrl } from '@std/path/from-file-url';
import { classDatabase } from '../../classes/database/database.ts';
import { classDatabaseServer } from '../../classes/database_server/database_server.ts';
import { classDatabaseSqlLite } from '../../classes/database_sqllite/database_sqllite.ts';
import { DB_SCHEMA } from '../../constants/DB_SCHEMA.ts';
import { pathExist, pathExistSync } from '../path_exist/path_exist.ts';
import { generateUniqueBasename } from '../generate_unique_basename/generate_unique_basename.ts';
import { logger } from '../../global/logger.ts';

export async function getDbForTests() {
	logger.debugFn(arguments);

	const testDir = `${fromFileUrl(import.meta.resolve('../../..'))}/${await generateUniqueBasename(
		{
			basePath: fromFileUrl(import.meta.resolve('../../..')),
			prefix: `test_db_for_tests_`,
		},
	)}`;
	logger.debugVar('testDir', testDir);

	if (!await pathExist(testDir)) {
		Deno.mkdirSync(testDir, { recursive: true });
		logger.debug(`Directory "${testDir}" created!`);
	}

	const testSocket = `${testDir}/socket.sock`;
	logger.debugVar('testSocket', testSocket);

	const db = new classDatabaseSqlLite({
		schema: DB_SCHEMA.json,
		path: `${testDir}`,
	});
	logger.debugVar('db', db);

	const dbServer = new classDatabaseServer({
		unixSocket: testSocket,
		sqlLiteDatabase: db,
	});
	logger.debugVar('dbServer', dbServer);

	const dbClient = new classDatabase({ dbSchema: DB_SCHEMA, dbServerSocketPath: testSocket });
	logger.debugVar('dbClient', dbClient);

	await dbServer.start();
	dbServer.listen();

	await dbClient.init();

	const destroy = async () => {
		await dbClient.destroySession();

		await dbServer.stop();

		if (pathExistSync(testDir)) {
			await Deno.remove(testDir, { recursive: true });
		}
	};

	return { database: dbClient, server: dbServer, destroy };
}
