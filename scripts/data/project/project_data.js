const fs = require('fs');
const Store = require('electron-store');

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
				JSON.stringify( this.buildStoryMeta(`${this.path}/${file}`) )));

		if (!fs.existsSync(`${this.path}/project.meta`))
			fs.writeFileSync(`${this.path}/project.meta`, '{}');
		
		this.store.set('project-path', this.path);

		this.renderProject();
	}

	renderProject() {

		this.projectData = {
			names: this.name,
			stories: []
		};
		
		this.storyFileNames.forEach(filename => {
			let story = fs.readFileSync( this.getMetaPath(filename), 'utf-8' ).toString();
			this.projectData.stories.push(story);
		});

		this.window.webContents.executeJavaScript(`setDocument(${this.projectData.stories[0]})`);
	}

	buildStoryMeta( storyFilePath ) {
		
		let hasChanges = false;
		
		let tsv = fs.readFileSync(storyFilePath, 'utf-8').toString();
		let json = tsvParser.parseTSV(tsv);
		
		return { hasChanges, json };
	}

	getMetaPath( file ) {
		return `${this.path}/meta/${file}.meta`;
	}
};