const LineValidator = {
	isValid: function (line) {
		let checksum = this.getHashCode(line);
		return checksum == line['checksum'];
	},

	validate: function (line) {
		line['checksum'] = this.getHashCode(line);
	},

	getHashCode: function(line) {
		let clone = Object.assign({}, line, { 'checksum': undefined });
		let json = JSON.stringify(clone);
		return json.hashCode();
	}
};

String.prototype.hashCode = function () {
	var hash = 0;
	for (var i = 0; i < this.length; i++) {
		var code = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + code;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};