const autoplayer = {

	_story: {},

	_subcontexts: [],

	playStory: function (story) {

		const context = {
			'scene': '',
			'wordsCount': 0,
			'isFinal': false,
			'errors': [],
			'path': [],
			'variables': {},
			'executedCommands': {},
			'subcontexts': [],
		};

		this._story = story;
		let scene = story.Scenes[0];
		playScene(scene, context);

		this._subcontexts.push(context);

		return context;
	},

	cleanup : function () {
		this._story = {};
		this._subcontexts = [];
	}
};

exports.Autoplayer = autoplayer;

const playScene = function (scene, context) {
	context.scene = scene.Id;
	context.path.push(scene.Id);
	playAllLines(scene.Lines, context);
};

const playAllLines = function (lines, context) {

	lines.forEach(line => {
		context.wordsCount += countWords(line.Text);

		if (canAct(line, context))
			act(line, context);
	});

};

// Length counting
const countWords = function (string) {
	return string.split(' ').length;
};

// Actions
const ActionType = Object.freeze({ 'goto': 1, 'command': 2, 'compute': 3 });

const act = function (line, context) {
	
	const splitsPaths = line.Actions.find(a => a.ActionType == ActionType.goto);
	const nextContext = splitsPaths ? copy(context) : context;

	// GOTO gets executed last...
	let orderedActions = line.Actions.sort((a1, a2) => a1.ActionType > a2.ActionType ? -1 : 1);

	orderedActions.forEach(action => {
		
		if (action.ActionType == ActionType.goto) {
			let nextScene = autoplayer._story.Scenes.find(s => s.Id == action.Value);
			if (nextScene) 
				playScene(nextScene, nextContext);
			else if (action.Value == '@NEXTTREE')
				context.isFinal = true;
			else context.errors.push(`Couldn't go to scene ${action.Value} from ${line.Scene}`);
		}

		if (action.ActionType == ActionType.compute) {
			let variable = action.Variable;

			if (!nextContext.variables[variable])
				nextContext.variables[variable] = 0;
			
			if (action.Operator == 'plus')
				nextContext.variables[variable] += 1;
			if (action.Operator == 'minus')
				nextContext.variables[variable] -= 1;
			if (action.Operator == 'assign')
				nextContext.variables[variable] = action.Value;
		}

		if (action.ActionType == ActionType.command) {
			if (!nextContext.executedCommands[action.Value])
				nextContext.executedCommands[action.Value] = 0;
			nextContext.executedCommands[action.Value]++;
		}
	});

};

const copy = function (context) {
	let subcontext = JSON.parse(JSON.stringify(context));
	
	subcontext.subcontexts = [];
	context.subcontexts.push(autoplayer._subcontexts.length);
	autoplayer._subcontexts.push(subcontext);

	return subcontext;
};

// Conditions
const canAct = function (line, context) {
	line = context;
	return true;
};
