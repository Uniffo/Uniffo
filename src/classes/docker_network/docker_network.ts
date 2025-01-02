import { logger } from '../../global/logger.ts';
import { shell, shellStream } from '../../utils/shell/shell.ts';

export class classDockerNetwork {
    public async getAll() {
        logger.debugFn(arguments);

        const command = ['docker', 'network', 'ls', '--format', 'json'];
        logger.debugVar('command', command);

        const networks = await shell({ cmd: command }).then((output) => {
            if (!output) {
                return [];
            }

            return output.split('\n').filter(p => p).map(function parseNetwork(jsonString: string) {
                logger.debugFn(arguments);

                const parsed = JSON.parse(jsonString);
                logger.debugVar('parsed', parsed);

                return parsed;
            });
        });
        logger.debugVar('networks', networks);

        return networks;
    }

    public async getByName(name: string) {
        logger.debugFn(arguments);

        const networks = await this.getAll();
        logger.debugVar('networks', networks);

        const network = networks.find((network: any) => network?.Name === name);
        logger.debugVar('network', network);

        return network;
    }

    public async isExists(name: string) {
        logger.debugFn(arguments);

        return await this.getByName(name) ? true : false;
    }

    public async create(name: string) {
        logger.debugFn(arguments);

        if (await this.isExists(name)) {
            logger.debug(`Network "${name}" already exists`);
            return;
        }

        logger.info(`Creating network "${name}"`);

        const command = ['docker', 'network', 'create', '--driver', 'bridge', name];
        logger.debugVar('command', command);

        await shellStream({ cmd: command });
    }

    public async remove(name: string) {
        logger.debugFn(arguments);

        if (!await this.isExists(name)) {
            logger.debug(`Network "${name}" does not exist`);
            return;
        }

        logger.info(`Deleting network "${name}"`);

        const command = ['docker', 'network', 'rm', '--force', name];
        logger.debugVar('command', command);

        await shell({ cmd: command });
    }
}