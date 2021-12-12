class TreeNode { 
	
	constructor(nodeData, connectionsMap, nodeIdRenderer, nodeContextRenderer) {
		
		this.nodeData = nodeData;
		this.nodeContextRenderer = nodeContextRenderer;

		this.node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		this.svg = document.getElementById('canvas');

		this.node.setAttribute('x', nodeData.x - 10);
		this.node.setAttribute('y', nodeData.y - 10);
		this.node.classList.add('node');

		this.node.onmouseenter = () => nodeIdRenderer.draw(nodeData);
		this.node.onmouseleave = () => nodeIdRenderer.hide();

		if (connectionsMap.has(nodeData) && connectionsMap.get(nodeData).length == 0)
			this.node.classList.add('edge');

		this.node.onclick = e => this.onClick(e);
		this.node.onmouseup = e => this.onRightClick(e);
	
		nodeData.htmlNode = this.node;
		return this.node;
	}

	destroy() {
		if (this.node && this.node.parentNode)
			this.node.parentNode.removeChild(this.node);
	}

	onClick(e) {
		Story.selectScene(this.nodeData.scene.Id);
	}

	onRightClick(e) {
		if (e.button === 2)
			this.nodeContextRenderer.draw(this.nodeData, { x: e.clientX, y: e.clientY });
	}

	// Haven't figured drag&drop out, some matrix transformation issues...
}