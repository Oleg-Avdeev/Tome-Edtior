const fs = require('fs');
const Store = require('electron-store');
const { ipcMain } = require('electron');

const Story = require('../../app/story');
const tsvParser = require('../../app/TSVParser');
const tsvBuilder = require('../../app/JSONtoTSV');

module.exports = class Project {

	constructor( win, path ) {
		let segments = path.split('/');

		this.window = win;
		this.path = path;
		this.store = new Store();
		this.name = segments[segments.length - 1];
	}

	create() {
		
	}

	read() {
		let projectContents = fs.readdirSync(this.path);

		if (!projectContents.find(f => f === 'meta'))
			fs.mkdirSync(`${this.path}/meta`);
		
		this.storyFileNames = projectContents.filter(file => file.match(/.*\.tsv/));

		this.storyFileNames
			.filter(file => !fs.existsSync(this.getMetaPath(file)))
			.forEach(file => fs.writeFileSync(this.getMetaPath(file), 
				JSON.stringify( this.buildStoryMeta(file), null, 2 )));

		if (!fs.existsSync(`${this.path}/project.meta`))
			fs.writeFileSync(`${this.path}/project.meta`, '{}');
		
		this.store.set('project-path', this.path);

		this.renderProject();
	}

	renderProject() {

		this.projectData = {
			names: this.name,
			documents: []
		};
		
		this.storyFileNames.forEach(filename => {
			let document = fs.readFileSync( this.getMetaPath(filename), 'utf-8' ).toString();
			this.projectData.documents.push(document);
		});

		this.window.webContents.executeJavaScript(`setProject(${JSON.stringify(this.storyFileNames)})`);
		this.window.webContents.executeJavaScript(`setDocument(${this.projectData.documents[0]})`);

		ipcMain.on('commit-document', (event, args) => {
			let file = this.getMetaPath( args.meta.fileName );
			let json = JSON.stringify( args, null, 2 );

			fs.writeFileSync( file, json );
		});

		ipcMain.on('select-document', (event, file) => {
			let index = this.storyFileNames.indexOf(file);
			let document = this.projectData.documents[index];
			this.window.webContents.executeJavaScript(`setDocument(${document})`);
		});
	}

	buildStoryMeta( storyFilePath ) {
		
		let fileName = storyFilePath;
		let hasChanges = false;
		let sceneColors = [];
		let currentScene = '';
		
		let tsv = fs.readFileSync(`${this.path}/${storyFilePath}`, 'utf-8').toString();
		let json = tsvParser.parseTSV(tsv);
		
		return { meta: { fileName, hasChanges, currentScene, sceneColors }, story: json };
	}

	getMetaPath( file ) {
		return `${this.path}/meta/${file}-meta.json`;
	}
};