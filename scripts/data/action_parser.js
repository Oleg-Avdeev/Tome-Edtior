const ActionType = Object.freeze({ 'goto': 1, 'command': 2, 'compute': 3 });
const OpenedBracket = ['', '[', '(', '{'];
const ClosedBracket = ['', ']', ')', '}'];

const gotoRE = /\[([^[\]]*)\]/;
const commandRE = /\(([^()]*)\)/;
const computeRE = /\{([^{}]*)\}/;

const ActionParser = {
	parse: function (actions) {
		var parsedActions = [];

		parseGoTo(actions).forEach(a => parsedActions.push(a));
		parseCommand(actions).forEach(a => parsedActions.push(a));
		parseCompute(actions).forEach(a => parsedActions.push(a));

		return parsedActions;
	},

	toText: function (actions) {
		var text = '';
		actions.forEach(action => {
			var id = action.Value;

			if (action.ActionType == ActionType.goto && action.Cyclical)
				id = `*${id}`;
			
			if (action.ActionType == ActionType.compute)
			{
				if (action.Operator == 'assign')
					id = `${action.Variable}=${action.Value}`;
				else
					id += action.Variable;
			}

			text += `${OpenedBracket[action.ActionType]}${id}${ClosedBracket[action.ActionType]}`;
		});
		return text;
	}
};

let parseGoTo = function (actions) {
	var matches = gotoRE.exec(actions);

	if (matches != null) {
		let id = matches[1];
		let cyclicalEdge = false;

		if (id.startsWith('*')) {
			id = id.replace('*', '');
			cyclicalEdge = true;
		}

		var action = {
			'ActionType': ActionType.goto,
			'Value': id,
			'Cyclical': cyclicalEdge
		};

		return [action];
	}

	return [];
};

//TODO: Parse all actions
//TODO: Parse completely
let parseCommand = function (actions) {
	var matches = commandRE.exec(actions);

	if (matches != null) {
		let id = matches[1];

		var action = {
			'ActionType': ActionType.command,
			'Value': id,
		};

		return [action];
	}

	return [];
};

const plusRE = /^([+])([a-zА-ЯA-Zа-я0-9]*)/;
const minusRE = /^([-])([a-zА-ЯA-Zа-я0-9]*)/;
const assignRE = /^([a-zА-ЯA-Zа-я0-9]*)=([-a-zА-ЯA-Zа-я0-9]*)/;

let parseCompute = function (actions) {
	const matches = computeRE.exec(actions);
	const parsedActions = [];

	if (matches != null) {
		parseComputeWithRE(matches[1], plusRE, 'plus', 2, 1).forEach(a => parsedActions.push(a));
		parseComputeWithRE(matches[1], minusRE, 'minus', 2, 1).forEach(a => parsedActions.push(a));
		parseComputeWithRE(matches[1], assignRE, 'assign', 1, 2).forEach(a => parsedActions.push(a));
	}

	return parsedActions;
};

let parseComputeWithRE = function (string, re, operator, varIndex, valIndex) {
	var matches = re.exec(string);

	if (matches != null) {

		var action = {
			'ActionType': ActionType.compute,
			'Operator': operator,
			'Variable': matches[varIndex],
			'Value': matches[valIndex],
		};

		return [action];
	}

	return [];
};
