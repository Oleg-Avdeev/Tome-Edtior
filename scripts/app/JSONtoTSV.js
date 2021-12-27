const actionsParser = require('./ActionParser');

exports.build = function (document) {
	let header = getHeader(document);
	let body = buildHeader(header);

	document.Scenes.forEach(scene => {
		scene.Lines.forEach(line => {
			line.Scene = scene.Id;
			line.Actions = actionsParser.toText(line.Actions);
			let tsvLine = buildLine(header, line);
			body = body + '\n' + tsvLine;
		});
	});
	return body;
};

let getHeader = function (document) {
	return Object.keys(document.Scenes[0].Lines[0]);
};

let buildLine = function (header, line) {
	var tsv = '';
	
	for (let index = 0; index < header.length; index++) {
		tsv = tsv + line[header[index]];
		if (index < header.length - 1)
			tsv = tsv + '\t';
	}

	return tsv;
};

let buildHeader = function (header) {
	var line = '';
	
	for (let index = 0; index < header.length; index++) {
		line = line + header[index];
		if (index < header.length - 1)
			line = line + '\t';
	}

	return line;
};