class ActionView {

	constructor(line, paragraph) {
		let actionView = document.createElement('div');
		actionView.textContent = ActionParser.toText(line.Actions);
		actionView.classList.add('action');
		
		paragraph.htmlNode.appendChild(actionView);
		
		this.currentText = actionView.textContent;
		this.htmlNode = actionView;
		this.line = line;
	}

	destroy() {
		if (this.htmlNode)
			this.htmlNode.parentNode.removeChild(this.htmlNode);
	}

	onTextChange(text) {
		if (text != this.currentText)
		{
			var newActions = ActionParser.parse(text);
			this.line.Actions = newActions;
			
			Story.invalidate();
			render(Story.json);
		}
	}
}