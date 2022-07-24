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
	globals: {
		'ContextMenuRenderer': 'readonly',
		
		'registerCommand': 'readonly',
		
		'Story': 'readonly',
		'StoryHelper': 'readonly',
		'ProjectMeta': 'readonly',
		'onSceneSelect': 'readonly',

		'currentChapter': 'readonly',
		'removeParagraph': 'readonly',
		'addNewParagraph': 'readonly',
		'renameColumn': 'readonly',
		
		'TreeNode': 'readonly',
		'TreeBorkLine': 'readonly',
		'TreeCurvyLine': 'readonly',
		'TreeLine': 'readonly',
		'NodeIdRenderer': 'readonly',
		'NodeContextRenderer': 'readonly',
		'CollisionReductionPass': 'readonly',
		
		'LineValidator': 'readonly',
		'ActionParser': 'readonly',
		'ActionType': 'readonly',
		'ConditionParser': 'readonly',
		
		'getCells': 'readonly',
		'toggleColumnCollapse': 'readonly',
		'ColumnHeader': 'readonly',
		'Cell': 'readonly',

		'localization': 'readonly',
		'getLocalized': 'readonly',
	}
};
