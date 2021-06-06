const Story = {
	id: 0,
	json : {},
	currentSceneId : '',
	valid : false,

	onTreeUpdate : null,
	onSceneSelect : null,
	
	initialize : function(json) {
		this.json = json;
		this.onTreeUpdate(json);
	},

	invalidate : function() {
		this.valid = false;
	},

	commit : function() {
		if (!this.valid && this.json)
		{
			this.valid = true;
			console.log('Saving wip...');
			window.api.send('store-json', this.json);
		}
	},

	selectScene : function(sceneId) {
		this.currentSceneId = sceneId;
		window.api.send('select-scene', sceneId);
		this.onSceneSelect(sceneId);
	},

	updateTree : function () {
		this.onTreeUpdate(this.json);
	},
};

setInterval(() => Story.commit(), 1000);

let isLineNarrated = function (line) {
	if (line.Character.toLocaleLowerCase().includes('нарратор'))
		return true;

	if (line.Character.toLocaleLowerCase().includes('narrator'))
		return true;

	return false;
};

let getSceneById = function (sceneId) {
	return Story.json.Scenes.find(scene => scene.Id == sceneId);
};