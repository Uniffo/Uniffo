// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { logger } from '../../global/logger.ts';
import { escapeSpecialCharsForRegex } from '../../utils/escape_special_chars_for_regex/escape_special_chars_for_regex.ts';
import { shell } from '../../utils/shell/shell.ts';
import { TEtcHostsRow } from './etc_hosts_editor.d.ts';

export class classEtcHostsEditor {
    private path;
    private blocksSectionBegin;
    private blocksSectionEnd;
    constructor(args: { path: string } = { path: '/etc/hosts' }) {
        logger.debugFn(arguments);

        this.path = args.path;
        logger.debugVar('this.path', this.path);

        this.blocksSectionBegin = `# BEGIN - Uniffo`;
        logger.debugVar('this.blocksSectionBegin', this.blocksSectionBegin);

        this.blocksSectionEnd = `# END - Uniffo`;
        logger.debugVar('this.blocksSectionEnd', this.blocksSectionEnd);
    }

    public getContent() {
        logger.debugFn(arguments);

        const content = Deno.readTextFileSync(this.path);
        logger.debugVar('content', content);

        return content;
    }

    private async setContent(content: string) {
        logger.debugFn(arguments);

        logger.info(`Updating ${this.path} file`);

        const escapedContent = JSON.stringify(content);
        logger.debugVar('escapedContent', escapedContent);

        const escapedPath = JSON.stringify(this.path);
        logger.debugVar('escapedPath', escapedPath);

        await shell({ cmd: ['sudo', 'sh', '-c', `echo ${escapedContent} > ${escapedPath}`] });

        logger.info(`Updated ${this.path} file`);
    }

    public async addRow(row: TEtcHostsRow) {
        logger.debugFn(arguments);

        const rowString = `${row.ip} ${row.domain}`;
        logger.debugVar('rowString', rowString);

        let content = this.getContent();
        logger.debugVar('content', content);

        if (this.isRowExists({ row, content })) {
            logger.debug(`Row "${rowString}" already exists in "${this.path}"`);
            return;
        }

        logger.info(`Adding row "${rowString}" to "${this.path}"`);

        content = this.addBlockSection(content);
        logger.debugVar('content', content);

        content = content.replace(this.blocksSectionEnd, `${rowString}\n${this.blocksSectionEnd}`);
        logger.debugVar('content', content);

        await this.setContent(content);
    }

    public async removeRow(row: TEtcHostsRow) {
        logger.debugFn(arguments);

        const rowString = `${row.ip} ${row.domain}`;
        logger.debugVar('rowString', rowString);

        let content = this.getContent();
        logger.debugVar('content', content);

        if (!this.isRowExists({ row, content })) {
            logger.debug(`Row "${rowString}" doesn't exists in "${this.path}"`);
            return;
        }

        logger.info(`Removing row "${rowString}" from "${this.path}"`);

        const escapedIp = escapeSpecialCharsForRegex(row.ip);
        logger.debugVar('escapedIp', escapedIp);

        const escapedDomain = escapeSpecialCharsForRegex(row.domain);
        logger.debugVar('escapedDomain', escapedDomain);

        const replaceRegex = new RegExp(
            `^(?:\\s)*${escapedIp} +${escapedDomain} *$`,
            'm'
        );
        logger.debugVar('replaceRegex', replaceRegex);

        content = content.replace(replaceRegex, "");
        logger.debugVar('content', content);

        await this.setContent(content);
    }

    public async removeAllRows() {
        logger.debugFn(arguments);

        let content = this.getContent();
        logger.debugVar('content', content);

        content = this.removeBlockSection(content);
        logger.debugVar('content', content);

        await this.setContent(content);
    }

    private isRowExists(args: { content: string, row: TEtcHostsRow }) {
        logger.debugFn(arguments);

        const escapedIp = escapeSpecialCharsForRegex(args.row.ip);
        logger.debugVar('escapedIp', escapedIp);

        const escapedDomain = escapeSpecialCharsForRegex(args.row.domain);
        logger.debugVar('escapedDomain', escapedDomain);

        const testRegex = new RegExp(
            `^(?!\\s)*${escapedIp} +${escapedDomain} *$`,
            'm'
        );
        logger.debugVar('testRegex', testRegex);

        const rowExists = testRegex.test(args.content);
        logger.debugVar('rowExists', rowExists);

        return rowExists;
    }

    private isBlocksSectionExists(content: string) {
        logger.debugFn(arguments);

        const escapedBlocksSectionBegin = escapeSpecialCharsForRegex(this.blocksSectionBegin);
        logger.debugVar('escapedBlocksSectionBegin', escapedBlocksSectionBegin);

        const escapedBlocksSectionEnd = escapeSpecialCharsForRegex(this.blocksSectionEnd);
        logger.debugVar('escapedBlocksSectionEnd', escapedBlocksSectionEnd);

        const testRegex = new RegExp(
            `^(?!\\s)*${escapedBlocksSectionBegin}\\s*(.*\\s)*(?!\\s)*${escapedBlocksSectionEnd}\\s*$`,
            'm'
        );
        logger.debugVar('testRegex', testRegex);

        const blocksSectionExists = testRegex.test(content);
        logger.debugVar('blocksSectionExists', blocksSectionExists);

        return blocksSectionExists;
    }

    private addBlockSection(content: string) {
        logger.debugFn(arguments);

        if (this.isBlocksSectionExists(content)) {
            logger.debug(`Blocks section already exists in ${this.path}`);
            return content;
        }

        logger.info(`Adding block section to ${this.path}`);

        const newContent = `${content}\n${this.blocksSectionBegin}\n${this.blocksSectionEnd}\n`;
        logger.debugVar('newContent', newContent);

        return newContent;
    }

    private removeBlockSection(content: string) {
        logger.debugFn(arguments);

        if (!this.isBlocksSectionExists(content)) {
            logger.debug(`Block section doesn't exists in "${this.path}"`);
            return content;
        }

        logger.info(`Removing block section from ${this.path}`);

        const escapedBlocksSectionBegin = escapeSpecialCharsForRegex(this.blocksSectionBegin);
        logger.debugVar('escapedBlocksSectionBegin', escapedBlocksSectionBegin);

        const escapedBlocksSectionEnd = escapeSpecialCharsForRegex(this.blocksSectionEnd);
        logger.debugVar('escapedBlocksSectionEnd', escapedBlocksSectionEnd);

        const replaceRegex = new RegExp(
            `^(?:\\s)*${escapedBlocksSectionBegin}\\s*(.*\\s)*(?!\\s)*${escapedBlocksSectionEnd}\\s*$`,
            'm'
        );
        logger.debugVar('replaceRegex', replaceRegex);

        content = content.replace(replaceRegex, "");
        logger.debugVar('content', content);

        return content;
    }
}
