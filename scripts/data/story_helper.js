const StoryHelper = {

	createScene : function(referenceScene, sceneId) {
		
		let newSceneId = sceneId ? sceneId : this.getUniqueSceneId(referenceScene.Id);
		
		let lastLine = referenceScene.Lines[referenceScene.Lines.length - 1];
		let newLine = { ...lastLine };
		newLine.Character = '?';
		newLine.Actions = [];
		newLine.Text = '...';
		
		let newScene = { Id: newSceneId, Lines: [ newLine ] };
		Story.json.Scenes.push(newScene);
		Story.invalidate();
		
		return newScene;
	},

	createNextScene : function(parentScene) {
		
		let newSceneId = this.getUniqueSceneId(parentScene.Id);
		let newScene = this.createScene(parentScene, newSceneId);
		
		let lastLine = parentScene.Lines[parentScene.Lines.length - 1];
		let gotoAction = { 'ActionType': ActionType.goto, 'Value': newSceneId };
		let newLink = { ... lastLine };
		newLink.Actions = [gotoAction];
		newLink.Text = `[${newSceneId}]`;
		
		parentScene.Lines.push(newLink);
		
		Story.invalidate();
		Story.updateTree();
	},

	createPreviousScene : function(currentScene) {
		let newSceneId = this.getUniqueSceneId(currentScene.Id);
		let newScene = this.createScene(currentScene, newSceneId);
		
		let parentScenes = Story.json.
			Scenes.filter(s => s.
				Lines.find(l => l.
					Actions.find(a => a.ActionType == ActionType.goto && a.Value == currentScene.Id)));

		parentScenes
			.flatMap(s => s.Lines)
			.flatMap(l => l.Actions)
			.filter(a => a.Value == currentScene.Id)
			.forEach(a => a.Value = newSceneId);
			
		newScene.Lines[0].Actions = [ { 'ActionType': ActionType.goto, 'Value': currentScene.Id } ];

		Story.invalidate();
		Story.updateTree();
	},

	deleteScene : function(scene) {
		Story.json.Scenes = Story.json.Scenes.filter(s => s.Id != scene.Id);

		Story.json.Scenes.forEach(s => s.Lines.forEach(line => {
			if (line.Actions.find(a => a.ActionType === 1 && a.Value == scene.Id))
			{
				console.warn('TODO: Remove references to the removed scene');
			}
		}));

		Story.updateTree();
		Story.invalidate();
	},

	getUniqueSceneId : function(parentId) {
		let uid = parentId;

		while (Story.json.Scenes.find(s => s.Id == uid))
			uid = uid + '_';
		
		return uid;
	}
};