import { logger } from '../../global/logger.ts';
import { shell, shellStream } from '../../utils/shell/shell.ts';

export class classDockerCompose {
    private projectDir: string;
    private rootDotEnvFile: string;
    constructor(args: { projectDir: string, rootDotEnvFile: string }) {
        logger.debugFn(arguments);

        this.projectDir = args.projectDir;
        logger.debugVar('this.projectDir', this.projectDir);

        this.rootDotEnvFile = args.rootDotEnvFile;
        logger.debugVar('this.rootDotEnvFile', this.rootDotEnvFile);
    }

    public getRootDotEnvFile() {
        logger.debugFn(arguments);

        logger.debugVar('this.rootDotEnvFile', this.rootDotEnvFile);

        return this.rootDotEnvFile;
    }

    public getProjectDir() {
        logger.debugFn(arguments);

        logger.debugVar('this.projectDir', this.projectDir);

        return this.projectDir;
    }

    public getDockerComposeCmd() {
        logger.debugFn(arguments);

        const command = [`docker`, `compose`, `--env-file`, this.getRootDotEnvFile()];
        logger.debugVar('command', command);

        return command;
    }

    private extendCommand(command: string[], extra: string[]) {
        logger.debugFn(arguments);

        const extendedCommand = [...command, ...extra];
        logger.debugVar('extendedCommand', extendedCommand);

        return extendedCommand;
    }

    public async ps(extra: string[] = ['--all']) {
        logger.debugFn(arguments);

        const command = this.extendCommand(this.getDockerComposeCmd(), ['ps', '--format', 'json', ...extra]);
        logger.debugVar('command', command);

        const composePsOutput = await shell({ cwd: this.getProjectDir(), cmd: command }).then((output) => output ? JSON.parse(output) : output);
        logger.debugVar('composePsOutput', composePsOutput);

        return composePsOutput;
    }

    public up(extra: string[] = ['-d']) {
        logger.debugFn(arguments);

        const command = this.extendCommand(this.getDockerComposeCmd(), ['up', ...extra]);
        logger.debugVar('command', command);

        return shellStream({ cwd: this.getProjectDir(), cmd: command });
    }

    public down(extra: string[] = []) {
        logger.debugFn(arguments);

        const command = this.extendCommand(this.getDockerComposeCmd(), ['down', ...extra]);
        logger.debugVar('command', command);

        return shellStream({ cwd: this.getProjectDir(), cmd: command });
    }
}