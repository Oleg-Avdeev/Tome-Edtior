var container;
var currentChapter;

displayChapter = function (chapter) {
	container = document.getElementById('chapter-container');
	container.textContent = '';

	createTitle(chapter);
	chapter.Lines.forEach(createParagraph);

	currentChapter = chapter;
};

createTitle = function (chapter) {
	const title = document.createElement('h1');
	title.textContent = chapter.Id;
	container.appendChild(title);
};

createParagraph = function (line, index) {

	const character = document.createElement('p');
	const paragraph = document.createElement('p');

	if (!isLineNarrated(line)) {
		character.classList.add('character');
		character.contentEditable = true;
		character.textContent = `${line.Character}`;

		character.addEventListener('input', () => {
			character.textContent = character.textContent.replace('\n', '');
			line.Character = character.textContent;
			Story.invalidate();
		});

		character.addEventListener('keydown', event => {
			if (event.key == 'Enter') paragraph.focus();
		});
	}

	paragraph.contentEditable = true;
	paragraph.textContent = `${line.Text}`;
	paragraph.addEventListener('input', (event) => {
		paragraph.textContent = paragraph.textContent.replace('\n', '');
		line.Text = paragraph.textContent;
		Story.invalidate();
	});

	//TODO: Split instead of create new
	paragraph.addEventListener('keydown', event => {
		if (event.key == 'Enter') {
			if (paragraph.textContent.length > 0)
				addNewParagraph(index + 1, paragraph);
			else removeParagraph(index, character, paragraph);
		}
	});

	if (!isLineNarrated(line))
		paragraph.classList.add('line');

	var action = line.Actions.find(a => a.ActionType === 1);
	if (action != null) {
		var target = findNodeById(action.Value);
		paragraph.onclick = (e) => {
			if (e.shiftKey) selectNode(target);
		};
		paragraph.classList.add('goto');
	}

	container.insertBefore(paragraph, container.childNodes[index * 2 + 1]);
	container.insertBefore(character, container.childNodes[index * 2 + 1]);
};

addNewParagraph = function (index) {
	let line = { ...currentChapter.Lines[index - 1] };
	line.Character = '?';
	line.Text = '...';

	currentChapter.Lines.splice(index, 0, line);
	Story.invalidate();

	createParagraph(line, index);
	container.childNodes[index * 2 + 1].focus();
};

removeParagraph = function (index, character, paragraph) {
	currentChapter.Lines.splice(index, 1);
	Story.invalidate();

	if (character.parentNode)
		character.parentNode.removeChild(character);

	if (paragraph.parentNode)
		paragraph.parentNode.removeChild(paragraph);
};

isLineNarrated = function (line) {
	if (line.Character.toLocaleLowerCase().includes('нарратор'))
		return true;

	if (line.Character.toLocaleLowerCase().includes('narrator'))
		return true;

	return false;
};