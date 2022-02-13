let container = document.getElementById('chapter-container');
let currentChapter;

let displayChapter = function (chapter) {
	
	ContextMenuRenderer.destroy();
	ContextMenuRenderer.initialize();

	container = document.getElementById('chapter-container');
	container.textContent = '';
	currentChapter = chapter;

	Title.render(chapter);
	chapter.Lines.forEach(createParagraph);

	new ApproveView(chapter, container);
};

let createParagraph = function (line, index) {
	const character = new Character(line);
	const paragraph = new Paragraph(line, character, ContextMenuRenderer);

	let lineDiv = document.createElement('div');
	lineDiv.appendChild(character.htmlNode);
	lineDiv.appendChild(paragraph.htmlNode);
	lineDiv.classList.add('line');

	container.insertBefore(lineDiv, container.childNodes[index + 1]);
};

let addNewParagraph = function (paragraph, addAbove, copyContents) {
	let line = { ...paragraph.line };
	line['checksum'] = null;
	
	let indexOffset = 1;
	if (addAbove) indexOffset = 0;
	let index = currentChapter.Lines.findIndex(line => line == paragraph.line) + indexOffset;

	if (!copyContents)
	{
		line.Character = '?';
		line.Text = '...';
	}

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