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

			ContextMenuRenderer.createItem( 'Разбить на Реплики', '', () => {
				
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
}