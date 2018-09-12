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
				switcher: pref + '__switcher',
				complete: pref + '__complete'
			},
			$front = $element.find(config.front),
			$back = $element.find(config.back),
			$note = $element.find(config.note),
			$total = $element.find(config.total),
			$progress = $element.find(config.progress),
			objTotal;

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
			// console.log('getRandomInt: ', Math.floor(Math.random() * (max - min)) + min);
			return Math.floor(Math.random() * (max - min)) + min;
		}, createTaskRandomly = function ($elem) {
			let obj = $elem.data(dataTasksSave);
			// console.log("obj: ", obj);
			if (obj.length === 0) {
				// Add class show a warning about the task end
				$elem.addClass(config.modifiers.completeClass);

				// Restore tasks object
				$elem.data(dataTasksSave, $elem.data(dataTasksFullSave));

				return false;
			}

			$elem.removeClass(config.modifiers.activeClass);

			// console.log("obj: ", obj);
			let randomIndex = getRandomInt(0, obj.length);
			let task = obj[randomIndex];
			// Из объекта с заданиями удаляем текущее задание
			let count = 0,
				newObj = $.map(obj, function (task) {
					if (count !== randomIndex) {
						++count;
						return task;
					}
					++count;
					return null;
				});
			// console.log("newObj: ", newObj);
			// Перезаписываем новый в дата-атрибут вместо старого
			$elem.data(dataTasksSave, newObj);

			// Манипуляции с DOM
			// $front.html(task.front);
			// $back.html(task.back);
			$front.html(task.back);
			$back.html(task.front);
			if (task.note) {
				$note.html('<ul></ul>');
				// $note.find('ul').html('<li><em>-</em></li>');
				for(let i = 0; i < task.note.length; i++) {
					// $note.find('ul').html('<em>-</em>').html('<li>-</li>');
					$note.find('ul').append('<li>' + task.note[i] + '</li>');
				}
			}
		}, saveTasksObj = function () {
			if (typeof config.tasksObj === 'string'){
				$.getJSON(config.tasksObj, function( data ) {
					// $element.data(dataTasksSave, data[0].tasks);
					$element.data(dataTasksSave, data[0].tasks);
					// $element.data(dataTasksFullSave, data[0].tasks);
					$element.data(dataTasksFullSave, data[0].tasks);
				}).done(function () {
					objTotal = $element.data(dataTasksFullSave).length;
					$total.html(objTotal);
					createTaskRandomly($element);
				});
			}
			if (typeof config.tasksObj === 'object'){
				// $element.data(dataTasksSave, config.tasksObj[0].tasks);
				$element.data(dataTasksSave, config.tasksObj[0].tasks);
				// $element.data(dataTasksFullSave, config.tasksObj[0].tasks);
				$element.data(dataTasksFullSave, config.tasksObj[0].tasks);
				createTaskRandomly($element);
			}
		}, progress = function (length, progress) {
			$progress.css('width', progress).html(length);
		}, main = function () {
			// $body.on(config.event, '.' + pluginClasses.switcher, function (event) {
			$element.on(config.event, function (event) {
				event.preventDefault();

				let $curCard = $(this);

				if ($curCard.hasClass(config.modifiers.completeClass)) {
					// Remove class show a warning about the task end
					$curCard.removeClass(config.modifiers.completeClass);
					progress(0, 0);
				}

				if ($curCard.hasClass(config.modifiers.activeClass)) {
					createTaskRandomly($curCard);
				} else {
					$curCard.addClass(config.modifiers.activeClass);
					// Progress bar
					let objLength = $curCard.data(dataTasksSave).length;
					let currentProgress = Math.round(getProgress(objTotal, objLength) * 100) + '%';
					progress(objTotal - objLength, currentProgress);
				}
			});
			$(document).keydown(function(event) {
				// console.log("event.keyCode: ", event.which);
				switch (event.which) {
					case 13: // Enter
					case 32: // Space
					case 37: // Left
					case 38: // Top
					case 39: // Right
					case 40: // Bottom
						$element.trigger('click');
						break;

					default: return;
				}
				// if (event.keyCode === 13 || event.keyCode === 32 || event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) {
				// 	$element.trigger('click');
				// }
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
		total: '.words__total-js',
		progress: '.words__progress-js',
		event: 'click',
		modifiers: {
			initClass: null,
			activeClass: 'active',
			completeClass: 'completed'
		}
	}

})(jQuery);

function wordsCards() {
	var $words = $('.words-js');

	if ($words.length) {
		$.each($words, function () {
			let $cur = $(this);
			$cur.words({
				front: $('.words__card_front-js'),
				back: $('.words__card_back-js'),
				order: $('.words__order-js'),
				// tasksObj: phrasal-verbs-1.json
				tasksObj: $cur.attr('data-tasks')
			});
		})
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
