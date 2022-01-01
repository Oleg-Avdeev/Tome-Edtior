const { app, BrowserWindow } = require('electron');
const Project = require('./scripts/data/project/project_data');
const menu = require('./scripts/app/menu');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let win;

function createWindow() {
	win = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js')
		},
		icon: __dirname + '/build/tome.icns'
	});

	if (process.platform === 'darwin') {
		app.dock.setIcon(path.join(__dirname, 'build/tome.png'));
	}	

	win.loadFile('index.html');
	// win.webContents.openDevTools();
	
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
