const { app, BrowserWindow, protocol, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let quitOnDone = false;
let runOnce = false;
let tray = null;
let mainWin = null;
let winStatePath = null;
let scheduleTimer = null;

function loadWindowState() {
  try {
    winStatePath = path.join(app.getPath('userData'), 'window-state.json');
    if (fs.existsSync(winStatePath)) {
      const raw = fs.readFileSync(winStatePath, 'utf8');
      const st = JSON.parse(raw);
      return { ...st, _hasState: true };
    }
  } catch {}
  return { width: 1280, height: 900, maximized: false, _hasState: false };
}

function saveWindowState(win) {
  if (!winStatePath) return;
  try {
    const b = win.getBounds();
    const data = {
      width: b.width,
      height: b.height,
      x: b.x,
      y: b.y,
      maximized: win.isMaximized(),
    };
    fs.writeFileSync(winStatePath, JSON.stringify(data), 'utf8');
  } catch {}
}
function hasArg(flag) {
  return process.argv.some(a => a === flag);
}
function getArgValue(flag, fallback) {
  const idx = process.argv.findIndex(a => a === flag);
  if (idx >= 0 && process.argv[idx+1]) return process.argv[idx+1];
  return fallback;
}

function createWindow() {
  const state = loadWindowState();
  const win = new BrowserWindow({
    width: state.width || 1400,
    height: state.height || 1000,
    x: state.x,
    y: state.y,
    minWidth: 1024,
    minHeight: 800,
    show: false,
    webPreferences: {
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    useContentSize: true
  });

  // Security: load local file (no remote code). Renderer will use fetch to call backend API.
  win.removeMenu();
  try {
    // Visa version i window bar (titel)
    win.setTitle(`Scanner Batch Uploader v${app.getVersion()}`);
  } catch {}

  // Help debugging packaged issues: show devtools and basic lifecycle logs
  win.webContents.on('did-fail-load', (e, errCode, errDesc, url) => {
    console.error('did-fail-load', errCode, errDesc, url);
  });
  win.webContents.on('crashed', () => console.error('renderer crashed'));
  win.webContents.on('did-finish-load', () => console.log('renderer did-finish-load'));
  // Pass minimal flags to renderer via query string (read also via preload argv if needed)
  const url = new URL(`file://${path.join(__dirname, '../renderer/index.html')}`);
  try { url.searchParams.set('ver', app.getVersion()); } catch {}
  if (hasArg('--auto')) url.searchParams.set('auto', '1');
  if (hasArg('--yesterday')) url.searchParams.set('yesterday', '1');
  const root = getArgValue('--root', '');
  if (root) url.searchParams.set('root', root);
  if (hasArg('--quit-on-done')) url.searchParams.set('quit', '1');
  win.loadURL(url.toString());
  win.once('ready-to-show', () => {
    try {
      if (state._hasState && state.maximized) {
        win.maximize();
      } else if (!state._hasState) {
        // Första körningen: öppna maximerat för att undvika "för kort" fönster
        win.maximize();
      }
    } catch {}
    win.show();
  });

  // Keep reference for updater logs
  mainWin = win;

  // System tray with quick actions
  try {
    // Försök hitta ikon i produktion (resources) och i dev (src/renderer)
    const resBase = process.resourcesPath || path.join(__dirname, '..');
    const candidates = [
      path.join(resBase, 'icon.ico'),
      path.join(resBase, 'icon.png'),
      path.join(__dirname, '../renderer/icon.ico'),
      path.join(__dirname, '../renderer/icon.png'),
    ];
    let iconImg = null;
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          let ni = nativeImage.createFromPath(p);
          if (!ni || ni.isEmpty()) {
            // Som fallback, läs som buffer (vissa png/ico behöver createFromBuffer)
            const buf = fs.readFileSync(p);
            ni = nativeImage.createFromBuffer(buf);
          }
          if (ni && !ni.isEmpty()) {
            // Windows tray gillar små storlekar (16 eller 24)
            iconImg = ni.resize({ width: 16, height: 16 });
            break;
          }
        }
      } catch {}
    }
    if (!iconImg || iconImg.isEmpty()) {
      // Skapa ett enkelt orange 16x16-bitmap som fallback så att tray-ikonen inte är tom
      const w = 16, h = 16;
      const buf = Buffer.alloc(w * h * 4);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          // BGRA – orange (#f97316)
          buf[idx + 0] = 0x16; // B
          buf[idx + 1] = 0x73; // G
          buf[idx + 2] = 0xF9; // R
          buf[idx + 3] = 0xFF; // A
        }
      }
      iconImg = nativeImage.createFromBitmap(buf, { width: w, height: h });
    }
    tray = new Tray(iconImg);
    tray.setToolTip('Scanner Batch Uploader');
    const template = [
      { label: 'Visa', click: () => { win.show(); win.focus(); } },
      { type: 'separator' },
      { label: 'Sök efter uppdatering', click: () => { if (app.isPackaged) { try { autoUpdater.checkForUpdates(); } catch {} } } },
      { label: 'Installera uppdatering', enabled: false, click: () => { if (app.isPackaged) { try { autoUpdater.quitAndInstall(); } catch {} } } },
      { type: 'separator' },
      { label: 'Synka nu (1 gång)', click: () => { win.webContents.send('auto-run-once'); } },
      { type: 'separator' },
      { label: 'Avsluta', click: () => { app.isQuitting = true; app.quit(); } },
    ];
    tray.setContextMenu(Menu.buildFromTemplate(template));
    tray.on('click', () => { win.isVisible() ? win.hide() : win.show(); });
  } catch (e) {
    console.warn('Tray init failed', e?.message || e);
  }

  // Optional: minimize to tray on close
  win.on('close', (e) => {
    if (!app.isQuitting && tray) {
      e.preventDefault();
      win.hide();
      return;
    }
    saveWindowState(win);
  });

  if (runOnce) {
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('auto-run-once');
    });
  }
}

