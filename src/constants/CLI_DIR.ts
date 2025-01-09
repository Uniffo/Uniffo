// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

export const CLI_DIR = {
	main: `${Deno.env.get('HOME')}/.uniffo`,
	tmp: `${Deno.env.get('HOME')}/.uniffo/tmp`,
	versions: `${Deno.env.get('HOME')}/.uniffo/versions`,
	localStorage: `${Deno.env.get('HOME')}/.uniffo/localStorage`,
	localRouter: `${Deno.env.get('HOME')}/.uniffo/localRouter`,
};
