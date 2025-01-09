// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { Reflect } from '@dx/reflect';

export const SINGLETON_METADATA_KEY = Symbol('singleton');

export function Singleton(): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(SINGLETON_METADATA_KEY, true, target);
    };
}