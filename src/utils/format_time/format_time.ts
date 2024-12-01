// Copyright 2023-2024 Maciej Koralewski. All rights reserved. EULA license.

export function formatTime(ms: number) {
    const seconds = ms / 1000;
    const minutes = ms / (1000 * 60);
    const hours = ms / (1000 * 60 * 60);
    const days = ms / (1000 * 60 * 60 * 24);

    if (seconds < 60) return `${seconds.toFixed(2)} Seconds`;
    else if (minutes < 60) return `${minutes.toFixed(2)} Minutes`;
    else if (hours < 24) return `${hours.toFixed(2)} Hours`;
    else return `${days.toFixed(2)} Days`;
}
