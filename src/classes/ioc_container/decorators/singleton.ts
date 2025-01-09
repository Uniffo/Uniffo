import { Reflect } from '@dx/reflect';

export const SINGLETON_METADATA_KEY = Symbol('singleton');

export function Singleton(): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(SINGLETON_METADATA_KEY, true, target);
    };
}