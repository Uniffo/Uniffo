import { logger } from '../../global/logger.ts';

export function mapProvidedContainersToObject(containers: string) {
    logger.debugFn(arguments);

    const splitted = containers.split(',');
    logger.debugVar('splitted', splitted);

    const mapped = splitted.map((providedValue) => {
        logger.debugVar('providedValue', providedValue);

        const valueSplitedWithColon = providedValue.split(':');
        logger.debugVar('valueSplitedWithColon', valueSplitedWithColon);

        const containerName = valueSplitedWithColon[0];
        logger.debugVar('containerName', containerName);

        const containerAlias = valueSplitedWithColon[1];
        logger.debugVar('containerAlias', containerAlias);

        const mappedValue = {
            name: containerName,
            alias: containerAlias,
        };
        logger.debugVar('mappedValue', mappedValue);

        return mappedValue;
    });
    logger.debugVar('mapped', mapped);

    return mapped;
}
