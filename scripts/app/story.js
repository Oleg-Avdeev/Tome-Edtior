
exports.createEmptyLine = function () {
	return {
		Text : 'First line of your story',
		Character : 'Character 1',
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