// On Windows, set app user model (for notifications/installer later)
app.setAppUserModelId('com.3dfotteknik.scanner-batch-uploader');

app.whenReady().then(() => {
  quitOnDone = hasArg('--quit-on-done');
  runOnce = hasArg('--run-once');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Sätt autostart (Windows)
  try {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      args: [],
    });
  } catch (e) {
    console.warn('Failed to set autostart', e);
  }

  // Starta intern scheduler
  startInternalScheduler();

  // OTA update check (only when packaged)
  try {
    if (app.isPackaged) {
      const sendUpd = (msg) => {
        try {
          if (mainWin && !mainWin.isDestroyed()) mainWin.webContents.send('u-upd-log', msg);
        } catch {}
      };
      // Fullständig tyst uppdatering: ladda ned och installera automatiskt
      autoUpdater.autoDownload = true;
      autoUpdater.on('checking-for-update', () => sendUpd('Checking for update...'));
      autoUpdater.on('update-available', (i) => sendUpd(`Update available: v${i?.version || ''}`));
      autoUpdater.on('update-not-available', (i) => sendUpd(`No update available (current v${app.getVersion()})`));
      autoUpdater.on('error', (e) => sendUpd(`Update error: ${e?.message || e}`));
      autoUpdater.on('download-progress', (p) => sendUpd(`Downloading: ${Math.round(p?.percent || 0)}%`));
      // Installera direkt när nedladdning är klar (tyst läge på Windows)
      autoUpdater.on('update-downloaded', () => {
        try {
          // informera i tray om vi har ikon, men installera oavsett
          if (tray && tray.displayBalloon) {
            tray.displayBalloon({ title: 'Uppdatering', content: 'Ny version installerades. Applikationen startas om.' });
          }
        } catch {}
        sendUpd('Update downloaded, restarting...');
        // isSilent=true (Windows), isForceRunAfter=true för att starta om automatiskt
        setImmediate(() => autoUpdater.quitAndInstall(true, true));
      });
      autoUpdater.checkForUpdates().catch(err => {
        console.error('autoUpdater check error', err);
        sendUpd(`Check failed: ${err?.message || err}`);
      });
    }
  } catch (e) {
    console.error('autoUpdater error', e);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => { app.isQuitting = true; if (scheduleTimer) clearInterval(scheduleTimer); });

// Renderer notifies when auto-run finished
ipcMain.on('auto-done', () => {
  if (quitOnDone) {
    app.quit();
  }
});

// Intern scheduler: läs config och kör vid vald tid
function startInternalScheduler() {
  const configPath = path.join(app.getPath('userData'), 'schedule-config.json');
  let config = null;
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch {}
  
  if (!config || !config.enabled) return;
  
  const checkSchedule = () => {
    const now = new Date();
    const [hh, mm] = (config.time || '01:30').split(':').map(Number);
    if (now.getHours() === hh && now.getMinutes() === mm) {
      // Trigga batch
      if (mainWin && !mainWin.isDestroyed()) {
        mainWin.webContents.send('auto-run-once');
      }
    }
  };
  
  // Kolla varje minut
  scheduleTimer = setInterval(checkSchedule, 60000);
  // Kolla direkt vid start också (om vi precis startat vid rätt minut)
  setTimeout(checkSchedule, 5000);
}

// IPC: spara/läs schedule config
ipcMain.handle('save-schedule-config', async (_e, cfg) => {
  try {
    const file = path.join(app.getPath('userData'), 'schedule-config.json');
    fs.writeFileSync(file, JSON.stringify(cfg, null, 2), 'utf8');
    // Restart scheduler
    if (scheduleTimer) clearInterval(scheduleTimer);
    startInternalScheduler();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('load-schedule-config', async () => {
  try {
    const file = path.join(app.getPath('userData'), 'schedule-config.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch {}
  return null;
});

