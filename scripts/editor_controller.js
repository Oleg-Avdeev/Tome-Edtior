let projectBrowser = new ProjectRenderer();
let toolbar = new ToolbarRenderer(projectBrowser);
let tabs = new TabsRenderer();

let ProjectMeta = {};

document.addEventListener('DOMContentLoaded', function() {
	toolbar.initialize();
	tabs.initialize();
});

// Editor entry function
function setDocument(document) {
	Story.onSceneSelect = onSceneSelect;
	Story.onTreeUpdate = onTreeUpdate;
	Story.initialize(document);
	
	projectBrowser.setCurrentDocument(document.meta.fileName);
}

function setProject( documents ) {
	projectBrowser.setDocuments(documents);
}

function setMetaData( metadata ) {
	ProjectMeta = metadata;
}

function onSceneSelect(sceneId) {
	selectNodeById(sceneId);

	let scene = getSceneById(sceneId);
	displayChapter(scene);
	displayTable(scene);
}

function onTreeUpdate(tree) {
	render(tree);
	selectNodeById(Story.currentSceneId);
}

function setProofreadingMode(active) {
	if (active == true)
		document.body.classList.add('proofreading');
	else document.body.classList.remove('proofreading');
}