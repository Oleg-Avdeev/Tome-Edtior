var ContextMenuRenderer = {

	menu: null,
	list: null,
	node: null,
	groups: [],

	draw: function (targetParagraph, menuPosition) {
		
		this.targetParagraph = targetParagraph;
		this.menu.classList.remove('hidden');

		this.menu.style.left = menuPosition.x + 'px';
		this.menu.style.top = menuPosition.y + 'px';

		this.groups.forEach(group => this.clearGroup(group.key));
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

		this.createItem('Добавить Сверху', '', () => this.addLineAbove());
		this.createItem('Добавить Снизу', '', () => this.addLineBelow());
		this.createItem('Удалить Реплику', 'danger', () => this.removeLine());

		document.getElementById('editor').appendChild(this.menu);

		document.addEventListener('click', e => this.hide());
		window.onkeyup += e => { if (e.keyCode === 27) { this.hide(); }};
		window.onresize += e => this.hide();
	},

	createItem: function ( text, styles, action, group ) {

		let item = document.createElement('li');
		item.classList.add('context-item');
		item.textContent = text;
		
		if (styles) 
			styles.split(' ').forEach(style => item.classList.add(style));

		item.onclick = () => action();

		this.list.appendChild(item);

		if (group)
		{
			let itemsGroup = this.groups.find(g => g.key == group);
			if (!itemsGroup)
			{
				itemsGroup = { key: group, items: [] };
				this.groups.push(itemsGroup);
			}
			
			itemsGroup.items.push(item);
		}

		return item;
	},

	createSeparator: function ( group ) {
		let item = document.createElement('li');
		item.classList.add('context-item-separator');
		this.list.appendChild(item);

		if (group)
		{
			let itemsGroup = this.groups.find(g => g.key == group);
			if (!itemsGroup)
			{
				itemsGroup = { key: group, items: [] };
				this.groups.push(itemsGroup);
			}
			
			itemsGroup.items.push(item);
		}
	},

	clearGroup(group) {
		let itemsGroup = this.groups.find(g => g.key == group);
		if (!itemsGroup) return;

		itemsGroup.items.forEach(item => item.parentNode.removeChild(item));
		itemsGroup.items = [];
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
		onSceneSelect(Story.currentSceneId);

		this.targetParagraph.setAsActionable();
	},

	addLineAbove() {
		addNewParagraph(this.targetParagraph, true);
		onSceneSelect(Story.currentSceneId);
	},

	addLineBelow() {
		addNewParagraph(this.targetParagraph);
		onSceneSelect(Story.currentSceneId);
	},

	removeLine() {
		removeParagraph(this.targetParagraph);
		onSceneSelect(Story.currentSceneId);
	},

	destroy: function () {
		if (this.menu && this.menu.parentNode)
			this.menu.parentNode.removeChild(this.menu);
	},
};