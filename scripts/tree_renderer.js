var connectionsMap = new Map();
var depthMap = new Map();
var nodes = [];

var xOffset = 50;
var yOffset = 50;

var currentNode;

let minX = 9999, maxX = 0, minY = 9999, maxY = 0;

let clear = function () {
	connectionsMap.clear();
	depthMap.clear();
	nodes = [];
	minX = 9999;
	minY = 9999;
	maxX = 0;
	maxY = 0;
};

let render = function (json) {
	var container = document.getElementById('canvas');
	container.innerHTML = '';
	clear(container);
	NodeContextRenderer.destroy();

	json.Scenes.forEach(scene => {
		if (scene.Id == '') return;

		let colorData = Story.meta.sceneColors.find(sc => sc.Id === scene.Id);
		let color = colorData ? colorData.color : '#eee';

		nodes.push({ 'index': 0, 'x': 0, 'y': 0, 'depth': 0, 'branch': '', 'passed': false, 'scene': scene, 'htmlNode': null, color: color });
	});

	let i = 0;
	nodes.forEach(node => {
		var connections = getConnections(node);
		connectionsMap.set(node, connections);
		node.passed = true;
		node.index = i;
		i++;
	});

	for (let i = 0; i < 3; i++)
		treeDepthPass();

	treeWidthPass();
	phantomNodesPass();

	for (const entries of depthMap.entries()) {
		var index = 0;
		entries[1].sort((x, y) => x.branch.localeCompare(y.branch));
		entries[1].forEach(n => {
			n.x = xOffset * WMap(index, entries[1].length);
			n.y = yOffset * n.depth;

			if (!n.isPhantom)
				updateBoundingBox(n);

			index++;
		});
	}

	new CollisionReductionPass(depthMap, connectionsMap, xOffset, yOffset).execute();

	if (Story.meta.customOffsets) {
		Story.meta.customOffsets.forEach(offset => {
			let node = nodes.find(n => n.scene.Id === offset.Id);
			if (node) {
				node.x += offset.x;
				node.y += offset.y;
				updateBoundingBox(node);
			}
		});
	}

	container.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

	for (const entry of connectionsMap.entries()) {
		entry[1].forEach(node2 => {
			var line = buildSVGLine(entry[0], node2.node);
			container.appendChild(line);
		});
	}

	nodes.forEach(n => {
		var node = buildSVGNode(n);
		updateApprovedState(n);
		container.appendChild(node);
	});

	renderGrid(container);
	let scenePositions = [];
	// nodes.forEach(n => scenePositions.push({id: n.scene.Id, x: n.x, y: n.y}));

	Story.meta.scenePositions = scenePositions;
	Story.invalidate();

	NodeIdRenderer.initialize();
	NodeContextRenderer.initialize();
};

let renderGrid = function (container) {
	let gridSize = 25;
	let xSize = maxX / gridSize;
	let ySize = maxY / gridSize;

	let highlightFreq = 2;

	for (let x = -xSize; x < xSize; x++) {
		let lineSVG = document.createElementNS('http://www.w3.org/2000/svg', 'line');

		lineSVG.setAttribute('x1', x * gridSize);
		lineSVG.setAttribute('x2', x * gridSize);
		lineSVG.setAttribute('y1', -2000);
		lineSVG.setAttribute('y2', 2000);
		lineSVG.classList.add('grid-line');
		
		if (x % highlightFreq == 0)
			lineSVG.classList.add('highlight');

		container.prepend(lineSVG);
	}

	for (let y = -10; y < ySize; y++) {
		let lineSVG = document.createElementNS('http://www.w3.org/2000/svg', 'line');

		lineSVG.setAttribute('y1', y * gridSize);
		lineSVG.setAttribute('y2', y * gridSize);
		lineSVG.setAttribute('x1', -2000);
		lineSVG.setAttribute('x2', 2000);
		lineSVG.classList.add('grid-line');

		if (y % highlightFreq == 0)
			lineSVG.classList.add('highlight');

		container.prepend(lineSVG);
	}
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
};

let getConnections = function (node) {
	var actions = [];
	node.scene.Lines.forEach(line => {
		line.Actions.forEach(action => {
			if (action.ActionType === 1) {
				var n = findNodeById(action.Value);
				if (n != null) {
					actions.push({ 'node': n, 'ignoreDepthPass': action.Cyclical });
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

let phantomNodesPass = function () {
	for (const entry of connectionsMap.entries()) {
		entry[1].forEach(node2 => {
			let deltaDepth = node2.node.depth - entry[0].depth;

			if (deltaDepth > 3) return;

			for (let i = 1; i < deltaDepth; i++) {
				let phantom = { branch: entry[0].branch + `${i}`, x: 0, y: 0, depth: entry[0].depth + i, isPhantom: true };
				let row = depthMap.get(phantom.depth);
				row.push(phantom);
			}
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

let updateBoundingBox = function (node) {
	minX = Math.min(node.x - 100, minX);
	minY = Math.min(node.y - 100, minY);
	maxX = Math.max(node.x + 100, maxX);
	maxY = Math.max(node.y + 100, maxY);
};

let buildSVGNode = function (nodeData) {
	return new TreeNode(nodeData, connectionsMap, NodeIdRenderer, NodeContextRenderer);
};

let buildSVGLine = function (node1, node2) {

	let deltaDepth = node2.depth - node1.depth;

	if (deltaDepth > 3 || deltaDepth < -1)
		return new TreeCurvyLine(node1, node2);

	else return new TreeLine(node1, node2);
};

let updateApprovedState = function (node) {
	let invalidCount = 0;

	node.scene.Lines.forEach(line => {
		if (!LineValidator.isValid(line)) {
			invalidCount++;
			return;
		}
	});

	if (invalidCount > 0)
		node.htmlNode.classList.add('pending');
	else
		node.htmlNode.classList.add('approved');
};