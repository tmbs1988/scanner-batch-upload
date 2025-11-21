const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// For now we expose a minimal API; renderer will use fetch() to call backend directly.
function computeDefaultLogDir() {
  try {
    const base = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);
    return path.join(base, 'logs');
  } catch {
    return path.join(process.cwd(), 'logs');
  }
}

contextBridge.exposeInMainWorld('uploader', {
  ping: () => 'ok',
  isPackaged: process.isPackaged,
  argv: process.argv.slice(1),
  getDefaultLogDir: () => computeDefaultLogDir(),
  appendLog: (line) => {
    try {
      const dir = computeDefaultLogDir();
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const name = `scanner-uploader-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}.log`;
      const file = path.join(dir, name);
      fs.appendFileSync(file, `[${d.toISOString()}] ${line}\n`, { encoding: 'utf8' });
      return file;
    } catch {
      return null;
    }
  },
  openLogDir: async () => {
    const dir = computeDefaultLogDir();
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch {}
    try { await shell.openPath(dir); } catch {}
    return dir;
  },
  exists: (p) => {
    try { return fs.existsSync(p); } catch { return false; }
  },
  readTextFile: (p, encoding = 'utf8') => {
    return fs.readFileSync(p, { encoding });
  },
  listDir: (p) => {
    try {
      const entries = fs.readdirSync(p, { withFileTypes: true });
      return entries.map(e => ({
        name: e.name,
        isDir: e.isDirectory(),
        fullPath: path.join(p, e.name),
        mtimeMs: (() => {
          try { return fs.statSync(path.join(p, e.name)).mtimeMs; } catch { return 0; }
        })()
      }));
    } catch {
      return [];
    }
  },
  listFilesRecursive: (p) => {
    const out = [];
    const walk = (dir) => {
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp);
        else out.push({ name: e.name, fullPath: fp, mtimeMs: (() => { try { return fs.statSync(fp).mtimeMs; } catch { return 0; } })() });
      }
    };
    walk(p);
    return out;
  },
  pathJoin: (...segs) => path.join(...segs),
  scheduleInstall: ({ taskName = '3DF_Scanner_Auto_Upload', time = '01:30', includeYesterday = false, root = 'D:\\\\LSF350', quitOnDone = true } = {}) => {
    return new Promise((resolve, reject) => {
      const exe = process.execPath.replace(/"/g, '');
      const args = ['--auto', '--root', root];
      if (includeYesterday) args.push('--yesterday');
      if (quitOnDone) args.push('--quit-on-done');
      const tr = `"${exe}" ${args.join(' ')}`;
      const cmd = 'schtasks';
      // Daily trigger at specified time, interactive with highest privileges
      const dailyArgs = ['/Create', '/TN', taskName, '/TR', tr, '/SC', 'DAILY', '/ST', time, '/RL', 'HIGHEST', '/IT', '/F'];
      execFile(cmd, dailyArgs, { windowsHide: true }, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        // Add ONLOGON fallback so jobbet körs när användaren loggar in om datorn sov
        const logonName = `${taskName}_OnLogon`;
        const logonArgs = ['/Create', '/TN', logonName, '/TR', tr, '/SC', 'ONLOGON', '/RL', 'HIGHEST', '/IT', '/F'];
        execFile(cmd, logonArgs, { windowsHide: true }, (err2, stdout2, stderr2) => {
          if (err2) return reject(new Error(stderr2 || err2.message));
          resolve(`${stdout || 'OK'}\n${stdout2 || 'OK'}`);
        });
      });
    });
  },
  scheduleRemove: ({ taskName = '3DF_Scanner_Auto_Upload' } = {}) => {
    return new Promise((resolve, reject) => {
      const del = (name) => new Promise((res, rej) => {
        execFile('schtasks', ['/Delete', '/TN', name, '/F'], { windowsHide: true }, (err, stdout, stderr) => {
          if (err) return rej(new Error(stderr || err.message));
          res(stdout || 'OK');
        });
      });
      Promise.allSettled([del(taskName), del(`${taskName}_OnLogon`)])
        .then(results => resolve(results.map(r => r.value || r.reason?.message).join('\n')))
        .catch(reject);
    });
  },
  scheduleRun: ({ taskName = '3DF_Scanner_Auto_Upload' } = {}) => {
    return new Promise((resolve, reject) => {
      execFile('schtasks', ['/Run', '/TN', taskName], { windowsHide: true }, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(stdout || 'OK');
      });
    });
  },
  autoDone: () => { ipcRenderer.send('auto-done'); },
  onAutoRun: (cb) => { try { ipcRenderer.on('auto-run-once', cb); } catch {} },
  onUpdateLog: (cb) => { try { ipcRenderer.on('u-upd-log', (_e, m) => cb(m)); } catch {} },
});


