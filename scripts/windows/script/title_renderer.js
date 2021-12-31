const Title = {
	scene: {},
	htmlNode : {},

	render: function (scene) {
		this.scene = scene;

		const container = document.getElementById('chapter-container');
		const title = document.createElement('h1');
		this.htmlNode = title;

		title.textContent = scene.Id;
		this.displayIdValidity(scene.Id);

		title.contentEditable = true;

		//TODO: Validate Id
		//TODO: Only commit valid id
		//TODO: Rebuild if topology changes

		title.addEventListener('input', () => {
			let newId = title.textContent.replace('\n', '');
			title.textContent = newId;
			
			if (this.isValidId(newId))
				this.updateId(newId);
			
			this.displayIdValidity(newId);
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

				if (gotoAction && gotoAction.Value == newId)
					requiresTopologyUpdate = true;
				
				if (gotoAction && gotoAction.Value == oldId)
					gotoAction.Value = newId;
			});
		});

		
		if(requiresTopologyUpdate)
			Story.updateTree();
	},

	isValidId : function (id) {
		let idIsTaken = 0;

		Story.json.Scenes.forEach(scene => {
			if (idIsTaken) return;
			if (scene.Id == id && scene != this.scene)
				idIsTaken = true;
		});

		return !idIsTaken;
	},

	displayIdValidity : function (id) {
		if (this.isValidId(id))
		{
			this.htmlNode.classList.remove('invalid');
		}
		else
		{
			this.htmlNode.classList.add('invalid');
			this.htmlNode.setAttribute('error', 'Сцена с таким названием уже существует');
		}
	}
};