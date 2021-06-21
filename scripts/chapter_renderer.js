let container = document.getElementById('chapter-container');
let currentChapter;

let displayChapter = function (chapter) {
	container = document.getElementById('chapter-container');
	container.textContent = '';
	currentChapter = chapter;

	Title.render(chapter);
	chapter.Lines.forEach(createParagraph);

	new ApproveView(chapter, container);
};

let createParagraph = function (line, index) {
	const character = new Character(line);
	const paragraph = new Paragraph(line, character);

	let lineDiv = document.createElement('div');
	lineDiv.appendChild(character.htmlNode);
	lineDiv.appendChild(paragraph.htmlNode);
	lineDiv.classList.add('line');

	container.insertBefore(lineDiv, container.childNodes[index + 1]);
};

let addNewParagraph = function (paragraph) {
	let line = { ...paragraph.line };
	line['checksum'] = null;
	
	let index = currentChapter.Lines.findIndex(line => line == paragraph.line) + 1;

	line.Character = '?';
	line.Text = '...';

	currentChapter.Lines.splice(index, 0, line);
	Story.invalidate();

	createParagraph(line, index);
	container.childNodes[index + 1].childNodes[0].focus();
};

let removeParagraph = function (paragraph) {
	let index = currentChapter.Lines.findIndex(line => line == paragraph.line);
	
	currentChapter.Lines.splice(index, 1);
	Story.invalidate();

	container.removeChild(container.childNodes[index + 1]);
};