exports.parseSpreadsheet = function(spreadsheet) {
	let rows = spreadsheet.rowData;
	let tsv = '';
	
	rows.forEach(row => {
		row.values.forEach(value => {
			if (value.effectiveValue)
				tsv = tsv + value.effectiveValue.stringValue + '\t';
		});

		tsv = tsv.trim() + '\n';
	});

	return tsv;
};