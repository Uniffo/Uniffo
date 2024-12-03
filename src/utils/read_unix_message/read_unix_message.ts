// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { _ } from '../lodash/lodash.ts';

export async function readUnixMessage(conn: Deno.UnixConn) {
    logger.debugFn(arguments);

    const chunks: Uint8Array[] = [];
    logger.debugVar('chunks', chunks);

    let totalBytesRead = 0;
    logger.debugVar('totalBytesRead', totalBytesRead);

    while (true) {
        const buffer = new Uint8Array(1024);
        const bytesRead = await conn.read(buffer);
        logger.debugVar('buffer', buffer);
        logger.debugVar('bytesRead', bytesRead);

        if (bytesRead === null) {
            logger.debug('End of message');
            break;
        }

        totalBytesRead += bytesRead;
        logger.debugVar('totalBytesRead', totalBytesRead);

        chunks.push(buffer.subarray(0, bytesRead));
        logger.debugVar('chunks', chunks);

        if (bytesRead < buffer.length) {
            logger.debug('End of message');
            break;
        }
    }

    const fullMessage = new Uint8Array(totalBytesRead);
    logger.debugVar('fullMessage', fullMessage);

    let offset = 0;
    logger.debugVar('offset', offset);

    for (const chunk of chunks) {
        fullMessage.set(chunk, offset);
        logger.debugVar('fullMessage', fullMessage);

        offset += chunk.length;
        logger.debugVar('offset', offset);
    }

    return fullMessage;
}
