const isMac = process.platform === 'darwin';
let window;

exports.buildMenu = function (win, refreshMenu) {
	window = win;
	return {
		label: 'Repository',
		submenu: [
			{
				label: 'Initialize Git',
				// accelerator: 'CommandOrControl+N',
				click: () => { initializeGitRepo(); }
			},
			{
				label: 'Commit Changes',
				// accelerator: 'CommandOrControl+O',
				click: () => { commitChangesToGit(); }
			},
		]
	};
};

const initializeGitRepo = () => {

};

const commitChangesToGit = () => {

};