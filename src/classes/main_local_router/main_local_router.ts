// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { CLI_DOCKER_MAIN_LOCAL_NETWORK_NAME } from '../../constants/CLI_DOCKER_MAIN_LOCAL_NETWORK_NAME.ts';
import { CLI_PROJECT_LOCAL_DOMAIN } from '../../constants/CLI_PROJECT_LOCAL_DOMAIN.ts';
import { LOCAL_IP_ADDRESS } from '../../constants/LOCAL_IP_ADDRESS.ts';
import { docker } from '../../global/docker.ts';
import { etcHostsManager } from '../../global/etc_hosts_manager.ts';
import { logger } from '../../global/logger.ts';
import { ensureDirStructure } from '../../utils/ensure_dir_structure/ensure_dir_structure.ts';
import { shell } from '../../utils/shell/shell.ts';
import { classDockerContainer } from '../docker_containers/docker_container.ts';

export class classMainLocalRouter {
    private routerContainer: classDockerContainer;
    private routerDirPath: string;
    private routerContainerAlias: string;
    private localDomain: string;
    constructor(args: { routerContainer: classDockerContainer, routerContainerAlias: string, routerDirPath: string }) {
        logger.debugFn(arguments);

        this.routerContainer = args.routerContainer;
        logger.debugVar('this.routerContainer', this.routerContainer);

        this.routerContainerAlias = args.routerContainerAlias;
        logger.debugVar('this.routerContainerAlias', this.routerContainerAlias);

        this.routerDirPath = args.routerDirPath;
        logger.debugVar('this.routerDirPath', this.routerDirPath);

        this.localDomain = CLI_PROJECT_LOCAL_DOMAIN;
        logger.debugVar('this.localDomain', this.localDomain);
    }

    public getRouterContainer() {
        logger.debugFn(arguments);

        logger.debugVar('this.routerContainer', this.routerContainer);

        return this.routerContainer;
    }

    public getRouterDirPath() {
        logger.debugFn(arguments);

        logger.debugVar('this.routerDirPath', this.routerDirPath);

        return this.routerDirPath;
    }

    public getRouterContainerAlias() {
        logger.debugFn(arguments);

        logger.debugVar('this.routerContainerAlias', this.routerContainerAlias);

        return this.routerContainerAlias;
    }

    public getLocalDomain() {
        logger.debugFn(arguments);

        logger.debugVar('this.localDomain', this.localDomain);

        return this.localDomain;
    }

    public getRouterContainerDomain() {
        logger.debugFn(arguments);

        const domain = `${this.getRouterContainerAlias()}.${this.getLocalDomain()}`;
        logger.debugVar('domain', domain);

        return domain;
    }

    public async install() {
        logger.debugFn(arguments);

        await this.ensureLocalDomainInEtcHosts();

        await ensureDirStructure(
            this.getRouterContainer().getStructure(this.getRouterContainerAlias()),
            this.getRouterDirPath()
        );

        await this.generateCerts();
    }

    public async uninstall() {
        logger.debugFn(arguments);

        await this.down();

        await etcHostsManager.removeAllRows();

        Deno.removeSync(this.getRouterDirPath(), { recursive: true });
    }

    public async up() {
        logger.debugFn(arguments);

        if (await this.isRunning()) {
            logger.info(`Router container is already running`);
            return;
        }

        logger.info(`Starting router container`);

        await docker.network().create(CLI_DOCKER_MAIN_LOCAL_NETWORK_NAME);

        await this.getDockerCompose().up(['-d', '--wait']);

        logger.info(`Router container started`);
    }

    public async down() {
        logger.debugFn(arguments);

        if (!await this.isRunning()) {
            logger.info(`Router container is already stopped`);
            return;
        }

        logger.info(`Stopping router container`);

        await this.getDockerCompose().down();

        await docker.network().remove(CLI_DOCKER_MAIN_LOCAL_NETWORK_NAME);
    }

    public getCertDirPath() {
        logger.debugFn(arguments);

        const certDirPath = `${this.getRouterDirPath()}/certs`;
        logger.debugVar('certDirPath', certDirPath);

        return certDirPath;
    }

    public async generateCerts() {
        logger.debugFn(arguments);

        logger.info(`Generating certs`);

        await shell({ cmd: [`mkcert`, `-install`] });

        await shell({
            cwd: this.getCertDirPath(),
            cmd: [`mkcert`, `-cert-file=local-cert.pem`, `-key-file=local-key.pem`, `*.${this.getLocalDomain()}`, this.getLocalDomain()]
        });
    }

    public async isRunning() {
        const composeInfo = await this.getDockerCompose().ps();
        logger.debugVar('composeInfo', composeInfo);

        const state = composeInfo?.State;
        logger.debugVar('state', state);

        if (state === 'running') {
            return true;
        }

        return false;
    }

    private async ensureLocalDomainInEtcHosts() {
        logger.debugFn(arguments);

        await etcHostsManager.addRow({ ip: LOCAL_IP_ADDRESS, domain: this.getRouterContainerDomain() });
    }

    private getDockerCompose() {
        logger.debugFn(arguments);

        const dockerCompose = docker.compose({ projectDir: this.getRouterDirPath(), rootDotEnvFile: `./.env` });
        logger.debugVar('dockerCompose', dockerCompose);

        return dockerCompose;
    }
}