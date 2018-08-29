/**
 * !Resize only width
 * */
var resizeByWidth = true;

var prevWidth = -1;
$(window).resize(function () {
	var currentWidth = $('body').outerWidth();
	resizeByWidth = prevWidth !== currentWidth;
	if (resizeByWidth) {
		$(window).trigger('resizeByWidth');
		prevWidth = currentWidth;
	}
});

/**
 * !Detected touchscreen devices
 * */
var TOUCH = Modernizr.touchevents;
var DESKTOP = !TOUCH;

/**
 * !Add placeholder for old browsers
 * */
function placeholderInit() {
	$('[placeholder]').placeholder();
}

/**
 * !Show print page by click on the button
 * */
function printShow() {
	$('.view-print').on('click', function (e) {
		e.preventDefault();
		window.print();
	})
}

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

		$.each($inputs, function () {
			switchHasValue.call(this);
		});

		$inputs.on('keyup change', function () {
			switchHasValue.call(this);
		});

		function switchHasValue() {
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
		}
	}
}

/**
 * !Initial custom select for cross-browser styling
 * */
function customSelect(select) {
	$.each(select, function () {
		var $thisSelect = $(this);
		// var placeholder = $thisSelect.attr('data-placeholder') || '';
		$thisSelect.select2({
			language: "ru",
			width: '100%',
			containerCssClass: 'cselect-head',
			dropdownCssClass: 'cselect-drop'
			// , placeholder: placeholder
		});
	})
}

/**
 * !Initial sliders on the project
 * */
function slidersInit() {
	//images carousel
	var $imagesCarousel = $('.images-slider-js');

	if($imagesCarousel.length){
		var slideCounterTpl = '' +
			'<div class="slider-counter">' +
				'<span class="slide-curr">0</span>/<span class="slide-total">0</span>' +
			'</div>';

		var titleListTpl = $('<div class="flashes"></div>');

		$imagesCarousel.each(function () {
			var $curSlider = $(this);
			var $imgList = $curSlider.find('.images-slider__list');
			var $imgListItem = $imgList.find('.images-slider__item');
			var dur = 200;

			// create titles
			$imgList.after(titleListTpl.clone());
			var $titleList = $curSlider.find('.flashes');
			$.each($imgListItem, function () {
				var $this = $(this);
				$titleList.append($('<div class="flashes__item">' + $this.find('.caption').html() + '</div>'));
			});

			// initialized slider of titles
			$titleList.slick({
				fade: true,
				speed: dur,
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
				asNavFor: $imgList,
				dots: false,
				arrows: false,

				swipe: false,
				touchMove: false,
				draggable: false
			});

			// initialized slider of images
			$imgList.on('init', function (event, slick) {
				$(slick.$slider).append($(slideCounterTpl).clone());

				$('.slide-total', $(slick.$slider)).text(slick.$slides.length);
				$('.slide-curr', $(slick.$slider)).text(slick.currentSlide + 1);
			}).slick({
				fade: false,
				speed: dur,
				slidesToShow: 1,
				slidesToScroll: 1,
				asNavFor: $titleList,
				lazyLoad: 'ondemand',
				infinite: true,
				dots: true,
				arrows: true
			}).on('beforeChange', function (event, slick, currentSlide, nextSlider) {
				$('.slide-curr', $(slick.$slider)).text(nextSlider + 1);
			});

		});
	}
}

/**
 * !Form validation
 * */
function formValidation() {
	$('.user-form form').validate({
		errorClass: "error",
		validClass: "success",
		errorElement: false,
		errorPlacement: function(error,element) {
			return true;
		},
		highlight: function(element, errorClass, successClass) {
			$(element)
				.removeClass(successClass)
				.addClass(errorClass)
				.closest('form').find('label[for="' + $(element).attr('id') + '"]')
				.removeClass(successClass)
				.addClass(errorClass);
		},
		unhighlight: function(element, errorClass, successClass) {
			$(element)
				.removeClass(errorClass)
				.addClass(successClass)
				.closest('form').find('label[for="' + $(element).attr('id') + '"]')
				.removeClass(errorClass)
				.addClass(successClass);
		}
	});
}


/**
 * !Cards of English words
 * */
function wordsCards() {
	var $words = $('.words-js'),
		$front = $('.words__card_front-js'),
		$back = $('.words__card_back-js'),
		$note = $('.words__note-js'),
		activeClass = 'active';

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
		// return Math.round(Math.random() * (max - min)) + min;
	}

	var randomPair = function () {

		var pair = myEnglishWords[getRandomInt(0, myEnglishWords.length)];
		// $front.html(pair.front);
		// $back.html(pair.back);
		$front.html(pair.back);
		$back.html(pair.front);
		pair.note && $('li', $note).html('<em>-</em>').html(pair.note[0]);
	};

	randomPair();

	$words.on('click', function (e) {
		e.preventDefault();

		var $currentCard = $(this);

		if ($currentCard.hasClass(activeClass)) {
			$currentCard.removeClass(activeClass);
			randomPair();
		} else {
			$currentCard.addClass(activeClass);
		}

	});

	// myEnglishWords.forEach(function(item, i, arr) {
	// 	console.log(arr[i].eng);
	// 	console.log(arr[i].ru);
	// });
}

/**
 * =========== !ready document, load/resize window ===========
 */

$(window).on('load', function () {
	// add functions
});

$(window).on('debouncedresize', function () {
	// $(document.body).trigger("sticky_kit:recalc");
});

$(document).ready(function () {
	placeholderInit();
	printShow();
	inputFocusClass();
	inputHasValueClass();
	customSelect($('select.cselect'));
	slidersInit();
	objectFitImages(); // object-fit-images initial

	wordsCards();

	formValidation();
});
