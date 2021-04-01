var container;

displayChapter = function(chapter) {
	container = document.getElementById('chapter-container');
	container.textContent = '';

	createTitle(chapter);
	chapter.Lines.forEach(createParagraph);
}

createTitle = function(chapter) {
	const title = document.createElement("h1");
	title.textContent = chapter.Id;
	container.appendChild(title);
}

createParagraph = function(line) {

	if (line.Character !== 'Нарратор')
	{
		const character = document.createElement("p");
		character.classList.add('character');
		character.textContent = `${line.Character}`;
		container.appendChild(character);
	}

	const paragraph = document.createElement("p");
	paragraph.textContent = `${line.Text}`;
	
	if (line.Character !== 'Нарратор')
		paragraph.classList.add('line');

	var action = line.Actions.find(a => a.ActionType === 1);
	if (action != null)
	{
		var target = findNodeById(action.Value);
		paragraph.onclick = (e) => selectNode(target);
		paragraph.classList.add('goto');
	}

	container.appendChild(paragraph);
}