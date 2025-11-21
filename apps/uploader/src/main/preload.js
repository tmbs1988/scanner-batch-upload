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
  // Spara/läs scheduler-inställningar via main IPC
  saveScheduleConfig: (config) => ipcRenderer.invoke('save-schedule-config', config),
  loadScheduleConfig: () => ipcRenderer.invoke('load-schedule-config'),
  autoDone: () => { ipcRenderer.send('auto-done'); },
  onAutoRun: (cb) => { try { ipcRenderer.on('auto-run-once', cb); } catch {} },
  onUpdateLog: (cb) => { try { ipcRenderer.on('u-upd-log', (_e, m) => cb(m)); } catch {} },
});


