class TabsRenderer {

	constructor (projectRenderer) {
		
		this.projectRenderer = projectRenderer;

		this.toolbar = document.createElement('div');
		this.toolbar.classList.add('editor-tabs');
		
		this.list = document.createElement('ul');
		this.list.classList.add('toolbar-list');

		this.toolbar.appendChild(this.list);
		this.items = [];
	}

	initialize() {
		
		this.list.innerHTML = null;

		this.scriptButton = this.createScriptButton();
		this.tableButton = this.createTableButton();

		this.scriptButton.classList.add('active');
		
		document.getElementById('splitter').appendChild(this.toolbar);
	}

	createScriptButton() {
		
		let icon = document.createElement('img');
		icon.src = './styles/icons/script.svg';
		icon.classList.add('tabs-button');
		
		icon.onclick = () => {
			onSceneSelect(Story.currentSceneId);
			document.getElementById('table-container').classList.add('hidden');
			document.getElementById('chapter-container').classList.remove('hidden');
			this.scriptButton.classList.add('active');
			this.tableButton.classList.remove('active');
		};

		this.list.appendChild(icon);
		return icon;
	}

	createTableButton() {
		
		let icon = document.createElement('img');
		icon.src = './styles/icons/table.svg';
		icon.classList.add('tabs-button');
		
		icon.onclick = () => {
			onSceneSelect(Story.currentSceneId);
			document.getElementById('table-container').classList.remove('hidden');
			document.getElementById('chapter-container').classList.add('hidden');
			this.scriptButton.classList.remove('active');
			this.tableButton.classList.add('active');
		};

		this.list.appendChild(icon);
		return icon;
	}
}