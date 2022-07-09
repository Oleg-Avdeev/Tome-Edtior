const story = Story;

const StoryHelper = {

	createSceneDescriptions: function () {

		story.json.Scenes.forEach(scene => {

			if (scene.Lines[0].Character == 'SCENE')
				return;

			let line = {
				'Scene': scene.Id,
				'Character': 'SCENE',
				'Text': '',
				'Счётчик': '',
				'Actions': [],
				'Conditions': [],
				'Локация': scene.Lines[0]['Локация'],
				'Музыка': '',
				'Агата': '0',
				'Елена': '1',
				'Кристина': '2',
				'Дух-Дождя': '3',
				'Михаэль': '3',
				'Девушка+': '',
				'Девушка-': ''
			};

			scene.Lines = [line].concat(scene.Lines);
			return;
		});

		story.invalidate();
	},

	createNextScene: function (parentScene) {

		let newSceneId = this.getUniqueSceneId(parentScene.Id);
		let newScene = this.createScene(parentScene, newSceneId);

		let lastLine = parentScene.Lines[parentScene.Lines.length - 1];
		let gotoAction = { 'ActionType': ActionType.goto, 'Value': newSceneId };
		let newLink = { ...lastLine };
		newLink.Actions = [gotoAction];
		newLink.Text = `[${newSceneId}]`;

		parentScene.Lines.push(newLink);

		this.commitCommand(
			() => {
				story.json.Scenes.push(newScene);
			},
			() => {
				console.log(`Undoing adding scene ${newScene.Id} at `);
				story.json.Scenes = story.json.Scenes.filter(s => s.Id != newScene.Id);
			}
		);
	},

	createPreviousScene: function (currentScene) {
		let newSceneId = this.getUniqueSceneId(currentScene.Id);
		let newScene = this.createScene(currentScene, newSceneId);

		let parentScenes = story.json.
			Scenes.filter(s => s.
				Lines.find(l => l.
					Actions.find(a => a.ActionType == ActionType.goto && a.Value == currentScene.Id)));

		newScene.Lines[0].Actions = [{ 'ActionType': ActionType.goto, 'Value': currentScene.Id }];

		let changedActions = parentScenes
			.flatMap(s => s.Lines)
			.flatMap(l => l.Actions)
			.filter(a => a.Value == currentScene.Id);

		this.commitCommand(
			() => {
				story.json.Scenes.push(newScene);
				changedActions.forEach(a => a.Value = newSceneId);
			},
			() => {
				console.log(`Undoing adding scene ${newScene.Id} at `);
				story.json.Scenes = story.json.Scenes.filter(s => s.Id != newScene.Id);
				changedActions.forEach(a => a.Value = currentScene.Id);
			}
		);
	},

	createScene: function (referenceScene, sceneId) {

		let newSceneId = sceneId ? sceneId : this.getUniqueSceneId(referenceScene.Id);

		let lastLine = referenceScene.Lines[referenceScene.Lines.length - 1];
		let newLine = { ...lastLine };
		newLine.Character = 'Нарратор';
		newLine.Actions = [];
		newLine.Text = '...';

		let newScene = { Id: newSceneId, Lines: [newLine] };

		return newScene;
	},

	deleteScene: function (scene) {

		let index = story.json.Scenes.indexOf(scene);

		if (index == -1) {
			console.error('Couldn\'t delete scene ' + scene.Id);
			return;
		}

		this.commitCommand(
			() => {
				story.json.Scenes = story.json.Scenes.filter(s => s.Id != scene.Id);
				story.json.Scenes.forEach(s => s.Lines.forEach(line => {
					if (line.Actions.find(a => a.ActionType === 1 && a.Value == scene.Id)) {
						console.warn('TODO: Remove references to the removed scene');
					}
				}));
			},
			() => story.json.Scenes.splice(index, 0, scene)
		);
	},

	getUniqueSceneId: function (parentId) {
		let uid = parentId;

		while (story.json.Scenes.find(s => s.Id == uid))
			uid = uid + '_';

		return uid;
	},

	commitCommand: function (action, undo) {

		const updateStory = () => { story.invalidate(); story.updateTree(); };
		const fullAction = () => { action(); updateStory(); };
		const fullUndo = () => { undo(); updateStory(); };
		fullAction();

		try { registerCommand ({ redo: fullAction, undo: fullUndo }); } 
		catch (error) {
			console.error('error while registering command ' + error);
		}
	}
};