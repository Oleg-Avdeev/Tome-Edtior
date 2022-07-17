let Header = [];
let Table = [];

let displayTable = function (chapter) {
	var container = document.getElementById('chapter-table');
	container.textContent = '';
	Header = [];
	Table = [];

	container.appendChild(createTableName(chapter.Lines[0]));
	container.appendChild(createHeader(chapter.Lines[0]));

	chapter.Lines.forEach(line => {
		var tr = createRow(line);
		container.appendChild(tr);
	});

	collapseColumns();
};

let createTableName = function (line) {

	let colorData = Story.meta.sceneColors.find(sc => sc.Id === line.Scene);
	let color = colorData ? colorData.color : '#eee';

	const caption = document.createElement('caption');
	let sceneId = line.Scene;

	caption.textContent = sceneId;
	caption.style.setProperty('--color', color);
	return caption;
};

let createHeader = function (line) {
	const row = document.createElement('tr');
	let keys = Object.keys(line).filter(k => k != 'Scene');

	keys.forEach((value, index) => {
		const cell = document.createElement('th');

		let safeKey = keys[index].replaceAll(/[^a-z]/ig, '');
		cell.classList.add(`column-${safeKey}`);
		cell.textContent = value;
		cell.onclick = () => toggleColumnCollapse(index);
		row.appendChild(cell);
		Header.push(cell);
	});

	return row;
};

let createRow = function (line) {
	const row = document.createElement('tr');
	const values = Object.values(line);
	const keys = Object.keys(line);
	const objectRow = [];

	values.forEach((value, index) => {

		if (index == 0) return;

		let cell = new Cell(line, keys[index], value);
		row.appendChild(cell.htmlCell);
		objectRow.push(cell);
	});

	Table.push(objectRow);

	return row;
};

let getCells = function (firstIndex, lastIndex, key) {
	let cells = Table
		.slice(firstIndex, lastIndex + 1)
		.map(row => row.find(cell => cell.key == key));

	return cells;
};

let collapseColumns = function () {
	if (!Story.meta.collapsedColumns)
		Story.meta.collapsedColumns = [];

	Story.meta.collapsedColumns
		.forEach(index => collapseColumn(index));
};

let toggleColumnCollapse = function (index) {
	if (!Header[index].classList.contains('collapsed')) {
		Header[index].classList.add('collapsed');
		Table.forEach(row => row[index].htmlCell.classList.add('collapsed'));
		Story.meta.collapsedColumns.push(index);
	}
	else {
		Header[index].classList.remove('collapsed');
		Table.forEach(row => row[index].htmlCell.classList.remove('collapsed'));
		
		let metaIndex = Story.meta.collapsedColumns.indexOf(index);
		Story.meta.collapsedColumns.splice(metaIndex, 1);
	}

	Story.invalidate();
};

let collapseColumn = function (index) {
	if (!Header[index]) return;
	Header[index].classList.add('collapsed');
	Table.forEach(row => row[index].htmlCell.classList.add('collapsed'));
};