class ColumnHeader {

	constructor(key, index) {

		this.key = key;
		this.index = index;
		this.htmlCell = document.createElement('th');
		this.htmlCell.textContent = key;

		let safeKey = key.replaceAll(/[^a-z]/ig, '');
		this.htmlCell.classList.add(`column-${safeKey}`);

		this.htmlCell.onclick = e => this.onLeftClick(e);
		this.htmlCell.oncontextmenu = e => this.onRightClick(e);
	}

	onLeftClick(e) {
		toggleColumnCollapse(this.index);
	}

	onRightClick(e) {

		ContextMenuRenderer.draw(this, { x: e.clientX, y: e.clientY }, false);

		let isDeletingAllowed = !StoryHelper.isMandatoryKey(this.key);
		let deleteStyle = isDeletingAllowed ? 'danger' : 'danger blocked';

		ContextMenuRenderer.createItem(getLocalized(localization.renameColumn), '', () => {
			this.htmlCell.contentEditable = true;
			this.htmlCell.onclick = null;
			this.htmlCell.focus();

			this.htmlCell.addEventListener('blur', () => { 
				this.htmlCell.contentEditable = false;
				this.htmlCell.onclick = e => this.onLeftClick(e);
				this.htmlCell.textContent = StoryHelper.renameColumn(this.key, this.htmlCell.textContent);
			});
		}, 'column-actions');

		ContextMenuRenderer.createItem(getLocalized(localization.deleteColumn), deleteStyle, () => {
			if (isDeletingAllowed) StoryHelper.deleteColumn(this.key);
		}, 'column-actions');

		ContextMenuRenderer.addCustomItem(this.createAddColumnControl(), 'column-actions');

		ContextMenuRenderer.createSeparator('column-actions');

		ContextMenuRenderer.createItem(getLocalized(localization.isEnumerable), 'blocked', () => {
			//TODO: Implement
		}, 'column-actions-enum');
		ContextMenuRenderer.createItem(getLocalized(localization.reviewValues), 'blocked', () => {
			//TODO: Implement
		}, 'column-actions-enum');
	}

	createAddColumnControl() {

		let container = document.createElement('div');
		container.classList.add('add-column-container');

		let buttonLeft = document.createElement('div');
		buttonLeft.classList.add('button');
		buttonLeft.textContent = '←';
		buttonLeft.onclick = () => StoryHelper.createColumn(this.index);
		
		let label = document.createElement('div');
		label.textContent = getLocalized(localization.addColumn);

		let buttonRight = document.createElement('div');
		buttonRight.style.textAlign = 'right';
		buttonRight.classList.add('button');
		buttonRight.textContent = '→';
		buttonRight.onclick = () => StoryHelper.createColumn(this.index + 1);

		container.appendChild(buttonLeft);
		container.appendChild(label);
		container.appendChild(buttonRight);

		return container;
	}
}