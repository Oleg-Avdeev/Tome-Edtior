class Paragraph {

	constructor(line, character) {
		const paragraph = document.createElement('p');
		const content = document.createElement('span');

		paragraph.appendChild(content);
		content.textContent = `${line.Text}`;

		if (!isLineNarrated(line))
			paragraph.classList.add('line');

		character.setTargetParagraph(paragraph);

		this.htmlNode = paragraph;
		this.character = character.htmlNode;
		this.line = line;

		this.setAsEditable();
		this.setAsActionable();
	}

	setAsEditable() {
		this.htmlNode.contentEditable = true;

		this.htmlNode.addEventListener('input', () => {
			var content = this.getTextContent();
			this.line.Text = content;

			Story.invalidate();
		});

		this.htmlNode.addEventListener('keydown', event => {
			if (event.key == 'Enter') {
				if (this.htmlNode.textContent.length > 0)
					addNewParagraph(this);
				else removeParagraph(this);
			}
		});

		this.htmlNode.addEventListener('focus', () => {
			this.actionView = new ActionView(this.line, this);
		});

		this.htmlNode.addEventListener('blur', () => {
			this.actionView.onOwnerLostFocus();
			this.actionView = null;
		});
	}

	setAsActionable() {
		var action = this.line.Actions.find(a => a.ActionType == 1);
		if (action) {

			this.htmlNode.classList.add('goto');
			this.gotoTarget = getSceneById(action.Value);
			this.htmlNode.onclick = event => this.onActionClick(event);

			if (!this.gotoTarget)
				this.htmlNode.classList.add('invalid');
		}
		else {
			this.htmlNode.classList.remove('goto');
			this.htmlNode.classList.remove('invalid');
			this.htmlNode.onclic = null;
			this.gotoTarget = null;
		}
	}

	onActionClick(event) {
		if (!this.gotoTarget)
			return;

		if (event.shiftKey)
			Story.selectScene(this.gotoTarget.Id);
	}

	getTextContent() {
		var content = this.htmlNode.childNodes[0];

		if (content)
			return content.textContent;

		return '';
	}
}