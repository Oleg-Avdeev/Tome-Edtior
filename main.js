const { app, BrowserWindow, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const menu = require('./scripts/menu')

function createWindow() {
	const win = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	win.loadFile('index.html')
	win.webContents.openDevTools()

	win.webContents.once('dom-ready', () => {
		getFileFromUser(win);
	})
}

const getFileFromUser = (win) => {
	const files = dialog.showOpenDialog(win, {
		properties: ['openFile'],
		defaultPath: app.getAppPath(),
		filters: [
			{ name: 'JSON Files', extensions: ['json'] },
			{ name: 'All Files', extensions: ['*'] }
		],
	});

	if (!files) { return; }
	
	files.then(file => {
		if (file.filePaths.length == 0) return;
		fs.readFile(file.filePaths[0], (er, data) => {
			if (er != null) return;
			win.webContents.executeJavaScript(`render(${data})`)
		});
	});
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
  