// Placeholder for early initialization if needed (e.g., single instance lock, protocol handlers)
const { app } = require('electron');
if (!app.requestSingleInstanceLock()) {
  app.quit();
}


