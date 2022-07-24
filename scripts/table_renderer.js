let Header = [];
let Table = [];

let displayTable = function (chapter) {
	var container = document.getElementById('chapter-table');
	container.textContent = '';
	Header = [];
	Table = [];

	container.appendChild(createHeader(chapter.Lines[0]));

	chapter.Lines.forEach(line => {
		var tr = createRow(line);
		container.appendChild(tr);
	});

	collapseColumns();
};

let createHeader = function (line) {
	const row = document.createElement('tr');
	let keys = Object.keys(line).filter(k => k != 'Scene');

	let defaultOrdering = {}; keys.forEach((value, index) => defaultOrdering[value] = index);
	let ordering = StoryHelper.getOrCreateMetaObject('columnOrdering', defaultOrdering);
	
	keys
		.sort((k1, k2) => ordering[k1] - ordering[k2])
		.forEach((value, index) => {
			let cell = new ColumnHeader(value, index).htmlCell;
			row.appendChild(cell);
			Header.push(cell);
		});

	return row;
};

let createRow = function (line) {
	let ordering = StoryHelper.getMetaObject('columnOrdering');

	const row = document.createElement('tr');
	const keys = Object.keys(line);
	const objectRow = [];

	keys
		.sort((k1, k2) => ordering[k1] - ordering[k2])
		.forEach((key, index) => {

			if (index == 0) return;

			let cell = new Cell(line, key, line[key]);
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