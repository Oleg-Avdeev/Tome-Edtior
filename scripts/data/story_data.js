const Story = {
	id: 0,
	json : {},
	currentSceneId : '',
	valid : false,
	
	initialize : function(json) {
		this.json = json;
		this.invalidate();
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

	selectNode : function(sceneId) {
		this.currentSceneId = sceneId;
		window.api.send('select-scene', sceneId);
	},
};

setInterval(() => Story.commit(), 1000);

let isLineNarrated = function (line) {
	if (line.Character.toLocaleLowerCase().includes('нарратор'))
		return true;

	if (line.Character.toLocaleLowerCase().includes('narrator'))
		return true;

	return false;
}