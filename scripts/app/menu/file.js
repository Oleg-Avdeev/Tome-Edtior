const { app, dialog } = require('electron');
const Project = require('../../data/project/project_data');
const fs = require('fs');

const isMac = process.platform === 'darwin';
let window;

exports.buildMenu = function (win, refreshMenu) {
	window = win;
	return {
		label: 'File',
		submenu: [
			{
				label: 'New Project',
				accelerator: 'CommandOrControl+N',
				click: () => { newProject(); }
			},
			{
				label: 'Open Project',
				accelerator: 'CommandOrControl+O',
				click: () => { openProject(); }
			},
			{
				label: 'Save Project',
				accelerator: 'CommandOrControl+S',
				click: () => { saveFile(); }
			},
			{
				label: 'Reset Project',
				accelerator: 'Shift+CommandOrControl+R',
				click: () => { resetProject(); }
			},
			{
				type: 'separator'
			},
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	};
};

const requestConfirmation = ( warningText ) => {
	const resultPromise = dialog.showMessageBox(window, {
		message: `Are you sure you would like to ${warningText}? All unsaved progress will be lost.`,
		type: 'info',
		buttons: ['Cancel', 'OK'],
		cancelId: 0,
		title: 'Unsaved progress'
	});

	if (!resultPromise) return;

	return resultPromise;
};

const newProject = () => [
	dialog
		.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'], defaultPath: app.getAppPath() })
		.then(path => {
			if (!path || path.filePaths.length == 0) return;

			let isEmpty = fs.readdirSync(path.filePaths[0]).length == 0;
			if (!isEmpty) return;

			let project = new Project(window, path.filePaths[0]);
			project.create();
		})
];

const openProject = () => {
	dialog
		.showOpenDialog(window, { properties: ['openDirectory'], defaultPath: app.getAppPath() })
		.then(path => {
			if (!path || path.filePaths.length == 0) return;
			let project = new Project(window, path.filePaths[0]);
			project.read();
		});
};

const saveFile = () => {

	if (!Project.Current) return;
	Project.Current.save();

};

const resetProject = () => {
	
	if (!Project.Current) return;

	requestConfirmation('reset current project')
		.then(ok => {
			if (ok.response == 0) return;
			Project.Current.reset();
		});

};