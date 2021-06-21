const { app, Menu, dialog } = require('electron');

const fs = require('fs');
const Store = require('electron-store');

const Story = require('./story');
const parser = require('./TSVParser');
const tsvBuilder = require('./JSONtoTSV');

const isMac = process.platform === 'darwin';

let win;
let lastOpenedFile;
const store = new Store();

exports.setWindow = function (window) {
	win = window;
};

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
				click: () => { newFile(); }
			},
			{
				label: 'Open',
				accelerator: 'CommandOrControl+O',
				click: () => { openFile(); }
			},
			{
				label: 'Refresh',
				accelerator: 'CommandOrControl+R',
				click: () => { reOpenFile(); }
			},
			{
				label: 'Save',
				accelerator: 'CommandOrControl+S',
				click: () => { saveFile(); }
			},
			{
				label: 'Save As',
				accelerator: 'Shift+CommandOrControl+S',
				click: () => { saveAsFile(); }
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

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const requestConfirmation = () => {
	const resultPromise = dialog.showMessageBox(win, {
		message: 'Are you sure you would like to create a new file? Current progress will be lost.',
		type: 'info',
		buttons: ['Cancel', 'OK'],
		cancelId: 0,
		title: 'Unsaved progress'
	});

	if (!resultPromise) return;

	return resultPromise;
};

const newFile = () => {
	let confirmationPromise = requestConfirmation();
	let document = { path: '', wip: Story.createEmpty(), scene: 'Scene 1' };

	confirmationPromise.then(result => {
		if (result.response == 1) {
			store.set('document', document);
			renderResult(document.wip);
			win.webContents.executeJavaScript(`Story.selectScene("${document.scene}")`);
		}
	});
};

const openFile = () => {
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
		store.set('document.path', file.filePaths[0]);
		lastOpenedFile = file;
	});
};

const reOpenFile = () => {
	// lastOpenedFile = store.get('document.path');

	if (lastOpenedFile)
		parser.parseFile(lastOpenedFile, renderResult);
};

const renderResult = (document) => {
	store.set('document.wip', document);
	win.webContents.executeJavaScript(`setDocument(${JSON.stringify(document)})`);
};

const saveFile = () => {
	var document = store.get('document');

	if (!document.path || !fs.existsSync(document.path)) {
		var path = saveFileDialogue(document.path);
		if (!path) return;
		document.path = path;
		store.set('document.path', document.path);
	}

	let tsv = tsvBuilder.build(document.wip);
	fs.writeFileSync(document.path, tsv);
};

const saveAsFile = () => {
	var document = store.get('document');

	var path = saveFileDialogue(document.path);
	if (!path) return;

	store.set('document.path', document.path);

	let tsv = tsvBuilder.build(document.wip);
	fs.writeFileSync(document.path, tsv);
};

const saveFileDialogue = (currentPath) => {
	if (!currentPath) currentPath = app.getAppPath();

	return dialog.showSaveDialogSync(win, {
		properties: ['createDirectory'],
		defaultPath: currentPath,
		filters: [
			{ name: 'TSV Files', extensions: ['tsv'] },
		],
	});
};

const toggleProofreading = () => {
	let proofreading = !store.get('document.mode.proofreading', false);
	store.set('document.mode.proofreading', proofreading);
	win.webContents.executeJavaScript(`setProofreadingMode(${proofreading})`);
};