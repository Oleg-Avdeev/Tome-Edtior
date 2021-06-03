const parse = require('papaparse');
const fs = require('fs')

exports.parseFile = function (file, callback) {

	fs.readFile(file.filePaths[0], 'utf-8', (er, data) => {
		if (er != null) return;

		if (!data.startsWith('Scene'))
			// data = `Scene	Character	Text	Count1	Desc	Trans	Count2	Action	Condition	Comments	Video\n${data}`;
			data = `Scene	Character	Text	Count	Action\n${data}`;

		let result = parse.parse(data, {
			delimiter: '\t',
			encoding: 'utf-8',
			header: true,
			trimHeaders: true,
		});

		let json = toTJSON(result);

		callback(json);
	});
}

let toTJSON = function (tsv) {
	let json = { 'Scenes': [] }

	let scene = { 'Id': '', 'Lines': [] }

	tsv.data.forEach(l => {
		if (l.Text == null || l.Text.length == 0) 
			return;
		
		if (l.Scene == '')
			l.Scene = scene.Id;
		
		if (scene.Id == '')
			scene.Id = l.Scene;

		let line = {};
		var keys = Object.keys(l);
		keys.forEach(key => line[key] = l[key]);

		if (l.Scene != scene.Id) {
			json.Scenes.push(scene);
			scene = { 'Id': l.Scene, 'Lines': [] }
		}
		
		line.Actions = parseActions(l.Actions)
		
		scene.Lines.push(line);
	})

	json.Scenes.push(scene);

	return json;
}

let actionRE = /\[([^\[\]]*)\]/;
let parseActions = function (actions) {
	var matches = actionRE.exec(actions);

	if (matches != null) {
		let id = matches[1];
		let cyclicalEdge = false
		
		if (id.startsWith('*'))
		{
			id = id.replace('*', '');
			cyclicalEdge = true;
		}

		var action = { 'ActionType': 1, 'Value': id, 'Cyclical': cyclicalEdge }
		return [action];
	}

	return []; 
}