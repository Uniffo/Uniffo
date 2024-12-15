export type TNestedObject = {
	[key: string]: string | number | boolean | undefined | null | TNestedObject | TNestedObject[];
};
