const { app, Menu, dialog } = require('electron')
const parser = require('./TSVParser')
const isMac = process.platform === 'darwin'

let win;
let lastOpenedFile;

exports.setWindow = function(window) {
	win = window;
}

const template = [
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
	// { role: 'fileMenu' }
	{
		label: 'File',
		submenu: [
			{
				label: 'New',
				accelerator: 'CommandOrControl+N',
				click: () => { console.log('New') }
			},
			{
				label: 'Open',
				accelerator: 'CommandOrControl+O',
				click: () => { openFile() }
			},
			{
				label: 'Refresh',
				accelerator: 'CommandOrControl+R',
				click: () => { reOpenFile() }
			},
			{
				label: 'Save',
				accelerator: 'CommandOrControl+S',
				click: () => { console.log('Save') }
			},
			{ label: 'Export' },
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	},
	// { role: 'editMenu' }
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
			// { role: 'reload' },
			// { role: 'forceReload' },
			{ role: 'toggleDevTools' },
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
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click: async () => {
					const { shell } = require('electron')
					await shell.openExternal('https://electronjs.org')
				}
			}
		]
	}
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

const openFile = (win) => {
	const files = dialog.showOpenDialog(win, {
		properties: ['openFile'],
		defaultPath: app.getAppPath(),
		filters: [
			{ name: 'TSV Files', extensions: ['tsv'] },
			{ name: 'JSON Files', extensions: ['json'] },
			{ name: 'All Files', extensions: ['*'] }
		],
	});

	if (!files) { return; }
	
	files.then(file => {
		if (file.filePaths.length == 0) return;
		parser.parseFile(file, renderResult);
		lastOpenedFile = file;
	});
}

const reOpenFile = () => {
	if (lastOpenedFile == null) return;
	parser.parseFile(lastOpenedFile, renderResult);
}

const renderResult = (data) => {
	win.webContents.executeJavaScript(`render(${JSON.stringify (data)})`);
}