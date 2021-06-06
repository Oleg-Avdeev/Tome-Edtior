const Title = {
	scene: {},

	render: function (scene) {
		this.scene = scene;

		const container = document.getElementById('chapter-container');
		const title = document.createElement('h1');

		title.textContent = scene.Id;
		title.contentEditable = true;

		//TODO: Validate Id
		//TODO: Only commit valid id
		//TODO: Rebuild if topology changes

		title.addEventListener('input', () => {
			let newId = title.textContent.replace('\n', '');
			title.textContent = newId;
			
			if (this.isValidId(newId))
			{
				this.updateId(newId);
				title.classList.remove('invalid');
			}
			else
			{
				title.classList.add('invalid');
			}
		});

		container.appendChild(title);
	},

	updateId: function (newId) {
		this.updateTree(this.scene.Id, newId);
		this.scene.Id = newId;
		Story.invalidate();
	},

	updateTree: function (oldId, newId) {
		let requiresTopologyUpdate = false;

		Story.json.Scenes.forEach(scene => {
			scene.Lines.forEach(line => {
				let gotoAction = line.Actions.find(action => action.ActionType == 1);

				if (gotoAction && gotoAction.value == newId)
					requiresTopologyUpdate = true;

				if (gotoAction && gotoAction.value == oldId)
					gotoAction.value = newId;
			});
		});

		
		if(requiresTopologyUpdate)
			render(Story.json);
	},

	isValidId : function (id) {
		let scene = Story.json.Scenes.find(scene => scene.Id == id);
		return scene == null;
	}
}