function dragElement(element, direction) {
	var md; // remember mouse down info
	var rs; // remember resize info
	const leftElement = document.getElementsByClassName('left')[0];
	const rightElements = document.getElementsByClassName('right');
	const editorPanel = document.getElementsByClassName('editor')[0];

	element.onmousedown = onMouseDown;

	function onMouseDown(e) {

		md = {
			e,
			offsetLeft: element.offsetLeft,
			offsetTop: element.offsetTop,
			firstWidth: leftElement.offsetWidth,
			secondWidth: rightElements[0].offsetWidth
		};

		document.onmousemove = onMouseMove;
		document.onmouseup = () => {
			document.onmousemove = document.onmouseup = null;
		};
	}

	function onMouseMove(e) {
		var delta = {
			x: e.clientX - md.e.clientX,
			y: e.clientY - md.e.clientY
		};

		// Prevent negative-sized elements
		delta.x = Math.min(Math.max(delta.x, -md.firstWidth), md.secondWidth);

		resize(md.firstWidth, delta);
	}

	function resize(initialWidth, delta) {
		if (direction === 'H') // Horizontal
		{
			let leftWidth = initialWidth + delta.x;
			leftElement.style.width = (100 * leftWidth / editorPanel.clientWidth) + '%';
			
			for (let i = 0; i < rightElements.length; i++) {
				let rightWidth = editorPanel.clientWidth - leftWidth;
				rightElements[i].style.width = (100 * rightWidth / editorPanel.clientWidth) + '%';
			}

			element.style.left = leftElement.style.width;
			setProperties();
		}
	}

	function setProperties() {
		leftElement.style.setProperty('--panel-width', leftElement.style.width);
		for (let i = 0; i < rightElements.length; i++) {
			rightElements[i].style.setProperty('--panel-offset', leftElement.style.width);
			rightElements[i].style.setProperty('--panel-width', rightElements[i].style.width);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	dragElement(document.getElementById('splitter'), 'H');
});  