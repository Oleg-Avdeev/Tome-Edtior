displayTable = function(chapter) {
	var container = document.getElementById('chapter-table');
	container.textContent = '';

	chapter.Lines.forEach(line => {
		var p = createRow(line);
		container.appendChild(p);
	})
}

createRow = function(line) {
	const row = document.createElement("tr");
	
	// paragraph.classList.add('chapter-line');
	// paragraph.textContent = `${line.Character}:\t${line.Text}`;

	return paragraph;
}