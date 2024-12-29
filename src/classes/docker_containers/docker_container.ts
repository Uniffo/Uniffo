import { CLI_PROJECT_LOCAL_DOMAIN } from '../../constants/CLI_PROJECT_LOCAL_DOMAIN.ts';
import { CLI_PROJECT_PUBLIC_NETWORK_NAME } from '../../constants/CLI_PROJECT_PUBLIC_NETWORK_NAME.ts';
import { CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH.ts';
import { CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH } from '../../constants/CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH.ts';
import { logger } from '../../global/logger.ts';
import { DOCKER_CONTAINERS_DICTIONARY } from '../../pre_compiled/__docker_containers_definitions.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { TDirStructure } from '../../utils/map_dir_structure_to_path_content_array/map_dir_structure_to_path_content_array.d.ts';

export class classDockerContainer {
    private _name;
    private _structure;
    private _allowedForUser;

    constructor(args: { name: typeof DOCKER_CONTAINERS_DICTIONARY[number], allowedForUser: boolean, structure: TDirStructure }) {
        logger.debugFn(arguments);

        this._name = args.name;
        logger.debugVar('this._name', this._name);

        this._structure = args.structure;
        logger.debugVar('this._structure', this._structure);

        this._allowedForUser = args.allowedForUser;
        logger.debugVar('this._allowedForUser', this._allowedForUser);
    }

    public getName() {
        logger.debugFn(arguments);

        logger.debugVar('this._name', this._name);

        return this._name;
    }

    public getStructure<T = TDirStructure>(alias?: string) {
        logger.debugFn(arguments);

        const structure = this.compileStructure(alias || this.getName());

        logger.debugVar('structure', structure);

        return structure as T;
    }

    public isAllowedForUser() {
        logger.debugFn(arguments);

        logger.debugVar('this._allowedForUser', this._allowedForUser);

        return this._allowedForUser;
    }

    private getCompileReplaceMap(args: { alias: string }) {
        logger.debugFn(arguments);

        const replaceMap = {
            '${{REPLACE_CONTAINER_NAME}}': args.alias,
            '${{REPLACE_CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH}}': CLI_PROJECT_STRUCTURE_ENVIRONMENTS_DIR_PATH,
            '${{REPLACE_CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH}}': CLI_PROJECT_STRUCTURE_SOURCE_DIR_PATH,
            '${{REPLACE_UNIFFO_PUBLIC_NETWORK_NAME}}': CLI_PROJECT_PUBLIC_NETWORK_NAME,
            '${{REPLACE_UNIFFO_LOCAL_DOMAIN}}': CLI_PROJECT_LOCAL_DOMAIN,
        }
        logger.debugVar('replaceMap', replaceMap);

        return replaceMap;
    }

    private compileStructure(
        alias: string,
    ) {
        const newStructure = _.cloneDeep(this._structure);
        logger.debugVar('newStructure', newStructure);

        const replaceMap = this.getCompileReplaceMap({ alias });
        const replaceMapKeys = Object.keys(replaceMap) as (keyof typeof replaceMap)[];
        logger.debugVar('replaceMapKeys', replaceMapKeys);

        const compile = (value: any) => {
            const isString = _.isString(value);
            logger.debugVar('isString', isString);

            if (!isString) {
                return value;
            }

            let compiled = value;

            for (let i = 0; i < replaceMapKeys.length; i++) {
                const toReplace = replaceMapKeys[i];
                logger.debugVar('toReplace', toReplace);

                const replaceBy = replaceMap[toReplace];
                logger.debugVar('replaceBy', replaceBy);

                compiled = compiled.replaceAll(toReplace, replaceBy);
                logger.debugVar('compiled', compiled);
            }

            logger.debugVar('compiled', compiled);

            return compiled;
        }

        const walkThrough = (currentObj: object, currentPath: string[]) => {
            for (const [key, value] of Object.entries(currentObj)) {
                const newKey = compile(key);
                logger.debugVar('newKey', newKey);

                const newPath = [...currentPath, newKey];
                logger.debugVar('newPath', newPath);

                const newValue = compile(value);
                logger.debugVar('newValue', newValue);

                _.unset(newStructure, [...currentPath, key]);
                _.set(newStructure, newPath, newValue);

                if (_.isPlainObject(newValue)) {
                    walkThrough(newValue, newPath);
                }
            }
        };

        walkThrough(newStructure, []);

        logger.debugVar('newStructure', newStructure);

        return newStructure;
    }
}