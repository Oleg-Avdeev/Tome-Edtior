class CollisionReductionPass {

	
	constructor(depthMap, connectionsMap, xScale, yScale) {
		this.depthMap = depthMap;
		this.connectionsMap = connectionsMap;
		this.xScale = xScale;
		this.yScale = yScale;

		this.debug = false;
	}

	execute() {
		for (const entry of this.connectionsMap.entries())
			entry[1]
				.filter(node2 => node2.node.depth - entry[0].depth <= 3)
				.forEach(node2 => {
					
					let node1 = entry[0];
					let dx = node2.node.x - node1.x;
					let dy = node2.node.y - node1.y;

					for (let depth = node1.depth + 1; depth < node2.node.depth; depth++) {
						let box = this.createIntersectionBox(node1, dx, dy, depth);
						this.findIntersections(box, depth);
						
						if (this.debug)
							this.showIntersectionBox( box.center, box.width );
					}
				});
	}

	findIntersections(box, depth) {

		let row = this.depthMap.get(depth);

		row.filter(n => !n.isPhantom).forEach(n => {

			let nodeBox = { center: { x: n.x, y: n.y }, radius: 10 };

			if (this.doBoxesIntersect(box, nodeBox)) {
				if (this.isParentToTheRight(n, box.center.x)) 
					this.shiftRight( row, n );
				else 
					this.shiftLeft( row, n );
			}
		});
	}

	shiftLeft ( row, stopBox ) {
		row.forEach(shiftNode => {
			if (shiftNode.x <= stopBox.x)
				shiftNode.x -= this.xScale / 2;
		});
	}

	shiftRight ( row, stopBox ) {
		row.forEach(shiftNode => {
			if (shiftNode.x >= stopBox.x)
				shiftNode.x += this.xScale / 2;
		});
	}

	isParentToTheRight ( node, X ) {
		let parent = null;

		for (const entry of this.connectionsMap.entries())
			if (entry[1].find(n => n.node == node))
			{
				parent = entry[0];
				return parent && parent.x > X;
			}
	}

	doBoxesIntersect( box1, box2 ) {
		return Math.abs( box1.center.x - box2.center.x ) < box1.radius + box2.radius;
	}

	createIntersectionBox(node1, dx, dy, depth) {
		let center = this.calculateIntersection(node1.x, node1.y, dx, dy, depth * this.yScale);
		let down = this.calculateIntersection(node1.x, node1.y, dx, dy, depth * this.yScale + 10);
		let top = this.calculateIntersection(node1.x, node1.y, dx, dy, depth * this.yScale - 10);
		let width = Math.max(top.x - down.x, down.x - top.x, 1);

		return { center, width, radius: width/2 };
	}

	calculateIntersection(x0, y0, dx, dy, Y) {
		let x = x0 + ((Y - y0) * dx / dy);
		let y = Y;
		return { x, y };
	}

	showIntersectionBox(center, width) {
		let cross = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		let svg = document.getElementById('canvas');
		cross.setAttribute('x', center.x - width / 2);
		cross.setAttribute('y', center.y - 10);
		cross.style.stroke = '#e22';
		cross.style.width = width;
		cross.style.height = 20;
		svg.appendChild(cross);
	}
}
