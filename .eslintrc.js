module.exports = {
	env: {
		node: true,
		browser: true,
		commonjs: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended'
	],
	parserOptions: {
		ecmaVersion: 12,
	},
	rules: {
		'semi': ['error', 'always'],
		'quotes': ['error', 'single'],
		'indent': ['error', 'tab'],
		'no-multi-spaces': ['warn'],
		'no-unused-vars': 'off'
	},
};
