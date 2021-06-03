exports.build = function (document) {
	let body = getHeader(document);
	document.Scenes.forEach(scene => {
		scene.Lines.forEach(line => {
			let tsvLine = buildLine(Object.values(line));
			body = body + '\n' + tsvLine;
		});
	});
	return body;
}

getHeader = function (document) {
	let keys = Object.keys(document.Scenes[0].Lines[0]);
	return buildLine(keys);
}

buildLine = function (array) {
	var line = '';
	array.forEach(value => line = line + value + '\t');
	return line;
}