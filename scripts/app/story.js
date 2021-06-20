
exports.createEmptyLine = function () {
	return {
		Character : 'Character 1',
		Text : 'First line of your story',
		Actions : [],
	};
};

exports.createEmpty = function () {
	let line = this.createEmptyLine();

	return {
		Scenes: [
			{ Id : 'Scene 1', Lines: [ line ], }
		]
	};
};