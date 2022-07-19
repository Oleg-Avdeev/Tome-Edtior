class TreeCurvyLine { 
	
	constructor(node1, node2) {
		
		let direction = node1.x >= 0 ? 1 : -1;

		let offsetX = 0;
		let shoulder = direction * (this.calculateMinShoulder(node1, node2) + offsetX);
		shoulder *= 1.3;

		let shorten = direction * 17;
		let offset = ((node2.x + node1.x + node1.y + node2.y) % 9);
		
		const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		
		let x0 = node1.x + shorten + shoulder / 4;
		let y0 = node1.y + offset;
		let cx0 = node1.x + shoulder + offset;
		let cy0 = node1.y + offset;
		let cx1 = node1.x + shoulder + offset;
		let cy1 = node2.y - offset;
		let x1 = node2.x + shorten;
		let y1 = node2.y - offset;	
		
		curve.setAttribute('d', `M ${x0} ${y0} C ${cx0} ${cy0} ${cx1} ${cy1} ${x1} ${y1}`);
		curve.classList.add('connector');

		const a = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		
		a.setAttribute('x1', node1.x + shorten);
		a.setAttribute('x2', x0);
		a.setAttribute('y1', node1.y + offset);
		a.setAttribute('y2', node1.y + offset);
		a.classList.add('line');

		this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		this.group.appendChild(curve);
		this.group.appendChild(a);
		return this.group;
	}

	calculateMinShoulder(node1, node2, direction) {
		let min = Math.min(node1.depth, node2.depth);
		let max = Math.max(node1.depth, node2.depth);
		let maxWidth = 0;
		
		for (let i = min; i < max; i++)
		{
			let width = depthMap.get(i)
				.filter(n => !n.isPhantom)
				.map(n => n.x)
				.reduce((x1, x2) => direction * x1 < direction * x2 ? x1 : x2);
			
			if (width > maxWidth)
				maxWidth = width;
		}
		
		let maxOffset = Math.abs(maxWidth + xOffset);
		let currentOffset = Math.abs(node1.x + xOffset * 0.5);
		let shoulder = maxOffset - currentOffset;

		if (Math.abs(shoulder) < 40)
			shoulder = 40;

		return shoulder;
	}

	destroy() {
		if (this.group && this.group.parentNode)
			this.group.parentNode.removeChild(this.group);
	}
}