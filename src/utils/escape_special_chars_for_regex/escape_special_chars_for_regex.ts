import { logger } from '../../global/logger.ts';

export function escapeSpecialCharsForRegex(text: string): string {
    logger.debugFn(arguments);

    const specialChars = /[.*+?^${}()|[\]\\]/g;
    logger.debugVar('specialChars', specialChars);

    const escapedText = text.replace(specialChars, '\\$&');
    logger.debugVar('escapedText', escapedText);

    return escapedText;
}