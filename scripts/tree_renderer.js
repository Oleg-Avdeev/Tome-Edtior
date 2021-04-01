var connectionsMap = new Map();
var depthMap = new Map();
var nodes = [];

var xCenter = 250;
var xOffset = 50;
var yOffset = 50;

var currentNode;

render = function (json) {

	var container = document.getElementById('canvas');
	json.Scenes.forEach(scene => {
		nodes.push({ "x": 0, "y": 0, "depth": 0, "branch": "", "passed": false, "scene": scene, "htmlNode": null });
	});

	nodes.forEach(node => {
		var connections = getConnections(node);
		connectionsMap.set(node, connections);
		node.passed = true;
	});

	treeDepthPass();
	treeDepthPass();
	treeDepthPass();

	treeWidthPass();

	for (const entries of depthMap.entries()) {
		var index = 0;
		entries[1].sort((x, y) => x.branch < y.branch);
		entries[1].forEach(n => {
			n.x = xCenter + xOffset * WMap(index, entries[1].length)
			n.y = yOffset + yOffset * n.depth;
			index++;
		})
	}

	nodes.forEach(n => {
		var node = buildSVGNode(n);
		container.appendChild(node);
	});

	for (const entry of connectionsMap.entries()) {
		entry[1].forEach(node2 => {
			var line = buildSVGLine(entry[0], node2);
			container.appendChild(line);
		})
	}

	selectNode(nodes[0]);
}

selectNode = function (node) {

	if (currentNode != null)
		currentNode.htmlNode.classList.remove('selected');

	currentNode = node;
	currentNode.htmlNode.classList.add('selected');

	displayChapter(node.scene);
}

getConnections = function (node) {
	var actions = [];
	node.scene.Lines.forEach(line => {
		line.Actions.forEach(action => {
			if (action.ActionType === 1) {
				var n = findNodeById(action.Value);
				if (n != null) {
					actions.push(n);
				}
			}
		});
	});
	return actions;
}

treeDepthPass = function () {
	for (const entry of connectionsMap.entries()) {
		var choice = 0;
		entry[1].forEach(node2 => {
			node2.depth = Math.max(node2.depth, entry[0].depth + 1);
			node2.branch = entry[0].branch + choice;
			choice++;
		})
	}
}

treeWidthPass = function () {
	nodes.forEach(n => {
		var depthList = depthMap.get(n.depth);
		if (depthList == null) depthList = [];
		depthList.push(n)
		depthMap.set(n.depth, depthList);
	})
}

findNodeById = function (id) {
	return nodes.find(x => {
		// console.log(`${x.scene.Id} = ${id}`)
		return x.scene.Id == id;
	});
}

ZMap = function (index) {
	return Math.pow(-1, index + 1) * Math.ceil(0.5 * index);
}

WMap = function (index, length) {
	return index - length / 2;
}

buildSVGNode = function (n) {
	const node = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
	node.setAttribute('x', n.x - 10);
	node.setAttribute('y', n.y - 10);
	node.classList.add('node');

	if (connectionsMap.get(n).length == 0)
		node.classList.add('edge');

	node.onclick = e => selectNode(n);
	n.htmlNode = node;

	return node;
}

buildSVGLine = function (node1, node2) {
	const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
	var coordinates = shortenLine(node1.x, node2.x, node1.y, node2.y, 10);
	line.setAttribute('x1', coordinates[0]);
	line.setAttribute('x2', coordinates[1]);
	line.setAttribute('y1', coordinates[2]);
	line.setAttribute('y2', coordinates[3]);
	line.classList.add('connector');
	return line
}

shortenLine = function (x1, x2, y1, y2, r) {
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