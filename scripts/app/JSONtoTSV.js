const actionsParser = require('./ActionParser');

exports.build = function (document) {
	let body = getHeader(document);
	document.Scenes.forEach(scene => {
		scene.Lines.forEach(line => {
			line.Actions = actionsParser.toText(line.Actions);
			let tsvLine = buildLine(Object.values(line));
			body = body + '\n' + tsvLine;
		});
	});
	return body;
};

getHeader = function (document) {
	let keys = Object.keys(document.Scenes[0].Lines[0]);
	return buildLine(keys);
};

buildLine = function (array) {
	var line = '';

	for (let index = 0; index < array.length; index++) {
		line = line + array[index];
		if (index < array.length - 1)
			line = line + '\t';
	}

	return line;
};