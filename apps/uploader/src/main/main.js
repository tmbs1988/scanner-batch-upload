const { app, BrowserWindow, protocol, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let quitOnDone = false;
let runOnce = false;
let tray = null;
let winStatePath = null;

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

  // Help debugging packaged issues: show devtools and basic lifecycle logs
  win.webContents.on('did-fail-load', (e, errCode, errDesc, url) => {
    console.error('did-fail-load', errCode, errDesc, url);
  });
  win.webContents.on('crashed', () => console.error('renderer crashed'));
  win.webContents.on('did-finish-load', () => console.log('renderer did-finish-load'));
  // Pass minimal flags to renderer via query string (read also via preload argv if needed)
  const url = new URL(`file://${path.join(__dirname, '../renderer/index.html')}`);
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
      iconImg = nativeImage.createEmpty();
    }
    tray = new Tray(iconImg);
    tray.setToolTip('Scanner Batch Uploader');
    const template = [
      { label: 'Visa', click: () => { win.show(); win.focus(); } },
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

  // OTA update check (only when packaged)
  try {
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
      autoUpdater.on('update-available', () => {
        if (tray && tray.displayBalloon) {
          try { tray.displayBalloon({ title: 'Uppdatering hittad', content: 'Ny version laddas ner…' }); } catch {}
        }
      });
      autoUpdater.on('update-downloaded', () => {
        if (tray && tray.displayBalloon) {
          try { tray.displayBalloon({ title: 'Uppdatering redo', content: 'Starta om för att installera uppdateringen.' }); } catch {}
        }
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

app.on('before-quit', () => { app.isQuitting = true; });

// Renderer notifies when auto-run finished
ipcMain.on('auto-done', () => {
  if (quitOnDone) {
    app.quit();
  }
});


