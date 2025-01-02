import { classMainLocalRouter } from '../classes/main_local_router/main_local_router.ts';
import { CLI_DIR } from '../constants/CLI_DIR.ts';
import { CLI_DOCKER_CONTAINER_MAIN_LOCAL_ROUTER_ALIAS } from '../constants/CLI_DOCKER_CONTAINER_MAIN_LOCAL_ROUTER_ALIAS.ts';
import { docker } from './docker.ts';

export const mainLocalRouter = new classMainLocalRouter({
    routerContainer: docker.composeDefinitions().getByName('uniffo-traefik-local-local'),
    routerContainerAlias: CLI_DOCKER_CONTAINER_MAIN_LOCAL_ROUTER_ALIAS,
    routerDirPath: `${CLI_DIR.localRouter}`,
});