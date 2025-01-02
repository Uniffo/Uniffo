import { assert } from '@std/assert';
import { cwd } from '../../utils/cwd/cwd.ts';
import { generateUniqueBasename } from '../../utils/generate_unique_basename/generate_unique_basename.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { classMainLocalRouter } from './main_local_router.ts';
import { docker } from '../../global/docker.ts';
import { pathExistSync } from '../../utils/path_exist/path_exist.ts';

Deno.test('classMainLocalRouter', async function testClassMainLocalRouter() {
    const testDir = `${cwd()}/${await generateUniqueBasename({
        basePath: cwd(),
        prefix: `test_cmlr_`,
    })}`;

    Deno.mkdirSync(testDir);

    const args = {
        routerContainer: docker.composeDefinitions().getByName('uniffo-traefik-local'),
        routerContainerAlias: 'test-uniffo-local-router',
        routerDirPath: testDir
    }

    const routerContainer = new classMainLocalRouter(args);

    assert(await noError(async () => { await routerContainer.install(); }), 'Install router container');
    assert(!await routerContainer.isRunning(), 'Router container is not running');
    assert(await noError(async () => { await routerContainer.up(); }), 'Start router container');
    assert(await routerContainer.isRunning(), 'Router container is running');
    assert(await noError(async () => { await routerContainer.down(); }), 'Stop router container');
    assert(!await routerContainer.isRunning(), 'Router container is not running');
    assert(await noError(async () => { await routerContainer.uninstall(); }), 'Uninstall router container');

    if (pathExistSync(testDir)) {
        Deno.removeSync(testDir, { recursive: true });
    }
});