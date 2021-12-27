var NodeIdRenderer = {

	text: null,
	textBackground: null,

	draw: function (parentNode) {
		this.text.textContent = parentNode.scene.Id;
		this.text.setAttribute('x', parentNode.x);
		this.text.setAttribute('y', parentNode.y - 20);
		
		let box = { height: 12, width: this._getStringLength(parentNode.scene.Id) };
		this.textBackground.setAttribute('x', parentNode.x - 5 - box.width / 2);
		this.textBackground.setAttribute('y', parentNode.y - 20 - box.height / 2);
		this.textBackground.setAttribute('width', box.width + 10);
		this.textBackground.setAttribute('height', box.height);

		this.textBackground.classList.remove('hidden');
		this.text.classList.remove('hidden');
	},

	hide: function () {
		this.textBackground.classList.add('hidden');
		this.text.classList.add('hidden');
	},

	initialize: function () {
		var container = document.getElementById('canvas');

		this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		this.text.classList.add('node-id');
		this.text.classList.add('hidden');
		this.text.setAttribute('text-anchor', 'middle');
		this.text.setAttribute('dominant-baseline', 'middle');

		this.textBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		this.textBackground.classList.add('node-id');
		this.textBackground.classList.add('hidden');
		this.textBackground.setAttribute('text-anchor', 'middle');
		this.textBackground.setAttribute('dominant-baseline', 'middle');

		container.appendChild(this.textBackground);
		container.appendChild(this.text);
	},

	destroy: function () {
		if (this.text && this.text.parentNode)
			this.text.parentNode.removeChild(this.text);

		if (this.textBackground && this.line.textBackground)
			this.textBackground.parentNode.removeChild(this.textBackground);
	},

	_getStringLength: function(string) {
		return string.length * 6.5 * 5/8;
	}
};