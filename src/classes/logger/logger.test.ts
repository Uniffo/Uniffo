import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { classLogger } from './logger.ts';
import { assertGreater } from 'https://deno.land/std@0.201.0/assert/assert_greater.ts';
import { ansiColors } from './colors.ts';
import { noError } from '../../utils/error/no_error.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';

Deno.test('classLogger', async function testClassLogger() {
	const logger = new classLogger();
	const logsData: ReturnType<typeof logger.getAllLogs> = [{
		message: 'log',
		logType: 'log',
	}, {
		message: 'debug',
		logType: 'debug',
	}, {
		message: 'info',
		logType: 'info',
	}, {
		message: 'error',
		logType: 'error',
	}, {
		message: 'success',
		logType: 'success',
	}];

	logsData.forEach((log) => {
		// deno-lint-ignore no-explicit-any
		(logger as any)[log.logType](log.message);
	});

	logger.omitStorage(true);
	logger.log('omited');
	logger.omitStorage(false);

	const logsLength = logger.getLength();
	const logsWeight = logger.getWeight('b');
	const logsWeightKb = logger.getWeight('kb');
	const logsWeightMb = logger.getWeight('mb');
	const logs = logger.getAllLogs();
	const lastLog = logger.getLastLog();

	assertEquals(logsLength, 5, 'logs length');
	assertGreater(logsWeight, 0, 'logs weight');
	assertEquals(logsWeightKb, logsWeight / 1024, 'logs weight kb');
	assertEquals(logsWeightMb, logsWeight / 1024 / 1024, 'logs weight mb');
	assertEquals(logs, logsData, 'logs storage');
	assertEquals(lastLog, logsData[logsData.length - 1], 'last log');

	const logger1 = new classLogger({ omitStorage: false, maxWeight: 0 });

	assertEquals(logger1['getMessageColor'](''), ansiColors.Reset, 'default color');

	logger1.log('max weight is default!');

	assert(
		await noError(() => {
			logger1.displayDebug(true);
		}),
		'display debug',
	);

	assert(
		await noError(() => {
			logger1.displayDate(true);
		}),
		'display date',
	);

	logger1.info('info message!');

	const maxWeight = 1024 * 1024 * 2;
	const logger2 = new classLogger({ omitStorage: false, maxWeight });
	const testMessage = new Array(1000).fill('test message.').join(' ');
	const testLog = () => logger2.debug(testMessage);

	logger2.displayDebug(false);

	testLog();

	const weight = logger2.getWeight();

	const loopsToForceOptimization = Math.ceil(maxWeight / weight);

	logger1.info('start test for memory optimization');

	for (let i = 0; i < loopsToForceOptimization; i++) {
		testLog();
	}

	assert(maxWeight >= logger2.getWeight(), 'max weight');
});
