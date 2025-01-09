// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { assertEquals, assertInstanceOf, assertThrows } from '@std/assert';
import { classIocContainer } from './ioc_container.ts';
import { InjectProperty } from './decorators/inject_property.ts';
import { Injectable } from './decorators/injectable.ts';
import { Singleton } from './decorators/singleton.ts';

@Injectable()
class DependencyA {
    greet() {
        return "Hello from DependencyA!";
    }
}

@Singleton()
@Injectable()
class SingletonB {
    getId() {
        return Math.random();
    }
}

@Injectable()
class MainClass {
    @InjectProperty(DependencyA)
    depA!: DependencyA;

    constructor(public message: string) { }
}

Deno.test("classIocContainer - register and resolve", () => {
    const container = new classIocContainer();

    container.register(DependencyA);
    container.register(MainClass, ["Hello, world!"]);

    const instance = container.resolve(MainClass);
    assertInstanceOf(instance, MainClass);
    assertEquals(instance.message, "Hello, world!");

    const depAInstance = instance.depA;
    assertInstanceOf(depAInstance, DependencyA);
    assertEquals(depAInstance.greet(), "Hello from DependencyA!");
});

Deno.test("classIocContainer - Singleton behavior", () => {
    const container = new classIocContainer();

    container.register(SingletonB);

    const instance1 = container.resolve(SingletonB);
    const instance2 = container.resolve(SingletonB);

    assertInstanceOf(instance1, SingletonB);
    assertEquals(instance1, instance2, "Singleton instances should be the same");
});

Deno.test("classIocContainer - throws on unregistered dependency", () => {
    const container = new classIocContainer();

    assertThrows(
        () => container.resolve(DependencyA),
        Error,
        "Dependency 'DependencyA' is not registered.",
    );
});

Deno.test("classIocContainer - inject properties", () => {
    const container = new classIocContainer();

    container.register(DependencyA);
    container.register(MainClass, ["Injected property test"]);

    const instance = container.resolve(MainClass);

    assertEquals(instance.depA.greet(), "Hello from DependencyA!");
});