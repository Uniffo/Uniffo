// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

export type TNestedObject = {
	[key: string]: string | number | boolean | undefined | null | TNestedObject | TNestedObject[];
};
