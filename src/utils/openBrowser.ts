/**
 * Opens a URL in the user's default browser. Mirrors `webbrowser.open` in
 * videodb-python, which every `.play()` calls.
 *
 * The browser build is swapped in by package.json's `browser` field, so
 * `node:child_process` never enters a bundle's module graph; the lazy require
 * and `isNode()` guard cover bundlers that ignore that field.
 */
const isNode = (): boolean =>
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const openBrowser = (url: string): boolean => {
  if (!isNode()) return false;
  // Escape hatch for CI and headless servers.
  if (process.env.VIDEODB_NO_BROWSER) return false;
  try {
    // Lazy require, not import: keeps child_process out of browser bundles.
    const { spawn } =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('node:child_process') as typeof import('node:child_process');
    let cmd: string;
    let args: string[];
    if (process.platform === 'darwin') {
      cmd = 'open';
      args = [url];
    } else if (process.platform === 'win32') {
      cmd = 'cmd';
      // `start` treats & as a command separator, so it must be escaped.
      args = ['/c', 'start', '""', url.replace(/&/g, '^&')];
    } else {
      cmd = 'xdg-open';
      args = [url];
    }
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    // A missing opener must never crash the host process.
    child.on('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
};
