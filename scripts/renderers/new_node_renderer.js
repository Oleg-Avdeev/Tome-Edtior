
var NewNode = {
	node : null,
	line : null,
	plus : null,
	parentNode : null,

	draw : function (parentNode) {
		this.parentNode = parentNode;

		let newNode =  { ...parentNode };
		let indexInLine = depthMap.get(parentNode.depth + 1).length;
		newNode.depth = parentNode.depth + 1;
		newNode.x = xOffset * WMap(indexInLine, indexInLine)
		newNode.y = yOffset * newNode.depth;

		this.destroy();
		this.initialize(parentNode, newNode);
	},

	initialize : function(parentNode, newNode) {
		var container = document.getElementById('canvas');

		this.node = buildSVGNode(newNode);
		this.node.onclick = (e) => this.onClick();
		this.node.classList.add('new');

		this.line = buildSVGLine(parentNode, newNode);
		
		this.plus = document.createElementNS("http://www.w3.org/2000/svg", 'text');
		this.plus.classList.add('new');
		this.plus.textContent = '+';
		this.plus.setAttribute('x', newNode.x - 4.3);
		this.plus.setAttribute('y', newNode.y + 4);
		
		container.appendChild(this.node);
		container.appendChild(this.line);
		container.appendChild(this.plus);
	},

	destroy : function() {
		if (this.node && this.node.parentNode)
			this.node.parentNode.removeChild(this.node)

		if (this.line && this.line.parentNode)
			this.line.parentNode.removeChild(this.line)

		if (this.plus && this.plus.parentNode)
			this.plus.parentNode.removeChild(this.plus)
	},

	onClick : function() {
		let newSceneId = this.parentNode.scene.Id + '_';
		
		let lastLine = this.parentNode.scene.Lines[this.parentNode.scene.Lines.length - 1];
		let gotoAction = { 'ActionType': ActionType.goto, 'Value': newSceneId }
		let newLink = { ... lastLine };
		newLink.Actions = [gotoAction];
		newLink.Text = `Go to ${newSceneId}`;
		
		this.parentNode.scene.Lines.push(newLink);

		let newLine = { ...lastLine };
		newLine.Character = '?';
		newLine.Actions = [];
		newLine.Text = '...';
		
		let newScene = { Id: newSceneId, Lines: [ newLine ] }
		Story.json.Scenes.push(newScene);
		Story.invalidate();

		render(Story.json);
		selectNodeById(newSceneId);
	}
}