let cellFirst = { };
let cellLast = { };
let selectedCells = [];

class Cell {

	constructor(line, key, value) {

		this.key = key;
		this.line = line;
		this.htmlCell = document.createElement('td');
		
		if (key == 'Actions')
			value = ActionParser.toText(value);
		
		if (key == 'Conditions')
			value = ConditionParser.toText(value);

		if (!value)
			value = '-';
		
		let safeKey = key.replaceAll(/[^a-z]/ig, '');
		this.htmlCell.classList.add(`column-${safeKey}`);
		this.htmlCell.contentEditable = true;
		this.htmlCell.textContent = value;

		this.htmlCell.onmouseup = e => this.onClick(e);

		this.htmlCell.addEventListener('input', () => {
			let content = this.htmlCell.textContent;
			
			if (key == 'Actions')
				content = ActionParser.parse(content);
			
			if (key == 'Conditions')
				content = ConditionParser.parse(content);
			
			line[key] = content;
			this.applyToSelectedCells(content);
			
			Story.invalidate();
		});
	}

	onClick(e) {
		if (e.button === 2)
			this.onRightClick(e);

		selectedCells.forEach(c => c.deselect());
		selectedCells = [];

		if (e.shiftKey)
		{
			cellLast = this;
			let range = this.getRange();
			
			selectedCells = getCells(range[0], range[1], this.key);
			selectedCells.forEach(c => c.select());

			setTimeout(() => cellLast.htmlCell.focus(), 0);
		}
		else
		{
			cellFirst = this;
		}
	}

	onRightClick(e) {
		if (e.button === 2)
		{
			ContextMenuRenderer.draw(this, { x: e.clientX, y: e.clientY }, false);
			ContextMenuRenderer.addLineActions();

			ContextMenuRenderer.createItem( getLocalized(localization.splitIntoLines), '', () => {
				
				let newLines = this.htmlCell.innerHTML
					.split('<br>')
					.flatMap(l => l.split('/'))
					.filter(l => l);
 
				for (let i = 1; i < newLines.length; i++) {
					this.line['Text'] = newLines[newLines.length - i];
					addNewParagraph(this, false, true);
				}
					
				this.line['Text'] = newLines[0];
				Story.invalidate();
				onSceneSelect(Story.currentSceneId);
			}, 'cell-actions');
			
			let existingValues = ProjectMeta.lookup.find(l => l.key == this.key);
			if (existingValues)
			{
				ContextMenuRenderer.createSeparator('existing-values');
				existingValues.values.forEach(v => {
					ContextMenuRenderer.createItem( v, '', () => { 
						this.line[this.key] = v; 
						this.htmlCell.textContent = v;
						Story.invalidate();
					}, 'existing-values');
				});
			}

		}
	}

	getRange() {
		let index0 = currentChapter.Lines.findIndex(l => l == cellFirst.line);
		let index1 = currentChapter.Lines.findIndex(l => l == cellLast.line);
		let indexFirst = Math.min(index0, index1);
		let indexLast = Math.max(index0, index1);
		return [ indexFirst, indexLast ];
	}

	applyToSelectedCells(content) {
		selectedCells.forEach(cell => cell.htmlCell.textContent = content);
		selectedCells.forEach(cell => cell.line[cell.key] = content);
	}

	select() {
		this.htmlCell.classList.add('selected');
	}

	deselect() {
		this.htmlCell.classList.remove('selected');
	}
}