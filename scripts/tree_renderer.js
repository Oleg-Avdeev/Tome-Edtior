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

	json.Scenes.forEach(scene => {
		if (scene.Id == '') return;
		nodes.push({ 'index': 0, 'x': 0, 'y': 0, 'depth': 0, 'branch': '', 'passed': false, 'scene': scene, 'htmlNode': null });
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

	NodeIdRenderer.initialize();
};

let selectNodeById = function (sceneId) {
	console.log(sceneId);
	var node = nodes.find(n => n.scene.Id == sceneId);
	if (node) selectNode(node);
};

let selectNode = function (node) {
	if (currentNode)
		currentNode.htmlNode.classList.remove('selected');

	currentNode = node;
	currentNode.htmlNode.classList.add('selected');

	NewNode.draw(node);
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

let phantomNodesPass = function() {
	for (const entry of connectionsMap.entries()) {
		entry[1].forEach(node2 => {
			let deltaDepth = node2.node.depth - entry[0].depth;

			if (deltaDepth > 3) return;

			for (let i = 1; i < deltaDepth; i++) {
				let phantom = { branch: entry[0].branch + `${i}`, x: 0, y: 0, depth: entry[0].depth + i, isPhantom: true};
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
	return new TreeNode(nodeData, connectionsMap, NodeIdRenderer);
};

let buildSVGLine = function (node1, node2) {

	let deltaDepth = node2.depth - node1.depth;

	if (deltaDepth > 3 || deltaDepth < -1) 
		return new TreeBorkLine(node1, node2);
	
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