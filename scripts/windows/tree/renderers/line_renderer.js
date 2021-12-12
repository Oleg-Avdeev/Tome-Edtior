class TreeLine { 
	
	constructor(node1, node2) {
		
		this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		var coordinates = this.shortenLine(node1.x, node2.x, node1.y, node2.y, 10);
		this.line.setAttribute('x1', coordinates[0]);
		this.line.setAttribute('x2', coordinates[1]);
		this.line.setAttribute('y1', coordinates[2]);
		this.line.setAttribute('y2', coordinates[3]);
		this.line.classList.add('connector');

		return this.line;
	}

	shortenLine (x1, x2, y1, y2, r) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		var D = Math.sqrt(dx * dx + dy * dy);
		var n = D - 2 * r;
	
		var nx1 = (1 - n / D) * x2 + (n / D) * x1;
		var ny1 = (1 - n / D) * y2 + (n / D) * y1;
		var nx2 = (1 - n / D) * x1 + (n / D) * x2;
		var ny2 = (1 - n / D) * y1 + (n / D) * y2;
	
		return [nx1, nx2, ny1, ny2];
	}

	destroy() {
		if (this.line && this.line.parentNode)
			this.line.parentNode.removeChild(this.line);
	}
}