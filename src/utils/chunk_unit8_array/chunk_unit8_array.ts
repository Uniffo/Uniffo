import { logger } from '../../global/logger.ts';

export function chunkUint8Array(data: Uint8Array, chunkSize: number): Uint8Array[] {
    logger.debugFn(arguments);

    const chunks: Uint8Array[] = [];
    logger.debugVar('chunks', chunks);

    for (let i = 0; i < data.length; i += chunkSize) {
        const singleChunkBeginIndex = i;
        logger.debugVar('singleChunkBeginIndex', singleChunkBeginIndex);

        const singleChunkEndIndex = i + chunkSize;
        logger.debugVar('singleChunkEndIndex', singleChunkEndIndex);

        const singleChunk = data.subarray(singleChunkBeginIndex, singleChunkEndIndex);
        logger.debugVar('singleChunk', singleChunk);

        logger.debug('Pushing single chunk to chunks...');
        chunks.push(singleChunk);
    }

    logger.debugVar('chunks', chunks);

    return chunks;
}
