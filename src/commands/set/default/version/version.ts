// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import type { version } from '../../../../classes/cli_version_manager/cli_version_manager.d.ts';
import type { TCommandArgs, TCommandMeta } from '../../../../classes/command/command.d.ts';
import { classCommand } from '../../../../classes/command/command.ts';
import { logger } from '../../../../global/logger.ts';
import { commandSetDefaultVersionDocs, description } from './version.docs.ts';

const phrase = 'set default version';

class classCommandSetDefaultVersion extends classCommand {
    constructor(args: TCommandArgs) {
        super(args);
        logger.debugFn(arguments);
    }

    public async exec() {
        logger.debugFn(arguments);

        const data = await this.getInputData();

        await this.cliVersionManager.setDefaultVersion(data.release as version);
    }

    public async getInputData() {
        return {
            release: await this.getOrAskForArg({
                name: 'release',
                askMessage: 'Enter Uniffo release version:',
                required: true,
                throwIfInvalid: true,
                validator: this.validateVersion.bind(this),
            }),
        };
    }

    public async validateVersion(version: string) {
        logger.debugFn(arguments);

        const releases = await this.cliVersionManager.getVersionsList();
        logger.debugVar('releases', releases);

        const infoAboutReleases = `Available releases:\n - ${
            releases.map((r) => r.tagName).join('\n - ')
        }`;
        logger.debugVar('infoAboutReleases', infoAboutReleases);

        const validRelease = releases.find((r) => r.tagName == version);
        logger.debugVar('validRelease', validRelease);

        const result = !validRelease ? `Invalid version!\n${infoAboutReleases}` : true;
        logger.debugVar('result', result);

        return result;
    }
}

const meta: TCommandMeta<classCommandSetDefaultVersion> = {
    phrase,
    description,
    documentation: commandSetDefaultVersionDocs,
    class: classCommandSetDefaultVersion,
};

export default meta;
