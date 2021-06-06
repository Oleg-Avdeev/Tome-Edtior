
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
			this.htmlNode.textContent = this.htmlNode.textContent.replace('\n', '');
			this.line.Text = this.htmlNode.textContent;
			Story.invalidate();
		});

		this.htmlNode.addEventListener('keydown', event => {
			if (event.key == 'Enter') {
				if (this.htmlNode.textContent.length > 0)
					addNewParagraph(this);
				else removeParagraph(this);
			}
		});
	}

	setAsActionable() {
		var action = this.line.Actions.find(a => a.ActionType == 1);
		if (action != null) {
			
			this.htmlNode.classList.add('goto');
			var target = findNodeById(action.Value);
			
			if (target)
			{
				this.gotoTarget = target;
				this.htmlNode.onclick = event => this.onActionClick(event);

			}
			else
			{
				this.htmlNode.classList.add('invalid');
			}
		}
	}

	onActionClick(event) {
		if (!this.gotoTarget)
			return;

		if (event.shiftKey) 
			selectNode(this.gotoTarget);
		
	}
}