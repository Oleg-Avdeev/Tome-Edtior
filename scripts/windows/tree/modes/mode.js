const EditorMode = {

	validModes: ['edit','verify','transform'],

	currentMode: {
		
		value: 'edit',
		listeners: [],

		listen: function(id, handler) { 
			this.listeners.push({id, handler});
		},

		bind: function(id, handler) {
			this.listeners.push({id, handler});
			handler(this.value);
		},

		removeListener: function(id) {
			let index = this.listeners.findIndex(l => l.id === id);

			if (index >= 0 && index < this.listeners.length) 
				this.listeners.splice(index, 1);
		},

		set: function(mode) {
			this.value = mode;
			this.listeners.forEach(listener => listener.handler(mode));
		}
	},

	setMode: function(mode) {
		if (this.validModes.find(m => m === mode))
			this.currentMode.set(mode);
	},

	toggleMode: function(mode) { 
		if (this.currentMode.value === mode)
			this.setMode('edit');
		else this.setMode(mode);
	}
};