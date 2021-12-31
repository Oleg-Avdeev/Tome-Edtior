var ContextMenuRenderer = {

	menu: null,
	list: null,
	node: null,

	draw: function (targetParagraph, menuPosition, isMissingScene) {
		
		this.targetParagraph = targetParagraph;
		this.menu.classList.remove('hidden');

		this.menu.style.left = menuPosition.x + 'px';
		this.menu.style.top = menuPosition.y + 'px';

		if (isMissingScene) 
			this.resolveSceneItem.classList.remove('hidden');
		else this.resolveSceneItem.classList.add('hidden');
		
		// this.menu.style.borderColor = targetNode.color;
		// this.nodeId.textContent = targetNode.scene.Id;
	},

	hide: function () {
		this.menu.classList.add('hidden');
	},

	initialize: function () {
		
		this.list = document.createElement('ul');
		this.list.classList.add('context-items');
		
		this.menu = document.createElement('nav');
		this.menu.classList.add('context-menu');
		this.menu.classList.add('hidden');
		this.menu.appendChild(this.list);
		
		this.resolveSceneItem = 
			this.createItem('Создать Сцену', 'resolve separated', () => this.resolveMissingScene());
		this.createItem('Добавить Сверху', '', () => this.addLineAbove());
		this.createItem('Добавить Снизу', '', () => this.addLineBelow());
		this.createItem('Удалить Реплику', 'danger', () => this.removeLine());

		document.getElementById('editor').appendChild(this.menu);

		document.addEventListener('click', e => this.hide());
		window.onkeyup += e => { if (e.keyCode === 27) { this.hide(); }};
		window.onresize += e => this.hide();
	},

	createItem: function ( text, styles, action ) {

		let item = document.createElement('li');
		item.classList.add('context-item');
		item.textContent = text;
		
		if (styles) 
			styles.split(' ').forEach(style => item.classList.add(style));

		item.onclick = () => action();

		this.list.appendChild(item);
		return item;
	},

	resolveMissingScene() {
		let missingId = this.targetParagraph.isGotoId;
		
		let newLine = { ...this.targetParagraph.line };
		newLine.Character = '?';
		newLine.Actions = [];
		newLine.Text = '...';
		
		let newScene = { Id: missingId, Lines: [ newLine ] };

		Story.json.Scenes.push(newScene);
		Story.updateTree();
		Story.invalidate();

		this.targetParagraph.setAsActionable();
	},

	addLineAbove() {
		addNewParagraph(this.targetParagraph, true);
	},

	addLineBelow() {
		addNewParagraph(this.targetParagraph);
	},

	removeLine() {
		removeParagraph(this.targetParagraph);
	},

	destroy: function () {
		if (this.menu && this.menu.parentNode)
			this.menu.parentNode.removeChild(this.menu);
	},
};