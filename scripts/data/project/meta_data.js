module.exports = class Meta {


	buildLookup ( documents ) {
		
		console.time('buildCharacterList');

		let ignoreKeys = [ 'Actions', 'Scene', 'Text', 'Count', 'Conditions' ];

		let flatLines = 
			documents.flatMap(json => JSON.parse(json).story.
				Scenes.flatMap(scene => scene.Lines));
		
		let flatKeys = flatLines.flatMap(line => Object.keys(line));
		let uniqueKeys = [...new Set(flatKeys)].sort((a, b) => a.localeCompare(b));

		uniqueKeys.forEach(key => {
			if (ignoreKeys.find(k => k === key)) return;

			let values = flatLines.flatMap(line => line[key]);
			let uniqueValues = [...new Set(values)];
			console.log(`${key} : ${uniqueValues}`);
		});
		
		console.timeEnd('buildCharacterList');
	}

};