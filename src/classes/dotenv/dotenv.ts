import { logger } from '../../global/logger.ts';
import { parse, stringify } from '@std/dotenv';

export class classDotenv {
    private path;

    constructor(path: string) {
        logger.debugFn(arguments);

        this.path = path;
        logger.debugVar('this.path', this.path);
    }

    public getPath() {
        logger.debugFn(arguments);

        const path = this.path;
        logger.debugVar('path', path);

        return path;
    }

    public getAll() {
        logger.debugFn(arguments);

        return parse(Deno.readTextFileSync(this.getPath()));
    }

    public getVariable(name: string) {
        const variable = this.getAll()[name];
        logger.debugVar('variable', variable);

        return variable;
    }

    public setVariable(name: string, value: string) {
        logger.debugFn(arguments);

        const dotenvObject = this.getAll();
        dotenvObject[name] = value;
        logger.debugVar('dotenvObject', dotenvObject);

        this.update(dotenvObject);
    }

    public update(dotenv: ReturnType<typeof this.getAll>) {
        logger.debugFn(arguments);

        const stringified = stringify(dotenv);
        logger.debugVar('stringified', stringified);

        Deno.writeTextFileSync(this.getPath(), stringified);
    }
}
