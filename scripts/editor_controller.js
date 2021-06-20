
// Editor entry function
function setDocument (document) {
	Story.onSceneSelect = onSceneSelect;
	Story.onTreeUpdate = onTreeUpdate;
	Story.initialize(document);
}

function onSceneSelect (sceneId) {
	selectNodeById(sceneId);
	
	let scene = getSceneById(sceneId);
	displayChapter(scene);
}

function onTreeUpdate (tree) {
	render(tree);
	selectNodeById(Story.currentSceneId);
}