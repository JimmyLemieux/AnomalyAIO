// Logic for an electron application

const shell = require('electron').shell;

const {app, BrowserWindow, BrowserView} = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 700,
  });
  win.loadFile('./dist/index.html');
  // const view = new BrowserView();
  // win.setBrowserView(view);
  // view.setBounds({ x: 0, y: 0, width: 600, height: 600 })
  // view.webContents.loadURL(`file://${__dirname}/dist/index.html`);
   
  // win.webContents.openDevTools(); 


  win.on('closed', () => {
    win = null;
  }); 
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});