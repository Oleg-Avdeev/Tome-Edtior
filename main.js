const { app, BrowserWindow } = require('electron');
const Project = require('./scripts/data/project/project_data');
const { ipcMain } = require('electron');
const menu = require('./scripts/app/menu');
const Story = require('./scripts/app/story');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let win;

ipcMain.on('store-json', (event, args) => {
	store.set('document.wip', args);
});

ipcMain.on('select-scene', (event, args) => {
	store.set('document.scene', args);
});

function createWindow() {
	win = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js')
		}
	});

	win.loadFile('index.html');
	
	menu.setWindow(win);
	menu.buildMenu();

	let project_path = store.get('project-path');
	if (project_path)
	{
		let project = new Project(win, project_path);
		project.read();
	}
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
