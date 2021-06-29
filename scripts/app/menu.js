const { app, Menu } = require('electron');
const Store = require('electron-store');
const isMac = process.platform === 'darwin';

// MENU:
const file = require('./menu/file');
const google = require('./menu/google');

let win;
const store = new Store();

exports.setWindow = function (window) {
	win = window;
};

exports.buildMenu = function () {
	buildMenu();
};

function buildTemplate() {
	return [
		// { role: 'appMenu' }
		...(isMac ? [{
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		}] : []),

		file.buildMenu(win, buildMenu),

		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				...(isMac ? [
					{ role: 'pasteAndMatchStyle' },
					{ role: 'delete' },
					{ role: 'selectAll' },
					{ type: 'separator' },
					{
						label: 'Speech',
						submenu: [
							{ role: 'startSpeaking' },
							{ role: 'stopSpeaking' }
						]
					}
				] : [
					{ role: 'delete' },
					{ type: 'separator' },
					{ role: 'selectAll' }
				])
			]
		},
		// { role: 'viewMenu' }
		{
			label: 'View',
			submenu: [
				{ role: 'toggleDevTools' },
				{ type: 'separator' },
				{
					label: 'Toggle Proofreading Mode',
					accelerator: 'CommandOrControl+1',
					click: () => { toggleProofreading(); }
				},
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' }
			]
		},
		// { role: 'windowMenu' }
		{
			label: 'Window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'zoom' },
				...(isMac ? [
					{ type: 'separator' },
					{ role: 'front' },
					{ type: 'separator' },
					{ role: 'window' }
				] : [
					{ role: 'close' }
				])
			]
		},

		google.buildMenu(win, buildMenu),

		{
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click: async () => {
						const { shell } = require('electron');
						await shell.openExternal('https://electronjs.org');
					}
				}
			]
		}
	];
}

function buildMenu () {
	const menu = Menu.buildFromTemplate(buildTemplate());
	Menu.setApplicationMenu(menu);
}

const toggleProofreading = () => {
	let proofreading = !store.get('document.mode.proofreading', false);
	store.set('document.mode.proofreading', proofreading);
	win.webContents.executeJavaScript(`setProofreadingMode(${proofreading})`);
};