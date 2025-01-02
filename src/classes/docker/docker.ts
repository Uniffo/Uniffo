import { logger } from '../../global/logger.ts';
import { DOCKER_CONTAINERS_DEFINITIONS } from '../../pre_compiled/__docker_containers_definitions.ts';
import { classDockerCompose } from '../docker_compose/docker_compose.ts';
import classDockerContainers from '../docker_containers/docker_containers.ts';
import { classDockerNetwork } from '../docker_network/docker_network.ts';

export class classDocker {
    public composeDefinitions() {
        logger.debugFn(arguments);

        const composeDefinitions = new classDockerContainers(DOCKER_CONTAINERS_DEFINITIONS);
        logger.debugVar('composeDefinitions', composeDefinitions);

        return composeDefinitions;
    }

    public compose(args: ConstructorParameters<typeof classDockerCompose>[0]) {
        logger.debugFn(arguments);

        const compose = new classDockerCompose(args);
        logger.debugVar('compose', compose);

        return compose;
    }

    public network() {
        logger.debugFn(arguments);

        const network = new classDockerNetwork();
        logger.debugVar('network', network);

        return network;
    }
}