const localization = {
	
	narrator: { ru: 'Нарратор', en: 'Narrator' },
	
	addAbove: { ru: 'Добавить Сверху', en: 'Add Above' },
	addBelow: { ru: 'Добавить Снизу', en: 'Add Below' },
	deleteLine: { ru: 'Удалить Реплику', en: 'Delete Line' },
	splitIntoLines: { ru: 'Разбить на Реплики', en: 'Split Into Lines' },
	
	insertPreviousNode: { ru: 'Вставить Предыдущую Сцену', en: 'Insert Previous Scene' },
	addNextNode: { ru: 'Добавить Следующую Сцену', en: 'Add Next Scene' },
	deleteNode: { ru: 'Удалить Сцену', en: 'Delete Scene' },

	sceneNotFound: { ru: (s) => `Сцена ${s} не найдена`, en: (s) => `Scene ${s} not found` },
	createScene: { ru: 'Создать Сцену', en: 'Create Scene' },
	sceneAlreadyExists: { ru: 'Сцена с таким названием уже существует', en: 'Scene with this ID already exists' },
};

const getLocalized = function(term) {

	console.log(navigator.language);

	if (/ru/.test(navigator.language))
		return term.ru;

	return term.en;
};

const switchLanguage = function(language) {

};