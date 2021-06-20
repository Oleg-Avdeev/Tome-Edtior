class ActionView {

	constructor(line, paragraph) {
		let actionView = document.createElement('div');
		actionView.classList.add('action');

		let label = document.createElement('span');
		label.classList.add('action-label');
		label.textContent = 'Actions:';

		let input = document.createElement('div');
		input.classList.add('action-input');
		input.textContent = ActionParser.toText(line.Actions);
		input.contentEditable = true;

		actionView.appendChild(label);
		actionView.appendChild(input);
		paragraph.htmlNode.before(actionView);

		this.currentText = actionView.textContent;
		this.htmlNode = actionView;
		this.paragraph = paragraph;
		this.line = line;

		input.addEventListener('focus', () => { this.isFocused = true; });
		input.addEventListener('blur', () => { this.isFocused = false; this.destroy(); });
		input.addEventListener('input', () => this.onTextChange(input.textContent));
	}

	onOwnerLostFocus() {
		this.ownerHasFocus = false;
		setTimeout(() => this.checkFocus(), 5);
	}

	checkFocus() {
		if (!this.isFocused && !this.ownerHasFocus)
			this.destroy();
	}

	destroy() {
		if (this.htmlNode)
			this.htmlNode.parentNode.removeChild(this.htmlNode);
	}

	onTextChange(text) {
		if (text != this.currentText) {
			var newActions = ActionParser.parse(text);
			
			if (!this.compareActions(this.line.Actions, newActions))
			{
				this.line.Actions = newActions;
				this.paragraph.setAsActionable();
				
				Story.invalidate();
				Story.updateTree();
			}
		}
	}

	compareActions(oldAction, newAction) {
		return JSON.stringify(oldAction) == JSON.stringify(newAction);
	}
}