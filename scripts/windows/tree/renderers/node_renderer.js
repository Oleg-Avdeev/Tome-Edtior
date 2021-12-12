class TreeNode { 
	
	constructor(nodeData, connectionsMap, nodeIdRenderer) {
		
		this.nodeData = nodeData;
		this.node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		this.svg = document.getElementById('canvas');

		this.node.setAttribute('x', nodeData.x - 10);
		this.node.setAttribute('y', nodeData.y - 10);
		this.node.classList.add('node');

		this.node.onmouseenter = () => nodeIdRenderer.draw(nodeData);
		this.node.onmouseleave = () => nodeIdRenderer.hide();

		if (connectionsMap.has(nodeData) && connectionsMap.get(nodeData).length == 0)
			this.node.classList.add('edge');

		this.node.onclick = () => this.onClick();
	
		nodeData.htmlNode = this.node;
		return this.node;
	}

	destroy() {
		if (this.node && this.node.parentNode)
			this.node.parentNode.removeChild(this.node);
	}

	onClick() {
		Story.selectScene(this.nodeData.scene.Id);
	}

	// Haven't figured drag&drop out, some matrix transformation issues...
}