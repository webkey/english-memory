'use strict';

/**
 * !Detected touchscreen devices
 * */
var TOUCH = Modernizr.touchevents;
var DESKTOP = !TOUCH;

/**
 * !Toggle class on a form elements on focus
 * */
function inputFocusClass() {
	var $inputs = $('.field-js');

	if ($inputs.length) {
		var $fieldWrap = $('.input-wrap');
		var $selectWrap = $('.select');
		var classFocus = 'input--focus';

		$inputs.focus(function () {
			var $currentField = $(this);
			var $currentFieldWrap = $currentField.closest($fieldWrap);

			$currentField.addClass(classFocus);
			$currentField.prev('label').addClass(classFocus);
			$currentField.closest($selectWrap).prev('label').addClass(classFocus);
			$currentFieldWrap.addClass(classFocus);
			$currentFieldWrap.find('label').addClass(classFocus);

		}).blur(function () {
			var $currentField = $(this);
			var $currentFieldWrap = $currentField.closest($fieldWrap);

			$currentField.removeClass(classFocus);
			$currentField.prev('label').removeClass(classFocus);
			$currentField.closest($selectWrap).prev('label').removeClass(classFocus);
			$currentFieldWrap.removeClass(classFocus);
			$currentFieldWrap.find('label').removeClass(classFocus);

		});
	}
}

/**
 * !Toggle class on a form elements if this one has a value
 * */
function inputHasValueClass() {
	var $inputs = $('.field-js');

	if ($inputs.length) {
		var $fieldWrap = $('.input-wrap');
		var $selectWrap = $('.select');
		var classHasValue = 'input--has-value';

		var switchHasValue = function () {
			var $currentField = $(this);
			var $currentFieldWrap = $currentField.closest($fieldWrap);

			//first element of the select must have a value empty ("")
			if ($currentField.val().length === 0) {
				$currentField.removeClass(classHasValue);
				$currentField.prev('label').removeClass(classHasValue);
				$currentField.closest($selectWrap).prev('label').removeClass(classHasValue);
				$currentFieldWrap.removeClass(classHasValue);
				$currentFieldWrap.find('label').removeClass(classHasValue);
			} else if (!$currentField.hasClass(classHasValue)) {
				$currentField.addClass(classHasValue);
				$currentField.prev('label').addClass(classHasValue);
				$currentField.closest($selectWrap).prev('label').addClass(classHasValue);
				$currentFieldWrap.addClass(classHasValue);
				$currentFieldWrap.find('label').addClass(classHasValue);
			}
		};

		$.each($inputs, function () {
			switchHasValue.call(this);
		});

		$inputs.on('keyup change', function () {
			switchHasValue.call(this);
		});
	}
}

/**
 * !Cards of English words
 * */
