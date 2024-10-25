// Copyright 2023-2024 Maciej Koralewski. All rights reserved. MIT license.

export const CLI_DIR = {
	main: `${Deno.env.get('HOME')}/.uniffo`,
	tmp: `${Deno.env.get('HOME')}/.uniffo/tmp`,
	versions: `${Deno.env.get('HOME')}/.uniffo/versions`,
	localStorage: `${Deno.env.get('HOME')}/.uniffo/localStorage`,
};
