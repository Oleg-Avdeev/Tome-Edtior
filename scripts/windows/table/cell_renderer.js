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
	
		this.htmlCell.classList.add(`column-${key.replace(' ', '')}`);
		this.htmlCell.contentEditable = true;
		this.htmlCell.textContent = value;

		this.htmlCell.onmouseup = e => this.onRightClick(e);

		this.htmlCell.addEventListener('input', () => {
			let content = this.htmlCell.textContent;
			
			if (key == 'Actions')
				content = ActionParser.parse(content);
			
			if (key == 'Conditions')
				content = ConditionParser.parse(content);
			
			line[key] = content;
			
			Story.invalidate();
		});
	}

	onRightClick(e) {
		if (e.button === 2)
		{
			ContextMenuRenderer.draw(this, { x: e.clientX, y: e.clientY }, false);

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
}