(function($){
	'use strict';

	let Words = function (element, config) {
		let self,
			$body = $('body'),
			$element = $(element),
			pref = 'oo-words',
			dataTasksSave = 'tasks-object',
			dataTasksFullSave = 'tasks-object-full',
			pluginClasses = {
				initClass: pref + '--initialized',
				switcher: pref + '__switcher'
			};

		let callbacks = function () {
			/** track events */
			$.each(config, function (key, value) {
				if (typeof value === 'function') {
					$element.on('words.' + key, function (e, param) {
						return value(e, $element, param);
					});
				}
			});
		}, toggleClass = function (elements) {
			// Первый аргумент функции (elements) - один или несколько ([]) елементов, на которые добуаляется/удаляется класс.
			// Второй аргумент функции указыает удалять класс (false) или добавлять (true - указыать не обязательно).
			// Пример использования: toggleClass([$elem1, $elem2, $('.class', $elem2), $('.class'), '.class'], false);
			if (!elements)
				return;

			let condRemove = (arguments[1] === undefined) ? true : !!arguments[1],
				$elements = (typeof elements === "object") ? elements : $(elements);

			$.each($elements, function () {
				let currentElem = this;
				if ($.isArray(currentElem)) {
					// Если массив, то запускаем функицию повторно
					toggleClass(currentElem, condRemove);
				} else {
					// Если второй аргумент false, то удаляем класс
					// Если второй аргумент не false, то добавляем класс
					$(currentElem).toggleClass(config.modifiers.activeClass, !!condRemove)
				}
			});
		}, getProgress = function (total, current) {
			return Math.round((1 - current / total) * 100) / 100;
		}, getRandomInt = function (max, min) {
			return Math.floor(Math.random() * (max - min)) + min;
		}, createTaskRandomly = function () {
			let obj = $.data($element, dataTasksSave);
			let objTotal = $.data($element, dataTasksFullSave).length,
				objLength = obj.length;
			if(objLength === 0)
				obj = $.data($element, dataTasksFullSave);
			let randomIndex = getRandomInt(0, objLength);
			let task = obj[randomIndex];
			// Из объекта с заданиями удаляем текущее задание
			let count = 0;
			let newObj = $.map(obj, function (task) {
				if (count !== randomIndex) {
					++count;
					return task;
				}
				++count;
				return null;
			});
			// Перезаписываем новый в дата-атрибут вместо старого
			$.data($element, dataTasksSave, newObj);
			// Манипуляции с DOM
			let currentProgress = Math.round(getProgress(objTotal, objLength) * 100) + '%';
			$(config.progress).css('width', currentProgress).html(currentProgress);
			// $front.html(task.front);
			// $back.html(task.back);
			$(config.front).html(task.back);
			$(config.back).html(task.front);
			task.note && $('li', $(config.note)).html('<em>-</em>').html(task.note[0]);
		}, saveTasksObj = function () {
			if (typeof config.tasksObj === 'string'){
				$.getJSON(config.tasksObj, function( data ) {
					console.log(data[0].tasks);
					$.data($element, dataTasksSave, data[0].tasks);
					$.data($element, dataTasksFullSave, data[0].tasks);
				}).done(function () {
					createTaskRandomly();
				});
			}
			if (typeof config.tasksObj === 'object'){
				$.data($element, dataTasksSave, config.tasksObj[0].tasks);
				$.data($element, dataTasksFullSave, config.tasksObj[0].tasks);
				createTaskRandomly();
			}
		}, main = function () {
			$body.on(config.event, '.' + pluginClasses.switcher, function (event) {
				let $currentCard = $(this);

				if ($currentCard.hasClass(config.modifiers.activeClass)) {
					$currentCard.removeClass(config.modifiers.activeClass);
					createTaskRandomly();
				} else {
					$currentCard.addClass(config.modifiers.activeClass);
				}

				event.preventDefault();
			});
		}, init = function () {

			$element.addClass(pluginClasses.switcher + ' ' + pluginClasses.initClass).addClass(config.modifiers.initClass);

			saveTasksObj();

			$element.trigger('words.afterInit');
		};

		self = {
			callbacks: callbacks,
			main: main,
			init: init
		};

		return self;
	};

	$.fn.words = function () {
		let elem = this,
			opt = arguments[0],
			args = Array.prototype.slice.call(arguments, 1),
			l = elem.length,
			i,
			ret;
		for (i = 0; i < l; i++) {
			if (typeof opt === 'object' || typeof opt === 'undefined') {
				elem[i].words = new Words(elem[i], $.extend(true, {}, $.fn.words.defaultOptions, opt));
				elem[i].words.init();
				elem[i].words.callbacks();
				elem[i].words.main();
			}
			else {
				ret = elem[i].words[opt].apply(elem[i].words, args);
			}
			if (typeof ret !== 'undefined') {
				return ret;
			}
		}
		return elem;
	};

	$.fn.words.defaultOptions = {
		tasksObj: [{'front': 'back!', 'back': 'front!', 'note': ['This one is for an example']}],
		front: '.words__card_front-js',
		back: '.words__card_back-js',
		note: '.words__note-js',
		progress: '.words__progress-js',
		event: 'click',
		modifiers: {
			initClass: null,
			activeClass: 'active'
		}
	}

})(jQuery);

function wordsCards() {
	var $words = $('.words-js');

	if ($words.length) {
		$words.words({
			// tasksObj: phrasal-verbs.json
			tasksObj: "includes/json/phrasal-verbs.json"
		});
	}
}

/**
 * =========== !ready document, load/resize window ===========
 */
$(document).ready(function () {
	inputFocusClass();
	inputHasValueClass();
	objectFitImages(); // object-fit-images initial

	wordsCards();
});
