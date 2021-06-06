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
	}

	setAsEditable() {
		this.htmlNode.contentEditable = true;

		this.htmlNode.addEventListener('input', () => {
			this.htmlNode.textContent = this.htmlNode.textContent.replace('\n', '');
			this.line.Character = this.htmlNode.textContent;
			Story.invalidate();
		});

		this.htmlNode.addEventListener('keydown', event => {
			if (event.key == 'Enter') this.paragraph.focus();
		});
	}

	setTargetParagraph(paragraph) {
		this.paragraph = paragraph;
	}
}