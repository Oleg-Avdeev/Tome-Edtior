const { app, dialog } = require('electron');
const Store = require('electron-store');
const fs = require('fs');

const Story = require('../story');
const parser = require('../TSVParser');
const tsvBuilder = require('../JSONtoTSV');

let window;
let lastOpenedFile;
const store = new Store();
const isMac = process.platform === 'darwin';

exports.buildMenu = function (win, refreshMenu) {
	window = win;
	return {
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
	};
};

const requestConfirmation = () => {
	const resultPromise = dialog.showMessageBox(window, {
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
			window.webContents.executeJavaScript(`Story.selectScene("${document.scene}")`);
		}
	});
};

const openFile = () => {
	const files = dialog.showOpenDialog(window, {
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
	window.webContents.executeJavaScript(`setDocument(${JSON.stringify(document)})`);
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

	return dialog.showSaveDialogSync(window, {
		properties: ['createDirectory'],
		defaultPath: currentPath,
		filters: [
			{ name: 'TSV Files', extensions: ['tsv'] },
		],
	});
};