
class Paragraph {

	constructor(line, character) {
		const paragraph = document.createElement('p');

		paragraph.textContent = `${line.Text}`;

		if (!isLineNarrated(line))
			paragraph.classList.add('line');
		
		this.htmlNode = paragraph;
		this.character = character;
		this.line = line;

		this.setAsEditable();
		this.setAsActionable();
	}

	setAsEditable () {
		this.htmlNode.contentEditable = true;

		this.htmlNode.addEventListener('input', () => {
			var content = this.htmlNode.childNodes[0].textContent;
			this.line.Text = content;

			var actions = this.htmlNode.childNodes[1].textContent;
			this.actionView.onTextChange(actions);
			
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
			this.actionView.destroy();
			this.actionView = null;
		});
	}

	setAsActionable() {
		var action = this.line.Actions.find(a => a.ActionType == 1);

		if (action != null) {
			
			this.htmlNode.classList.add('goto');
			this.gotoTarget = findNodeById(action.Value);	
			this.htmlNode.onclick = event => this.onActionClick(event);

			if (!this.gotoTarget)
				this.htmlNode.classList.add('invalid');	
		}
	}

	onActionClick(event) {
		if (!this.gotoTarget)
			return;

		if (event.shiftKey) 
			selectNode(this.gotoTarget);
		
	}
}