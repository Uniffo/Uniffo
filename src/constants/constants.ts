import { parseCliArgs } from '../utils/cli_args/parser.ts';

export const CLI_ARGS = parseCliArgs(Deno.args);
export const UNIFFO_PROJECT_TOP_LEVEL_STRUCTURE = ['uniffo', 'data', 'source', '.uvm'];
export const UNIFFO_DIR = {
	main: `${Deno.env.get('HOME')}/.uniffo`,
	tmp: `${Deno.env.get('HOME')}/tmp`,
	versions: `${Deno.env.get('HOME')}/.uniffo/versions`,
};
