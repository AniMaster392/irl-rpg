const { app, BrowserWindow } = require("electron");

require("./server.js");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "IRL RPG"
  });

  setTimeout(() => {
    win.loadURL("http://localhost:3000");
  }, 1000);
}

app.whenReady().then(createWindow);