// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { _ } from '../../utils/lodash/lodash.ts';
import { logger } from '../../global/logger.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { compile, tql } from '@arekx/teeql';
import { readUnixMessage } from '../../utils/read_unix_message/read_unix_message.ts';
import { unit8ArrayToString } from '../../utils/unit8_array_to_string/unit8_array_to_string.ts';
import { chunkUint8Array } from '../../utils/chunk_unit8_array/chunk_unit8_array.ts';

export class classDatabaseClient {
    public unixSocket: string;

    constructor(args: { unixSocket: string }) {
        logger.debugFn(arguments);

        const { unixSocket } = args;

        this.unixSocket = unixSocket;
        logger.debugVar('this.unixSocket', this.unixSocket);
    }

    async connect() {
        logger.debugFn(arguments);

        if (!await pathExist(this.unixSocket)) {
            throw `Database client cannot connect to server! Unix socket does not exist: ${this.unixSocket}`;
        }

        const connection = Deno.connect({
            path: this.unixSocket,
            transport: 'unix',
        });
        logger.debugVar('connection', connection);

        logger.info(`Connected to database server!`);

        return connection;
    }

    async request<T>(connection: Deno.UnixConn, query: string) {
        logger.debugFn(arguments);

        let _throw: Error | undefined = undefined;
        let _response: string | undefined = undefined;

        try {
            logger.debug(`Sending query: ${query}`);

            const unit8ArrayQuery = new TextEncoder().encode(query);
            logger.debugVar('unit8ArrayQuery', unit8ArrayQuery);

            const chunkedUnit8ArrayQuery = chunkUint8Array(unit8ArrayQuery, 1024);
            logger.debugVar('chunkedUnit8ArrayQuery', chunkedUnit8ArrayQuery);

            for (const chunk of chunkedUnit8ArrayQuery) {
                const chunkBytesWritten = await connection.write(chunk);
                logger.debugVar('chunkBytesWritten', chunkBytesWritten);
            }

            const responseUnit8Array = await readUnixMessage(connection);
            logger.debugVar('responseUnit8Array', responseUnit8Array);

            const response = unit8ArrayToString(responseUnit8Array);
            logger.debugVar('response', response);

            if (response.startsWith('Uniffo db service: unexpected error:')) {
                throw response;
            }

            _response = response;
        } catch (error) {
            _throw = error as Error;
        }

        connection.close();
        logger.info(`Connection closed!`);

        if (!_.isUndefined(_throw)) {
            throw _throw;
        }

        if (_.isUndefined(_response)) {
            throw `Response for query is undefined! Query: ${query}`;
        }

        return JSON.parse(_response) as T;
    }

    async query<T>(strings: TemplateStringsArray, ...expressions: any[]) {
        logger.debugFn(arguments);

        const query = compile(tql(strings, ...expressions));

        const connection = await this.connect();
        logger.debugVar('connection', connection);

        const request = await this.request<T[]>(connection, JSON.stringify(query));
        logger.debugVar('request', request);

        if (_.isUndefined(request)) {
            throw `Response for query is undefined! Query: ${query}`;
        }

        return request;
    }
}
