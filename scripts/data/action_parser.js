const ActionType = Object.freeze({ 'goto': 1, 'command': 2, 'compute': 3 });
const OpenedBracket = ['', '[', '(', '{'];
const ClosedBracket = ['', ']', ')', '}'];

const gotoRE = /\[([^\[\]]*)\]/;
const commandRE = /\(([^\(\)]*)\)/;
const computeRE = /\{([^\{\}]*)\}/;

const ActionParser = {
	parse: function (actions) {
		var parsedActions = []

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

			text += `${OpenedBracket[action.ActionType]}${id}${ClosedBracket[action.ActionType]}`
		});
		return text;
	}
}

parseGoTo = function (actions) {
	var matches = gotoRE.exec(actions);

	if (matches != null) {
		let id = matches[1];
		let cyclicalEdge = false

		if (id.startsWith('*')) {
			id = id.replace('*', '');
			cyclicalEdge = true;
		}

		var action = {
			'ActionType': ActionType.goto,
			'Value': id,
			'Cyclical': cyclicalEdge
		}

		return [action];
	}

	return [];
}

//TODO: Parse all actions
//TODO: Parse completely
parseCommand = function (actions) {
	var matches = commandRE.exec(actions);

	if (matches != null) {
		let id = matches[1];

		var action = {
			'ActionType': ActionType.command,
			'Value': id,
		}

		return [action];
	}

	return [];
}

//TODO: Parse all actions
//TODO: Parse completely
parseCompute = function (actions) {
	var matches = computeRE.exec(actions);

	if (matches != null) {
		let id = matches[1];

		var action = {
			'ActionType': ActionType.compute,
			'Value': id,
		}

		return [action];
	}

	return [];
}
