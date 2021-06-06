var connectionsMap = new Map();
var depthMap = new Map();
var nodes = [];

var xOffset = 50;
var yOffset = 50;

var currentNode;

let minX = 9999, maxX = 0, minY = 9999, maxY = 0;

let clear = function() {
	connectionsMap.clear();
	depthMap.clear();
	nodes = [];
	minX = 9999; 
	minY = 9999; 
	maxX = 0; 
	maxY = 0;
};

let render = function (json) {
	Story.initialize(json);

	var container = document.getElementById('canvas');
	container.innerHTML = '';
	clear(container);

	json.Scenes.forEach(scene => {
		if (scene.Id == '') return;
		nodes.push({ 'index' : 0, 'x': 0, 'y': 0, 'depth': 0, 'branch': '', 'passed': false, 'scene': scene, 'htmlNode': null });
	});

	let i = 0;
	nodes.forEach(node => {
		var connections = getConnections(node);
		connectionsMap.set(node, connections);
		node.passed = true;
		node.index = i;
		i++;
	});

	treeDepthPass();
	treeDepthPass();
	treeDepthPass();

	treeWidthPass();

	for (const entries of depthMap.entries()) {
		var index = 0;
		entries[1].sort((x, y) => x.branch.localeCompare(y.branch));
		entries[1].forEach(n => {
			n.x = xOffset * WMap(index, entries[1].length);
			n.y = yOffset * n.depth;
			updateBoundingBox(n);
			index++;
		});
	}
	
	container.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

	nodes.forEach(n => {
		var node = buildSVGNode(n);
		container.appendChild(node);
	});

	for (const entry of connectionsMap.entries()) {
		entry[1].forEach(node2 => {
			var line = buildSVGLine(entry[0], node2.node);
			container.appendChild(line);
		});
	}

	selectNodeById(Story.currentSceneId);
};

let selectNodeById = function (sceneId) {
	var node = nodes.find(n => n.scene.Id == sceneId);
	if (node) selectNode(node);
};

let selectNode = function (node) {
	if (currentNode)
		currentNode.htmlNode.classList.remove('selected');

	currentNode = node;
	currentNode.htmlNode.classList.add('selected');

	displayChapter(node.scene);
	// displayTable(node.scene);

	NewNode.draw(node);

	Story.selectNode(node.scene.Id);
};

let getConnections = function (node) {
	var actions = [];
	node.scene.Lines.forEach(line => {
		line.Actions.forEach(action => {
			if (action.ActionType === 1) {
				var n = findNodeById(action.Value);
				if (n != null) {
					actions.push({'node':n, 'ignoreDepthPass':action.Cyclical});
				}
				else {
					console.error(`Node ${action.Value} not found`);
				}
			}
		});
	});
	return actions;
};

let treeDepthPass = function () {
	for (const entry of connectionsMap.entries()) {
		entry[1].forEach(node2 => {
			if (node2.ignoreDepthPass) return;

			node2.node.depth = Math.max(node2.node.depth, entry[0].depth + 1);
			node2.node.branch = entry[0].branch + `${node2.node.index}`;
		});
	}
};

let treeWidthPass = function () {
	nodes.forEach(n => {
		var depthList = depthMap.get(n.depth);
		if (depthList == null) depthList = [];
		depthList.push(n);
		depthMap.set(n.depth, depthList);
	});
};

let findNodeById = function (id) {
	return nodes.find(x => {
		return x.scene.Id == id;
	});
};

let ZMap = function (index) {
	return Math.pow(-1, index + 1) * Math.ceil(0.5 * index);
};

let WMap = function (index, length) {
	return index - length / 2;
};

let updateBoundingBox = function(node) {
	minX = Math.min(node.x - 100, minX);
	minY = Math.min(node.y - 100, minY);
	maxX = Math.max(node.x + 100, maxX);
	maxY = Math.max(node.y + 100, maxY);
};

let buildSVGNode = function (n) {
	const node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	node.setAttribute('x', n.x - 10);
	node.setAttribute('y', n.y - 10);
	node.classList.add('node');

	if (connectionsMap.has(n) && connectionsMap.get(n).length == 0)
		node.classList.add('edge');

	node.onclick = e => { 
		selectNode(n); 
	};
	n.htmlNode = node;

	return node;
};

let buildSVGLine = function (node1, node2) {
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	var coordinates = shortenLine(node1.x, node2.x, node1.y, node2.y, 10);
	line.setAttribute('x1', coordinates[0]);
	line.setAttribute('x2', coordinates[1]);
	line.setAttribute('y1', coordinates[2]);
	line.setAttribute('y2', coordinates[3]);
	line.classList.add('connector');
	return line;
};

let shortenLine = function (x1, x2, y1, y2, r) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var D = Math.sqrt(dx * dx + dy * dy);
	var n = D - 2 * r;

	var nx1 = (1 - n / D) * x2 + (n / D) * x1;
	var ny1 = (1 - n / D) * y2 + (n / D) * y1;
	var nx2 = (1 - n / D) * x1 + (n / D) * x2;
	var ny2 = (1 - n / D) * y1 + (n / D) * y2;

	return [nx1, nx2, ny1, ny2];
};