'use strict';

/**
 * !Detected touchscreen devices
 * */
let TOUCH = Modernizr.touchevents;
let DESKTOP = !TOUCH;

/**
 * !Toggle class on a form elements on focus
 * */
function inputFocusClass() {
	let $inputs = $('.field-js');

	if ($inputs.length) {
		let $fieldWrap = $('.input-wrap');
		let $selectWrap = $('.select');
		let classFocus = 'input--focus';

		$inputs.focus(function () {
			let $currentField = $(this);
			let $currentFieldWrap = $currentField.closest($fieldWrap);

			$currentField.addClass(classFocus);
			$currentField.prev('label').addClass(classFocus);
			$currentField.closest($selectWrap).prev('label').addClass(classFocus);
			$currentFieldWrap.addClass(classFocus);
			$currentFieldWrap.find('label').addClass(classFocus);

		}).blur(function () {
			let $currentField = $(this);
			let $currentFieldWrap = $currentField.closest($fieldWrap);

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
	let $inputs = $('.field-js');

	if ($inputs.length) {
		let $fieldWrap = $('.input-wrap');
		let $selectWrap = $('.select');
		let classHasValue = 'input--has-value';

		let switchHasValue = function () {
			let $currentField = $(this);
			let $currentFieldWrap = $currentField.closest($fieldWrap);

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
 * !Switch class plugin
 */
(function ($) {
	let countFixedScroll = 0;
	// Нужно для корректной работы с доп. классом фиксирования скролла

	let SwitchClass = function (element, config) {
		let self,
			$element = $(element),
			$html = $('html'),
			pref = 'jq-switch-class',
			pluginClasses = {
				initClass: pref + '_initialized'
			},
			mod = {
				scrollFixedClass: 'css-scroll-fixed'
			},
			$switchClassTo = $element.add(config.switcher).add(config.adder).add(config.remover).add(config.switchClassTo),
			classIsAdded = false; //Флаг отвечающий на вопрос: класс добавлен?

		let callbacks = function () {
				/** track events */
				$.each(config, function (key, value) {
					if (typeof value === 'function') {
						$element.on('switchClass.' + key, function (e, param) {
							return value(e, $element, param);
						});
					}
				});
			},
			prevent = function (event) {
				event.preventDefault();
				event.stopPropagation();
				return false;
			},
			toggleFixedScroll = function () {
				$html.toggleClass(mod.scrollFixedClass, !!countFixedScroll);
			},
			add = function () {
				if (classIsAdded) return;

				// Callback before added class
				$element.trigger('switchClass.beforeAdded');

				// Добавить активный класс на:
				// 1) Основной элемент
				// 2) Дополнительный переключатель
				// 3) Элементы указанные в настройках экземпляра плагина
				$switchClassTo.addClass(config.modifiers.activeClass);

				classIsAdded = true;

				if (config.cssScrollFixed) {
					// Если в настойках указано, что нужно добавлять класс фиксации скролла,
					// То каждый раз вызывая ДОБАВЛЕНИЕ активного класса, увеличивается счетчик количества этих вызовов
					++countFixedScroll;
					toggleFixedScroll();
				}

				// callback after added class
				$element.trigger('switchClass.afterAdded');
			},
			remove = function () {
				if (!classIsAdded) return;

				// callback beforeRemoved
				$element.trigger('switchClass.beforeRemoved');

				// Удалять активный класс с:
				// 1) Основной элемент
				// 2) Дополнительный переключатель
				// 3) Элементы указанные в настройках экземпляра плагина
				$switchClassTo.removeClass(config.modifiers.activeClass);

				classIsAdded = false;

				if (config.cssScrollFixed) {
					// Если в настойках указано, что нужно добавлять класс фиксации скролла,
					// То каждый раз вызывая УДАЛЕНИЕ активного класса, уменьшается счетчик количества этих вызовов
					--countFixedScroll;
					toggleFixedScroll();
				}

				// callback afterRemoved
				$element.trigger('switchClass.afterRemoved');
			},
			events = function () {
				$element.on('click', function (event) {
					if (classIsAdded) {
						remove();

						event.preventDefault();
						return false;
					}

					add();

					prevent(event);
				});

				$(config.switcher).on('click', function (event) {
					$element.click();
					prevent(event);
				});

				$(config.adder).on('click', function (event) {
					add();
					prevent(event);
				});

				$(config.remover).on('click', function (event) {
					remove();
					prevent(event);
				})

			},
			removeByClickOutside = function () {
				$html.on('click', function (event) {
					if (classIsAdded && config.removeOutsideClick && !$(event.target).closest('.' + config.modifiers.stopRemoveClass).length) {
						remove();
						// event.stopPropagation();
					}
				});
			},
			removeByClickEsc = function () {
				$html.keyup(function (event) {
					if (classIsAdded && config.removeEscClick && event.keyCode === 27) {
						remove();
					}
				});
			},
			init = function () {
				$element.addClass(pluginClasses.initClass).addClass(config.modifiers.initClass);
				$element.trigger('switchClass.afterInit');
			};

		self = {
			callbacks: callbacks,
			remove: remove,
			events: events,
			removeByClickOutside: removeByClickOutside,
			removeByClickEsc: removeByClickEsc,
			init: init
		};

		return self;
	};

	// $.fn.switchClass = function (options, params) {
	$.fn.switchClass = function () {
		let _ = this,
			opt = arguments[0],
			args = Array.prototype.slice.call(arguments, 1),
			l = _.length,
			i,
			ret;
		for (i = 0; i < l; i++) {
			if (typeof opt === 'object' || typeof opt === 'undefined') {
				_[i].switchClass = new SwitchClass(_[i], $.extend(true, {}, $.fn.switchClass.defaultOptions, opt));
				_[i].switchClass.callbacks();
				_[i].switchClass.events();
				_[i].switchClass.removeByClickOutside();
				_[i].switchClass.removeByClickEsc();
				_[i].switchClass.init();
			}
			else {
				ret = _[i].switchClass[opt].apply(_[i].switchClass, args);
			}
			if (typeof ret !== 'undefined') {
				return ret;
			}
		}
		return _;
	};

	$.fn.switchClass.defaultOptions = {
		switcher: null,
		/**
		 * @description - Дополнительный элемент, которым можно ДОБАВЛЯТЬ/УДАЛЯТЬ класс
		 * @example {String}{JQ Object} null - '.switcher-js', или $('.switcher-js')
		 */
		adder: null,
		/**
		 * @description - Дополнительный элемент, которым можно ДОБАВЛЯТЬ класс
		 * @example {String}{JQ Object} null - '.adder-js', или $('.adder-js')
		 */
		remover: null,
		/**
		 * @description - Дополнительный элемент, которым можно УДАЛЯТЬ класс
		 * @example {String}{JQ Object} null - '.remover-js', или $('.remover-js')
		 */
		switchClassTo: null,
		/**
		 * @description - Один или несколько эелментов, на которые будет добавляться/удаляться активный класс (modifiers.activeClass)
		 * @example {JQ Object} null - 1) $('html, .popup-js, .overlay-js')
		 * @example {JQ Object} null - 2) $('html').add('.popup-js').add('.overlay-js')
		 */
		removeOutsideClick: true,
		/**
		 * @description - Удалать класс по клику по пустому месту на странице? Если по клику на определенный элемент удалять класс не нужно, то на этот элемент нужно добавить дата-антрибут [data-tc-stop]
		 * @param {boolean} true - или false
		 */
		removeEscClick: true,
		/**
		 * @description - Удалять класс по клику на клавишу Esc?
		 * @param {boolean} true - или false
		 */
		cssScrollFixed: false,
		/**
		 * @description - Добавлять на html дополнительный класс 'css-scroll-fixed'? Через этот класс можно фиксировать скролл методами css
		 * @see - _mixins.sass =scroll-blocked()
		 * @param {boolean} true - или false.
		 */
		modifiers: {
			initClass: null,
			activeClass: 'active',
			stopRemoveClass: 'stop-remove-class' // Если кликнуть по елементу с этим классам, то событие удаления активного класса не будет вызвано
		}
		/**
		 * @description - Список классов-модификаторов
		 */
	};

})(jQuery);

var $nav = $('.nav-opener-js'),
	nav;
if ($nav.length) {
	nav = $nav.switchClass({
		switchClassTo: $('.shutter--nav-js').add('.nav-overlay-js')
		, modifiers: {
			activeClass: 'nav-is-open',
			stopRemoveClass: 'stop-nav-remove-class'
		}
		, cssScrollFixed: true
		, beforeAdded: function () {
			$('html').addClass('open-only-mob');
			// open-only-mob - используется для адаптива

			// пример добавления классов с задержкой
			var $curItem = $('.nav-js').children(), speed = 1000;

			$('.nav-js').prop('counter', 0).animate({
				counter: $curItem.length
			}, {
				duration: speed,
				easing: 'swing',
				step: function (now) {
					$curItem.eq(Math.round(now)).addClass('show-nav-item')
				}
			});
		}
		, beforeRemoved: function () {
			$('html').removeClass('open-only-mob');
			// open-only-mob - используется для адаптива
			$('.nav-js').stop().children().removeClass('show-nav-item')
		}
	});
}

/**
 * !Cards of English words
 * */
(function($){
	'use strict';

	let Words = function (element, config) {
		let self,
			$element = $(element),
			dataTasksSave = 'tasks-object',
			dataTasksFullSave = 'tasks-object-full',
			pref = 'oo-words',
			pluginClasses = {
				initClass: pref + '--initialized',
				switcher: pref + '__switcher',
				complete: pref + '__complete'
			},
			$cards = $element.find(config.cards),
			$front = $element.find(config.front),
			$back = $element.find(config.back),
			$note = $element.find(config.note),
			$current = $element.find(config.current),
			$total = $element.find(config.total),
			$progress = $element.find(config.progress),
			$complete = $element.find(config.complete),
			$toolsRandom = $element.find(config.toolsRandom),
			$toolsPrev = $element.find(config.toolsPrev),
			$toolsNext = $element.find(config.toolsNext),
			$toolsReset = $element.find(config.toolsReset),
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
			},
			toggleClass = function (elements) {
				/**
				 * @param {string}{object} elements - один или несколько ([]) елементов, на которые добаляется/удаляется класс
				 * @param {boolean} - указыает удалять класс (false) или добавлять (true - указыать не обязательно)
				 * @example - toggleClass([$elem1, $elem2, $('.class', $elem2), $('.class'), '.class'], false)
				 */
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
						$(currentElem).toggleClass(config.modifiers.activeMod, !!condRemove)
					}
				});
			},
			getProgress = function (total, current) {
				return Math.round((1 - current / total) * 100) / 100;
			},
			getRandomInt = function (max, min) {
				// console.log('getRandomInt: ', Math.floor(Math.random() * (max - min)) + min);
				return Math.floor(Math.random() * (max - min)) + min;
			},
			createTaskRandomly = function ($elem) {
				let obj = $elem.data(dataTasksSave);
				// console.log("$elem: ", $elem);
				// console.log("obj: ", obj);
				if (obj.length === 0) {
					// Add class show a warning about the task end
					$elem.addClass(config.modifiers.completeMod);

					// Restore tasks object
					$elem.data(dataTasksSave, $elem.data(dataTasksFullSave));

					return false;
				}

				$elem.removeClass(config.modifiers.activeMod);

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
					for (let i = 0; i < task.note.length; i++) {
						// $note.find('ul').html('<em>-</em>').html('<li>-</li>');
						$note.find('ul').append('<li>' + task.note[i] + '</li>');
					}
				}
			},
			saveTasksObj = function () {
				if (typeof config.tasksObj === 'string') {
					$.getJSON(config.tasksObj, function (data) {
						$element.data(dataTasksSave, data[0].tasks);
						$element.data(dataTasksFullSave, data[0].tasks);
					}).done(function () {
						objTotal = $element.data(dataTasksFullSave).length;
						$total.html(objTotal);
						createTaskRandomly($element);
					});
				}
				if (typeof config.tasksObj === 'object') {
					// $element.data(dataTasksSave, config.tasksObj[0].tasks);
					$element.data(dataTasksSave, config.tasksObj[0].tasks);
					// $element.data(dataTasksFullSave, config.tasksObj[0].tasks);
					$element.data(dataTasksFullSave, config.tasksObj[0].tasks);
					createTaskRandomly($element);
				}
			},
			changeProgress = function (length, progress) {
				$progress.css('width', progress);
				$current.html(length);
			},
			main = function () {
				$toolsNext.on(config.event, function (event) {
					event.preventDefault();

					let $curCard = $(this).closest($element);

					if ($toolsRandom.prop('checked')) {
						if ($curCard.hasClass(config.modifiers.completeMod)) {
							// Remove class show a warning about the task end
							$curCard.removeClass(config.modifiers.completeMod);
							changeProgress(0, 0);
						}

						if ($curCard.hasClass(config.modifiers.activeMod)) {
							createTaskRandomly($curCard);
						} else {
							$curCard.removeClass(config.modifiers.backMod);
							$curCard.addClass(config.modifiers.activeMod);
							// Progress bar
							let objLength = $curCard.data(dataTasksSave).length;
							let currentProgress = Math.round(getProgress(objTotal, objLength) * 100) + '%';
							changeProgress(objTotal - objLength, currentProgress);
						}
					}
				});
				$toolsPrev.on(config.event, function (event) {
					let $curCard = $(this).closest($element);

					if ($toolsRandom.prop('checked')) {
						$curCard.addClass(config.modifiers.backMod);
						$curCard.removeClass(config.modifiers.activeMod);
					}

					event.preventDefault();
				});
				// Random tool change
				$element.toggleClass(config.modifiers.randomMod, $toolsRandom.prop('checked'));
				$toolsRandom.on('change', function () {
					$element.toggleClass(config.modifiers.randomMod, $toolsRandom.prop('checked'));
				});
				// Complete cover / Cards on click
				$complete.add($cards).on('click', function () {
					$toolsNext.click();
				});
				// Key
				$(document).keydown(function (event) {
					switch (event.which) {
						case 13: // Enter
						case 32: // Space
						case 38: // Top
						case 39: // Right
						case 40: // Bottom
							$toolsNext.click();
							break;

						default:
							return;
					}
					event.preventDefault();
				});
				$(document).keydown(function (event) {
					switch (event.which) {
						case 37: // Left
							$toolsPrev.click();
							break;

						default:
							return;
					}
					event.preventDefault();
				});
			}, reset = function () {
				$toolsReset.on('click', function () {
					let $curCard = $(this).closest($element);
					// $curCard.removeClass(config.modifiers.completeMod);
					// $curCard.removeClass(config.modifiers.activeMod);
					changeProgress(0, 0);
					$curCard.data(dataTasksSave, $curCard.data(dataTasksFullSave));
					createTaskRandomly($curCard);
				});

				$(document).keydown(function (event) {
					// console.log("event.which: ", event.which);
					switch (event.which) {
						case 82: // Left
							$toolsReset.click();
							break;

						default:
							return;
					}
					event.preventDefault();
				});
			},
			init = function () {

				$element.addClass(pluginClasses.switcher + ' ' + pluginClasses.initClass).addClass(config.modifiers.initClass);

				saveTasksObj();

				$element.trigger('words.afterInit');
			};

		self = {
			callbacks: callbacks,
			main: main,
			reset: reset,
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
				elem[i].words.reset();
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
		cards: '.words__cards-js',
		front: '.words__card_front-js',
		back: '.words__card_back-js',
		note: '.words__note-js',
		// count and progress
		current: '.words__current-js',
		total: '.words__total-js',
		progress: '.words__progress-js',
		// complete cover
		complete: '.words__complete-js',
		// tools
		toolsRandom: '.words__tools_random-js',
		toolsPrev: '.words__tools_prev-js',
		toolsNext: '.words__tools_next-js',
		toolsReset: '.words__tools_reset-js',
		// event
		event: 'click',
		modifiers: {
			initClass: null,
			activeMod: 'active',
			backMod: 'is-back',
			completeMod: 'completed',
			randomMod: 'is-random'
		}
	}

})(jQuery);

function wordsCards() {
	let $words = $('.words-js');

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
