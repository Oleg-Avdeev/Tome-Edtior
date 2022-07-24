const story = Story;

const StoryHelper = {

	getOrCreateMetaObject: function (key, defaultValue) {
		if (story.meta[key])
			return story.meta[key];

		story.meta[key] = defaultValue;
		Story.invalidate();
		return defaultValue;
	},

	getMetaObject: function (key) {
		return story.meta[key];
	},

	isMandatoryKey: function (key) {
		const mandatoryKeys = ['Scene', 'Character', 'Text', 'Actions', 'Conditions'];
		return mandatoryKeys.includes(key);
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
		newLine.Character = getLocalized(localization.narrator);
		newLine.Actions = [];
		newLine.Text = '...';

		let newScene = { Id: newSceneId, Lines: [newLine] };

		return newScene;
	},

	renameColumn: function (currentKey, newKey) {

		if (currentKey === newKey)
			return currentKey;

		newKey = newKey.replace(/\s/, '');
		let ordering = this.getMetaObject('columnOrdering');
		ordering[newKey] = ordering[currentKey];

		let _rename = function (ok, nk) {
			story.json.Scenes
				.flatMap(scene => scene.Lines)
				.forEach(line => {
					Object.defineProperty(line, nk, Object.getOwnPropertyDescriptor(line, ok));
					delete line[ok];
				});
		};

		this.commitCommand(() => _rename(currentKey, newKey), () => _rename(newKey, currentKey));

		return newKey;
	},

	deleteColumn: function (columnKey) {
		let lines = story.json.Scenes.flatMap(scene => scene.Lines);
		let lineValuesCopy = JSON.parse(JSON.stringify(lines.map(line => line[columnKey])));

		let _delete = function () {
			lines.forEach(line => delete line[columnKey]);
		};

		let _undo = function () {
			lines.forEach((line, index) => line[columnKey] = lineValuesCopy[index]);
		};

		this.commitCommand(() => _delete(), () => _undo());
	},

	createColumn: function (index) {

		let columnKeyFormat = 'New Column %n';
		let columnKey = 'New Column';
		let keyUniqueIndex = 0;
		let lines = story.json.Scenes.flatMap(scene => scene.Lines);

		while (columnKey in lines[0]) {
			keyUniqueIndex++;
			columnKey = columnKeyFormat.replace('%n', keyUniqueIndex);
		}

		index = index + 1; // offset by 1 because of 'Scene' key
		let ordering = this.getMetaObject('columnOrdering');
		let orderingCopy = JSON.parse(JSON.stringify(ordering));

		let _create = function () {
			Object.keys(ordering)
				.filter(key => ordering[key] >= index)
				.forEach(key => ordering[key]++);
			ordering[columnKey] = index;
			lines.forEach(line => line[columnKey] = '');
		};

		let _undo = function () {
			lines.forEach(line => delete line[columnKey]);
			story.meta.columnOrdering = orderingCopy;
		};

		this.commitCommand(() => _create(), () => _undo());
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
		let uidFormat = `${parentId} %n`;
		let uid = parentId;
		let index = 0;

		while (story.json.Scenes.find(s => s.Id == uid)) {
			index++;
			uid = uidFormat.replace('%n', index);
		}

		return uid;
	},

	commitCommand: function (action, undo) {

		const updateStory = () => { story.invalidate(); story.updateTree(); onSceneSelect(Story.currentSceneId); };
		const fullAction = () => { action(); updateStory(); };
		const fullUndo = () => { undo(); updateStory(); };
		fullAction();

		try { registerCommand({ redo: fullAction, undo: fullUndo }); }
		catch (error) {
			console.error('error while registering command ' + error);
		}
	}
};