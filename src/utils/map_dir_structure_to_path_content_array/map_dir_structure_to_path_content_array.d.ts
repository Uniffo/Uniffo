// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

export type TDirStructure = {
    [key: string]: string | TDirStructure;
};
