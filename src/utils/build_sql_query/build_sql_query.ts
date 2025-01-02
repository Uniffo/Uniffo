// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { compile, tql } from '@arekx/teeql';

export function build_sql_query(strings: TemplateStringsArray, ...expressions: any[]) {
    return compile(tql(strings, ...expressions));
}

export const bsq = build_sql_query;
