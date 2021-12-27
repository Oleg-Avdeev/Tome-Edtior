let displayTable = function(chapter) {
	var container = document.getElementById('chapter-table');
	container.textContent = '';

	container.appendChild(createTableName(chapter.Lines[0]));
	container.appendChild(createHeader(chapter.Lines[0]));

	chapter.Lines.forEach(line => {
		var tr = createRow(line);
		container.appendChild(tr);
	});
};

let createTableName = function(line) {
	
	let colorData = Story.meta.sceneColors.find(sc => sc.Id === line.Scene);
	let color = colorData ? colorData.color : '#eee';

	const caption = document.createElement('caption');
	let sceneId = line.Scene;

	caption.textContent = sceneId;
	caption.style.setProperty('--color', color);
	return caption;
};

let createHeader = function(line) {
	const row = document.createElement('tr');
	let keys = Object.keys(line).filter(k => k != 'Scene');

	keys.forEach((value, index) => {
		const cell = document.createElement('th');
		cell.classList.add(`column-${keys[index].replace(' ', '')}`);
		cell.textContent = value;
		row.appendChild(cell);
	});

	return row;
};

let createRow = function(line) {
	const row = document.createElement('tr');
	const values = Object.values(line);
	const keys = Object.keys(line);
	
	values.forEach((value, index) => {
		
		if (index == 0) return;
		
		const cell = document.createElement('td');
		
		if (keys[index] == 'Actions')
			value = ActionParser.toText(value);
		
		if (keys[index] == 'Conditions')
			value = ConditionParser.toText(value);

		if (!value)
			value = '-';

		cell.textContent = value;
		cell.classList.add(`column-${keys[index].replace(' ', '')}`);
		cell.contentEditable = true;
		row.appendChild(cell);
	});

	return row;
};