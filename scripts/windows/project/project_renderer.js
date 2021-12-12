class ProjectRenderer {

	constructor () {
		
		this.project = document.createElement('div');
		this.project.classList.add('project-browser');
		this.project.classList.add('hidden');
		
		this.list = document.createElement('ul');
		this.list.classList.add('project-list');

		this.project.appendChild(this.list);
		this.items = [];
	}

	show() {
		this.shown = true;
		this.project.classList.remove('hidden');
	}
	
	hide() {
		this.shown = false;
		this.project.classList.add('hidden');
	}

	toggle() {
		if (this.shown) this.hide();
		else this.show();
	}

	setDocuments( documentNames ) {
		this.documentNames = documentNames;
		this.documentNames.forEach(file => this.createFileItem(file));
		document.getElementById('editor').appendChild(this.project);
	}

	setCurrentDocument( filename ) {
		this.items.forEach(item => {
			if (item.name == filename )
				item.item.classList.add('current');
			else
				item.item.classList.remove('current');
		});
	}

	createFileItem( filename ) {
		let item = document.createElement('li');
		item.classList.add('project-item');
		
		let icon = document.createElement('img');
		icon.src = './styles/icons/document.svg';
		icon.classList.add('project-item-icon');

		let text = document.createElement('span');
		text.textContent = filename;
		
		item.appendChild(icon);
		item.appendChild(text);
		
		this.list.appendChild(item);
		this.items.push({ name: filename, item: item });

		item.onclick = () => window.api.send('select-document', filename);
	}

	
}