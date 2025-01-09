import { Reflect } from '@dx/reflect';
import { TClass } from '../ioc_container.d.ts';


export const INJECT_PROPERTY_METADATA_KEY = 'custom:inject_property';

export function InjectProperty<T extends TClass<T>>(dependencyClass: T, args?: ConstructorParameters<T>): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const existingInjectedProps: Array<{ propertyKey: string | symbol; dependencyKey: any, args?: any[] }> =
            Reflect.getMetadata(INJECT_PROPERTY_METADATA_KEY, target.constructor) || [];

        existingInjectedProps.push({ propertyKey, dependencyKey: dependencyClass.name, args });

        Reflect.defineMetadata(INJECT_PROPERTY_METADATA_KEY, existingInjectedProps, target.constructor);
    };
}
