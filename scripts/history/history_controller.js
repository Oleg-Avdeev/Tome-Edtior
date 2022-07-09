let undoer = {};
const commandStack = [];
let duringInput = false;
let currentIndex = 0;
let previousIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
	console.log('history controller initialized');

	undoer = document.createElement('input');
	undoer.value = '0';
	undoer.tabIndex = -1; // don't allow automatic tab	
	undoer.style.opacity = 0;
	undoer.style.position = 'absolute';
	document.body.appendChild(undoer);

	undoer.addEventListener('focus', () => {
		window.setTimeout(() => undoer.blur(), 0); // prevent focus, delay for Safari
	});

	undoer.addEventListener('input', (ev) => {

		if (!duringInput) {
			previousIndex = currentIndex;
			currentIndex = +undoer.value;
			
			if (isUndo()) commandStack[currentIndex].undo();
			else commandStack[previousIndex].redo();
		}
	});
});

function resetHistory() {

}

function registerCommand(command) {
	// remove states past now, add our new state
	const nextStateId = +undoer.value;
	commandStack.splice(nextStateId, commandStack.length - nextStateId, command);

	duringInput = true;

	// focus and "type" the next number
	undoer.focus();
	document.execCommand('selectAll');
	document.execCommand('insertText', false, nextStateId + 1);
	currentIndex = nextStateId + 1;

	duringInput = false;
}

function isUndo() { return previousIndex >= currentIndex; }