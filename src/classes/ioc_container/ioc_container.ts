import { Reflect } from '@dx/reflect';
import { logger } from '../../global/logger.ts';
import { INJECTABLE_METADATA_KEY } from './decorators/injectable.ts';
import { SINGLETON_METADATA_KEY } from './decorators/singleton.ts';
import { INJECT_PROPERTY_METADATA_KEY } from './decorators/inject_property.ts';
import { TClass, TRegistryValue } from './ioc_container.d.ts';
import { _ } from '../../utils/lodash/lodash.ts';

export class classIocContainer {
    private registry = new Map<string, TRegistryValue>();
    private singletons = new Map<string, InstanceType<TRegistryValue['classDefinition']>>();

    constructor() {
        logger.debugFn(arguments);
    }

    private isSingleton(key: string) {
        logger.debugFn(arguments);;

        const isSingleton = !!Reflect.getMetadata(SINGLETON_METADATA_KEY, this.getRegistryRecord(key).classDefinition);
        logger.debugVar('isSingleton', isSingleton);

        return isSingleton;
    }

    private isInjectable<T extends TRegistryValue['classDefinition']>(classDefinition: T) {
        logger.debugFn(arguments);

        const isInjectable = !!Reflect.getMetadata(INJECTABLE_METADATA_KEY, classDefinition);
        logger.debugVar('isInjectable', isInjectable);

        return isInjectable;
    }

    private getRegistryRecord(key: string) {
        logger.debugFn(arguments);

        if (!this.registry.has(key)) {
            throw new Error(`Dependency '${key}' is not registered.`);
        }

        const record = this.registry.get(key) as TRegistryValue;
        logger.debugVar('record', record);

        return record;
    }

    private getInstance(key: string, args?: any[]) {
        logger.debugFn(arguments);

        const record = this.getRegistryRecord(key);
        logger.debugVar('record', record);

        const instance = new record.classDefinition(...(args || record.defaultArgs || []));
        logger.debugVar('instance', instance);

        this.injectProperties(key, instance);

        return instance;
    }

    private injectProperties<T extends TClass>(key: string, instance: InstanceType<T>) {
        logger.debugFn(arguments);

        const record = this.getRegistryRecord(key);
        logger.debugVar('record', record);

        const injectProps: Array<{ propertyKey: string | symbol; dependencyKey: string, args?: any[] }> = Reflect.getMetadata(INJECT_PROPERTY_METADATA_KEY, record.classDefinition) || [];
        logger.debugVar('injectProps', injectProps);

        for (const { propertyKey, dependencyKey, args } of injectProps) {
            logger.debugVar('propertyKey', propertyKey);
            logger.debugVar('dependencyKey', dependencyKey);
            logger.debugVar('args', args);

            const dependencyRecord = this.getRegistryRecord(dependencyKey);
            logger.debugVar('dependencyRecord', dependencyRecord);

            if (!this.isInjectable(dependencyRecord.classDefinition)) {
                throw new Error(`Dependency '${dependencyRecord.classDefinition.name}' is not injectable.`);
            }

            instance[propertyKey] = this.resolve(dependencyRecord.classDefinition, args || dependencyRecord.defaultArgs);
            logger.debugVar(`instance[${propertyKey.toString()}]`, instance[propertyKey]);
        }
    }

    register<T extends TClass<T>>(classDefinition: T, defaultArgs?: ConstructorParameters<T>) {
        logger.debugFn(arguments);

        const key = classDefinition.name;
        logger.debugVar('key', key);

        if (this.registry.has(key)) {
            throw new Error(`Key '${key}' is already registered.`);
        }

        const record = {
            classDefinition,
            defaultArgs,
        }
        logger.debugVar('record', record);

        this.registry.set(key, record);
    }

    resolve<T extends TClass<T>>(classDefinition: T, args?: ConstructorParameters<T>): InstanceType<T> {
        logger.debugFn(arguments);

        const key = classDefinition.name;
        logger.debugVar('key', key);

        if (!this.registry.has(key)) {
            throw new Error(`Dependency '${key}' is not registered.`);
        }

        const isSingleton = this.isSingleton(key);
        logger.debugVar('isSingleton', isSingleton);

        if (isSingleton && this.singletons.has(key)) {
            const instance = this.singletons.get(key)
            logger.debugVar('instance', instance);

            return instance;
        }

        const instance = this.getInstance(key, args);
        logger.debugVar('instance', instance);

        if (isSingleton) {
            this.singletons.set(key, instance)
            logger.debugVar('this.singletons', this.singletons)
        }

        return instance
    }
}
