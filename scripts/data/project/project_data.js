const fs = require('fs');
const Store = require('electron-store');
const { ipcMain } = require('electron');

const parse = require('papaparse');
const tsvParser = require('../../app/TSVParser');
const tsvBuilder = require('../../app/JSONtoTSV');
const Meta = require('./meta_data');

module.exports = class Project {

	constructor( win, path ) {
		let segments = path.split('/');

		this.window = win;
		this.path = path;
		this.store = new Store();
		this.name = segments[segments.length - 1];
		this.metaBuilder = new Meta();

		Project.Current = this;
	}

	create() {
		let split = this.path.split('/');
		let projectName = split[split.length - 1];

		let content = 'Scene	Character	Text	Actions	Conditions\nScene 1	Character 1	First Line';

		fs.writeFileSync(`${this.path}/${projectName}.tsv`, content);

		this.read();
	}

	reset() {
		fs.rmdirSync(`${this.path}/meta`, { recursive: true });
		fs.rmSync(`${this.path}/project-meta.json`);
		this.read();
	}

	save() {
		this.storyFileNames.forEach((filename, index) => {

			let document = JSON.parse(this.projectData.documents[index]);
			let tsv = tsvBuilder.build(document.story);
			
			fs.writeFile(`${this.path}/${filename}`, tsv, 
				(err) => { if (err) console.error(err); });
		});
	}

	read() {
		console.time('read');
		let projectContents = fs.readdirSync(this.path);

		if (!projectContents.find(f => f === 'meta'))
			fs.mkdirSync(`${this.path}/meta`);
		
		this.storyFileNames = projectContents.filter(file => file.match(/.*\.tsv$/));

		this.storyFileNames
			.filter(file => !fs.existsSync(this.getMetaPath(file)))
			.forEach(file => fs.writeFileSync(this.getMetaPath(file), 
				JSON.stringify( this.buildStoryMeta(file), null, 2 )));
		
		let projectMeta = {};
		
		if (fs.existsSync(`${this.path}/lookup/lookup.tsv`))
		{
			let lookup = fs.readFileSync(`${this.path}/lookup/lookup.tsv`).toString();
			let parsedLookup = parse.parse(lookup, { delimiter: '\t', encoding: 'utf-8', header: false, trimHeaders: false, });
			
			projectMeta.lookup = parsedLookup.data
				.map(line => { return {'key': line[0], 'values': line.splice(1, line.length - 1).filter(value => value) }; });
		}

		if (!fs.existsSync(`${this.path}/project-meta.json`))
			fs.writeFileSync(`${this.path}/project-meta.json`, JSON.stringify(projectMeta, null, 2));
		
		this.store.set('project-path', this.path);

		this.renderProject();
		console.timeEnd('read');
	}

	renderProject() {

		console.time('renderProject');

		this.projectData = {
			names: this.name,
			documents: [],
		};

		this.storyFileNames.forEach(filename => {
			let document = fs.readFileSync( this.getMetaPath(filename), 'utf-8' ).toString();
			this.projectData.documents.push(document);
		});

		let lookup = this.metaBuilder.buildLookup(this.projectData.documents);

		var metaDataJSON = fs.readFileSync(`${this.path}/project-meta.json`).toString();
		this.metaData = JSON.parse(metaDataJSON);
		this.metaData.lookup = lookup;

		let currentDocumentIndex = this.storyFileNames.indexOf(this.metaData.currentDocument);
		if (currentDocumentIndex < 0) currentDocumentIndex = 0;

		this.window.webContents.executeJavaScript(`setProject(${JSON.stringify(this.storyFileNames)})`);
		this.window.webContents.executeJavaScript(`setDocument(${this.projectData.documents[currentDocumentIndex]})`);

		ipcMain.removeAllListeners('commit-document');
		ipcMain.removeAllListeners('select-document');

		ipcMain.on('commit-document', (event, args) => {
			let file = this.getMetaPath( args.meta.fileName );
			let json = JSON.stringify( args, null, 2 );
			
			let index = this.storyFileNames.indexOf(args.meta.fileName);
			this.projectData.documents[index] = json;

			fs.writeFileSync( file, json );
			
			this.metaData.lookup = lookup;
			metaDataJSON = JSON.stringify(this.metaData, null, 2);
			fs.writeFileSync(`${this.path}/project-meta.json`, metaDataJSON);
		});

		ipcMain.on('select-document', (event, file) => {
			let index = this.storyFileNames.indexOf(file);
			let document = this.projectData.documents[index];
			this.window.webContents.executeJavaScript(`setDocument(${document})`);
			this.metaData.currentDocument = file;

			fs.writeFileSync( `${this.path}/project-meta.json`, JSON.stringify(this.metaData, null, 2) );
		});
		
		this.window.webContents.executeJavaScript(`setMetaData(${metaDataJSON})`);

		console.timeEnd('renderProject');
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