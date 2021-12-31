class Character {

	constructor(line) {
		let character = document.createElement('p');

		this.line = line;
		this.htmlNode = character;
		
		if (!isLineNarrated(line)) {
			character.textContent = `${line.Character}`;
			character.classList.add('character');
			this.setAsEditable(character, line);
		}
		
		this.updateApprovedState();
	}

	setAsEditable() {
		this.htmlNode.contentEditable = true;

		this.htmlNode.addEventListener('input', () => {
			this.htmlNode.textContent = this.htmlNode.textContent.replace('\n', '');
			this.line.Character = this.htmlNode.textContent;
			this.updateApprovedState();
			Story.invalidate();
		});

		this.htmlNode.addEventListener('keyup', event => {
			if (event.key == 'Enter') 
			{
				event.stopPropagation();
				this.paragraph.focus();
			}
		});
	}

	setTargetParagraph(paragraph) {
		this.paragraph = paragraph;
	}

	updateApprovedState() {
		if (LineValidator.isValid(this.line))
			this.htmlNode.classList.add('approved');
		else 
			this.htmlNode.classList.add('pending');
	}
}