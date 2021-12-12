const Story = {
	id: 0,
	
	json : {},
	document: {},
	meta: {},

	currentSceneId : '',
	valid : false,

	onTreeUpdate : null,
	onSceneSelect : null,
	
	initialize : function(document) {
		this.json = document.story;
		this.meta = document.meta;
		this.document = document;
		this.currentSceneId = this.meta.currentSceneId;
		
		if (!this.currentSceneId)
			this.currentSceneId =this.json.Scenes[0].Id;

		this.onTreeUpdate(this.json);
		this.onSceneSelect(this.currentSceneId);
	},

	invalidate : function() {
		this.valid = false;
	},

	commit : function() {
		if (!this.valid && this.json)
		{
			this.valid = true;
			window.api.send('commit-document', this.document);
		}
	},

	selectScene : function(sceneId) {
		this.currentSceneId = sceneId;
		this.meta.currentSceneId = sceneId;
		this.onSceneSelect(sceneId);
		this.invalidate();
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