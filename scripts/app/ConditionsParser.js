const ConditionType = Object.freeze({ 'operation': 1 });

const ConditionParser = {
	
	parse: function (conditions) { 
		var parsedConditions = [];
		
		parsedConditions = parseOperation(conditions);
		
		if (parsedConditions.length > 0)
			console.log(JSON.stringify(parsedConditions));

		return parsedConditions;
	},

	toText: function (conditions) { 
		var text = '';

		conditions.forEach(condition => {
			text = `${condition.Variable}${condition.Operator}${condition.Value}`;
		});

		return text;
	},

};

exports.ConditionParser = ConditionParser;

const operationRE = /([a-zА-ЯA-Zа-я0-9]*)([\\=\\>\\<\\!])([\\-a-zА-ЯA-Zа-я0-9]*)/;

let parseOperation = function (string) {
	var matches = operationRE.exec(string);

	if (matches != null) {

		var condition = {
			'ConditionType': ConditionType.operation,
			'Variable': matches[1],
			'Operator': matches[2],
			'Value': matches[3],
		};

		return [condition];
	}

	return [];
};