const { app, BrowserWindow, Menu } = require("electron");

require("./server.js");

Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "IRL RPG",
    autoHideMenuBar: true
  });

  win.setMenuBarVisibility(false);

  setTimeout(() => {
    win.loadURL("http://localhost:3000");
  }, 1000);
}

app.whenReady().then(createWindow);