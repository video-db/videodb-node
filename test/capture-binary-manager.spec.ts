import { EventEmitter } from 'node:events';
import { BinaryManager } from '../src/capture/binaryManager';
import { PROTOCOL_PREFIX } from '../src/capture/types';

function fixture() {
  const manager = new BinaryManager();
  const child = Object.assign(new EventEmitter(), {
    exitCode: null as number | null,
    signalCode: null as string | null,
    stdin: { destroyed: false, write: jest.fn() },
    kill: jest.fn(),
  });
  const internals = manager as unknown as {
    process: typeof child;
    handleMessage: (msg: object) => void;
    pendingCommands: Map<string, unknown>;
  };
  internals.process = child;
  function respond(result: object = {}) {
    const command = JSON.parse(
      child.stdin.write.mock.calls.at(-1)[0].slice(PROTOCOL_PREFIX.length)
    );
    internals.handleMessage({
      type: 'response',
      commandId: command.commandId,
      status: 'success',
      result,
    });
  }
  return { manager, child, internals, respond };
}
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
test('command timeout removes pending request and completion clears timeout', async () => {
  const { manager, internals, respond } = fixture();
  const first = manager.sendCommand('ping', {}, 10);
  const rejected = expect(first).rejects.toThrow('timed out');
  jest.advanceTimersByTime(10);
  await rejected;
  expect(internals.pendingCommands.size).toBe(0);
  const next = manager.sendCommand('ping');
  respond();
  await next;
  expect(jest.getTimerCount()).toBe(0);
});
test('shutdown grants native finalization budget and waits for actual exit', async () => {
  const { manager, child, respond } = fixture();
  let done = false;
  const stopping = manager.stop().then(() => {
    done = true;
  });
  jest.advanceTimersByTime(6000);
  expect(child.kill).not.toHaveBeenCalled();
  respond();
  await Promise.resolve();
  expect(done).toBe(false);
  child.exitCode = 0;
  child.emit('exit', 0);
  await stopping;
  expect(done).toBe(true);
  expect(jest.getTimerCount()).toBe(0);
});
test('write failure clears request timeout', async () => {
  const { manager, child, internals } = fixture();
  child.stdin.write.mockImplementation((_data, callback) =>
    callback(new Error('pipe closed'))
  );
  await expect(manager.sendCommand('ping')).rejects.toThrow('Failed to send');
  expect(internals.pendingCommands.size).toBe(0);
  expect(jest.getTimerCount()).toBe(0);
});
