// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { Reflect } from '@dx/reflect';

export const INJECTABLE_METADATA_KEY = Symbol('injectable');

export function Injectable(): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
    };
}