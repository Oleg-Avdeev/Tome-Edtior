document.querySelector('#selectBtn').addEventListener('click', function (event) {
	dialog.showOpenDialog({
		properties: ['openFile', 'multiSelections']
	}, function (files) {
		if (files !== undefined) {
			// handle files
		}
	});
});