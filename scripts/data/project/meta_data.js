module.exports = class Meta {

	constructor() {

	}

	buildLookup ( documents ) {
		
		console.time('buildCharacterList');

		let ignoreKeys = [ 'Actions', 'Scene', 'Text', 'Count', 'Conditions', 'Счётчик' ];

		let flatLines = 
			documents.flatMap(json => JSON.parse(json).story.
				Scenes.flatMap(scene => scene.Lines));
		
		let flatKeys = flatLines.flatMap(line => Object.keys(line));
		let uniqueKeys = [...new Set(flatKeys)]
			.sort((a, b) => a.localeCompare(b));

		let lookupTable = [];

		uniqueKeys.forEach(key => {
			if (ignoreKeys.find(k => k === key)) return;

			let values = flatLines.flatMap(line => line[key]);
			let uniqueValues = [...new Set(values)].filter(v => v);
			
			if (uniqueValues.length > 0)
				lookupTable.push({ key: key, values: uniqueValues });
			
			console.log(`${key} : ${uniqueValues}`);
		});
		
		console.timeEnd('buildCharacterList');
		return lookupTable;
	}

};