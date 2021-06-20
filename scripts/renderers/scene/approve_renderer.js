class ApproveView {

	constructor(scene, container) {
		let approveView = document.createElement('div');
		approveView.classList.add('approve-panel');

		let label = document.createElement('span');
		label.classList.add('approve-label');
		label.textContent = 'Mark as valid?';

		let button = document.createElement('div');
		button.classList.add('approve-button');
		button.textContent = 'OK';

		approveView.appendChild(label);
		approveView.appendChild(button);
		container.appendChild(approveView);

		this.scene = scene;
		this.htmlNode = approveView;

		button.onclick = () => this.markAsValidated();
	}

	destroy() {
		if (this.htmlNode)
			this.htmlNode.parentNode.removeChild(this.htmlNode);
	}

	markAsValidated() {
		this.scene.Lines.forEach(line => {
			LineValidator.validate(line);
		});

		Story.updateTree();
		Story.invalidate();
	}
}