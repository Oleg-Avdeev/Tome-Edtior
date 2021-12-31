const TransformModeController = {

	selectedNodes: [],

	initialize: function() {
		EditorMode.currentMode.bind('TransformModeController', m => this.updateMode(m));
		
		document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') this.move(1, 0); });
		document.addEventListener('keydown', e => { if (e.key === 'ArrowLeft')	this.move(-1, 0); });
		document.addEventListener('keydown', e => { if (e.key === 'ArrowUp') 	this.move(0, -1); });
		document.addEventListener('keydown', e => { if (e.key === 'ArrowDown') 	this.move(0, 1); });
	},

	updateMode: function(mode) {
		if (mode == 'transform')
			this.enable();
		else this.disable();
	},

	enable: function() {

		this.selectedNodes = [
			currentNode
		];

	},

	disable: function() {
		this.selectedNodes = [];
	},

	move: function(deltaX, deltaY) {

		if (!Story.meta.customOffsets)
			Story.meta.customOffsets = [];

		if (this.selectedNodes.length == 0)
			return;
			
		this.selectedNodes = [
			currentNode
		];

		this.selectedNodes.forEach(node => {

			let offset = Story.meta.customOffsets.find(offset => offset.Id === node.scene.Id);
			if (!offset) {
				offset = { Id: node.scene.Id, x: 0, y: 0 };
				Story.meta.customOffsets.push(offset);
			}

			offset.x += deltaX * xOffset / 2;
			offset.y += deltaY * yOffset / 2;

		});

		Story.invalidate();
		Story.updateTree();
	}
};

document.addEventListener('DOMContentLoaded', function() {
	TransformModeController.initialize();
});