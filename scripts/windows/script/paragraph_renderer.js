class Paragraph {

	constructor(line, character, contextMenuRenderer) {
		const paragraph = document.createElement('p');
		const content = document.createElement('span');
		const condition = document.createElement('span');

		paragraph.appendChild(content);
		content.textContent = `${line.Text}`;
		
		if (line.Conditions.length > 0)
		{
			condition.textContent = `	(Если ${ConditionParser.toText(line.Conditions)})`;
			paragraph.appendChild(condition);
		}

		if (!isLineNarrated(line))
			paragraph.classList.add('paragraph');

		character.setTargetParagraph(paragraph);

		this.htmlNode = paragraph;
		this.contextMenuRenderer = contextMenuRenderer;
		this.character = character.htmlNode;
		this.line = line;

		this.setAsEditable();
		this.setAsActionable();
		this.updateApprovedState();
	}

	setAsEditable() {
		this.htmlNode.contentEditable = true;

		this.htmlNode.addEventListener('input', () => {
			var content = this.getTextContent();
			this.line.Text = content;
			this.updateApprovedState();
			Story.invalidate();
		});

		this.htmlNode.addEventListener('keydown', event => {
			if (event.key == 'Enter') { event.preventDefault(); }
		});
		
		this.htmlNode.addEventListener('keyup', event => {
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

		this.htmlNode.onmouseup = e => this.onRightClick(e);
	}

	setAsActionable() {
		var action = this.line.Actions.find(a => a.ActionType == 1);
		if (action) {

			this.htmlNode.classList.add('goto');
			this.gotoTarget = getSceneById(action.Value);
			this.htmlNode.onclick = event => this.onActionClick(event);
			this.htmlNode.setAttribute('error', '');
			this.isGotoId = action.Value;

			if (!this.gotoTarget)
			{
				this.htmlNode.classList.add('invalid');
				this.htmlNode.setAttribute('error', `Сцена "${action.Value}" не найдена`);
			}
		}
		else {
			this.htmlNode.classList.remove('goto');
			this.htmlNode.classList.remove('invalid');
			this.htmlNode.setAttribute('error', '');
			this.htmlNode.onclick = null;
			this.gotoTarget = null;
			this.isGotoId = null;
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
		
		if (content) {
			return content.textContent;
		}

		return '';
	}

	updateApprovedState() {
		if (LineValidator.isValid(this.line))
			this.htmlNode.classList.add('approved');
		else 
			this.htmlNode.classList.add('pending');
	}

	onRightClick(e) {
		if (e.button === 2)
			this.contextMenuRenderer.draw(this, { x: e.clientX, y: e.clientY }, this.isGotoId && !this.gotoTarget);
	}
}