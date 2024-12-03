// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { _ } from '../lodash/lodash.ts';

export function unit8ArrayToString(unit8Array: Uint8Array) {
    logger.debugFn(arguments);

    const string = new TextDecoder().decode(unit8Array);
    logger.debugVar('string', string);

    return string;
}
