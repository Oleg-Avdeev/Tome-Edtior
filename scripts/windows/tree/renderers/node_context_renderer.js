var NodeContextRenderer = {

	menu: null,
	list: null,
	node: null,
	nodeId: null,

	draw: function (targetNode, menuPosition) {
		
		this.node = targetNode;
		this.menu.classList.remove('hidden');

		this.menu.style.borderColor = targetNode.color;
		this.menu.style.left = menuPosition.x + 'px';
		this.menu.style.top = menuPosition.y + 'px';

		this.nodeId.textContent = targetNode.scene.Id;

		console.log(this.node.scene.Id);
	},

	hide: function () {
		console.log('Hide');
		this.menu.classList.add('hidden');
	},

	initialize: function () {
		
		this.list = document.createElement('ul');
		this.list.classList.add('context-items');
		
		this.menu = document.createElement('nav');
		this.menu.classList.add('context-menu');
		this.menu.classList.add('hidden');
		this.menu.appendChild(this.list);
		
		this.nodeId = document.createElement('li');
		this.nodeId.classList.add('context-id');
		this.nodeId.textContent = '';
		this.list.appendChild(this.nodeId);

		this.createColorPalette();

		this.createItem('Удалить Блок', 'danger', () => {
			Story.json.Scenes = Story.json.Scenes.filter(s => s.Id != this.node.scene.Id);
			Story.updateTree();
			Story.invalidate();
		});

		document.getElementById('editor').appendChild(this.menu);

		document.addEventListener('click', e => this.hide());
		window.onresize += e => this.hide();
		window.onkeyup += e => {
			if (e.keyCode === 27) {
				this.hide();
			}
		};
	},

	createItem: function ( text, style, action ) {

		let item = document.createElement('li');
		item.classList.add('context-item');
		item.classList.add(style);
		item.textContent = text;

		item.onclick = () => action();

		this.list.appendChild(item);
	},

	createColorPalette: function () {
		let item = document.createElement('li');
		item.classList.add('context-color-palette');
		this.list.appendChild(item);

		const colors = [
			'#C9411C', '#E5912A', '#30d07c', '#20abda', '#c360d1'
		];

		colors.forEach(color => {
			let colorButton = document.createElement('div');
			colorButton.classList.add('context-color-button');
			colorButton.style.backgroundColor = color;

			colorButton.onclick = () => {
				if (this.node.color == color)
					this.node.color = '#eee';
				else this.node.color = color;

				this.node.htmlNode.style.stroke = this.node.color;
				
				let data = Story.meta.sceneColors.find(sc => sc.Id === this.node.scene.Id);
				if (!data)
				{
					data = { Id: this.node.scene.Id, color: color };
					Story.meta.sceneColors.push(data);
				}
				
				data.color = color;

				Story.invalidate();
			};

			item.appendChild(colorButton);
		});
	},

	destroy: function () {
		if (this.menu && this.menu.parentNode)
			this.menu.parentNode.removeChild(this.menu);
	},
};