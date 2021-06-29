const { shell, ipcMain, BrowserWindow, app } = require('electron');
const google = require('../../google/spreadsheets');
const path = require('path');

const Store = require('electron-store');
const parser = require('../TSVParser');
const store = new Store();

let window;
let onRefreshMenu;

exports.buildMenu = function (win, refreshMenu) {
	window = win;
	onRefreshMenu = refreshMenu;

	return {
		label: 'Google',
		submenu: [
			{
				label: 'Authenticate',
				enabled: !(google.isAuthenticated()),
				click: () => { authenticate(); }
			},
			{
				label: 'Log Out',
				enabled: google.isAuthenticated(),
				click: () => { logOut(); }
			},
			{
				label: 'Open Google Spreadsheet',
				enabled: google.isAuthenticated(),
				click: () => { openSpreadsheet(); }
			},
			{
				label: 'Save To Google Spreadsheet',
				enabled: google.isAuthenticated(),
				click: () => { saveSpreadsheet(); }
			}
		]
	};
};

function authenticate() {
	google.authenticate( openAuthURL, onAuthorized );
}

function openSpreadsheet() {
	google.getAllSheets(data => {

		const win = createPopup();
		win.loadURL(`file://${app.getAppPath()}/pages/google-list.html`);
		win.webContents.executeJavaScript(`render('${JSON.stringify(data)}')`);

		ipcMain.once('google-sheet-id', (event, args) => {
			google.get(args, (sheet) => {
				parser.parseTSV(sheet, renderResult);
			});
		});	
	});
}

const renderResult = (wip) => {
	let document = { path: '', wip: wip };
	store.set('document', document);
	window.webContents.executeJavaScript(`setDocument(${JSON.stringify(wip)})`);
};

function saveSpreadsheet() {

}

function logOut() {
	google.logOut();
	onRefreshMenu();
}

function openAuthURL(URL, onCodeReceived) {
	shell.openExternal(URL);
	
	const win = createPopup();
	win.loadURL(`file://${app.getAppPath()}/pages/google-auth.html`);

	ipcMain.once('google-auth-code', (event, args) => {
		console.log(args);
		onCodeReceived(args);
	});	
}

function onAuthorized() {
	onRefreshMenu();
}

function createPopup() {
	return new BrowserWindow({ 
		width: 800, 
		height: 600,
		webPreferences: {
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(app.getAppPath(), 'preload.js')
		}
	});
}