// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

export type TClass<T extends new (...args: any[]) => any = any> = new (...args: ConstructorParameters<T>) => InstanceType<T>;

export type TRegistryValue<T extends TClass = any> = {
    classDefinition: TClass<T>;
    defaultArgs?: ConstructorParameters<TClass<T>>;
}