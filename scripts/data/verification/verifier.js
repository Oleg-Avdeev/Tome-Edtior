const { Autoplayer } = require('../../data/verification/autoplayer');

const verifier = {

	_story: {},

	verifyStory: function(story) {
		Autoplayer.playStory(story);
		this._story = story;
	},
	
	buildVariableDistributionReport: function(sceneId) {
		const report = {};
		const allContexts = Autoplayer._subcontexts;
		this._story.Scenes.forEach(scene => report[scene.Id] = findAllUniqueStatesOfScene(scene, allContexts));

		report[`distribution_${sceneId}`] = {};
		report[sceneId].forEach(state => {
			Object.entries(state).forEach(([key, value]) => {
				if (!report[`distribution_${sceneId}`][key])
					report[`distribution_${sceneId}`][key] = 0;
					
				report[`distribution_${sceneId}`][key] += value;
			});
		});

		return report;
	},

	buildErrorsReport: function() {
		const report = {};
		let errorContexts = Autoplayer._subcontexts.filter(c => c.errors.length > 0);
		this._story.Scenes.forEach(scene => {
			let contexts = errorContexts.filter(c => c.scene == scene.Id).map(c => c.errors);
			if (contexts.length > 0) report[scene.Id] = contexts;
		});
		return report;
	},

	buildTextLengthDistributionReport : function(sceneId) {
		const report = {};
		let wordsDistribution = Autoplayer._subcontexts.filter(c => c.scene == sceneId).map(c => c.wordsCount);
		
		report['average'] = wordsDistribution.reduce((p,c) => p + c) / wordsDistribution.length;
		report['min'] = wordsDistribution.reduce((p, c) => p < c ? p : c);
		report['max'] = wordsDistribution.reduce((p, c) => p > c ? p : c);
		report['entries'] = wordsDistribution;
		
		return report;
	},

	buildEndpointsReport: function() {

	},
};

exports.Verifier = verifier;

const findAllUniqueStatesOfScene = function (scene, allContexts) {
	const sceneContexts = allContexts.filter(c => c.scene == scene.Id);

	const seenVariableSets = [];
	sceneContexts.filter((context) => {
		if (seenVariableSets.find(s => compareObjects(s, context.variables)))
			return false;

		seenVariableSets.push(context.variables);
		return true;
	});

	return seenVariableSets;
};

const compareObjects = function (o1, o2) {
	for (let p in o1) {
		if (o1[p]) {
			if (o1[p] !== o2[p]) {
				return false;
			}
		}
	}

	for (let p2 in o2) {
		if (o2[p2]) {
			if (o1[p2] !== o2[p2]) {
				return false;
			}
		}
	}

	return true;
};
