'use strict';

/*
	Globals Power2, enquire, TweenMax
 */

(function ($, TM) {
	/*
		Default Media queries - Should match exactly with the media queries in '_config-utilities.scss'
	 */
	var mq = {
		lg: '(min-width: 1200px)',
		md: '(min-width: 992px)',
		mdMax: '(max-width: 991px)',
		sm: '(min-width: 768px)',
		xs: '(max-width: 767px)',
		xxs: '(max-width: 500px)',
		xxxs: '(max-width: 359px)'
	};

	var tmEasing = Power2.easeInOut;


	/*
		Adding click functionality for mobile menu buttons
	 */
	function menuMobile () {
		var btnMenu = $('.site-header_menu-mob-nav');
		var searchBtn = $('.site-header_menu-mob-search');
		var searchForm = $('.site-header_search-wrap');
		var body = $('body');
		var viewport = $('.page-viewport');
		var btnClose = $('.nav-close-mob');
		var aClass = 'active';
		var oClass = 'open';
		var oNavClass = 'primary-nav-open';

		function focusMenu () {
			if (body.hasClass(oNavClass)) {
				$('.primary-nav a').removeAttr('tabindex');
				$('.primary-nav').attr('tabindex', '-1').focus();
			} else {
				$('.primary-nav a').attr('tabindex', '-1');
				$('.primary-nav').removeAttr('tabindex');
			}
		}

		function focusSearch () {
			if (searchForm.hasClass(oClass)) {
				$('input', searchForm).focus();
			}
		}

		function openMenu () {
			TM.to(viewport, 0.6, { easing: tmEasing, onComplete: focusMenu, x: '-70%' });
			body.addClass(oNavClass);
		}

		function closeMenu () {
			TM.to(viewport, 0.6, { easing: tmEasing, onComplete: function () {
				focusMenu();
				body.removeClass(oNavClass);
			}, x: '0%' });
		}

		function toggleMenu (e) {
			e.preventDefault();
			if (window.matchMedia(mq.xs).matches) {
				if (body.hasClass(oNavClass)) {
					closeMenu();
				} else {
					openMenu();
				}

				$(this).toggleClass(aClass);
			}
		}

		function toggleSearch (e) {
			e.preventDefault();
			if (window.matchMedia(mq.xs).matches) {
				if (searchForm.hasClass(oClass)) {
					TM.to(searchForm, 0.45, { easing: tmEasing, height: 0 });
				} else {
					TM.set(searchForm, { height: 'auto' });
					TM.from(searchForm, 0.45, { easing: tmEasing, onComplete: focusSearch, height: 0 });
				}
				searchForm.toggleClass(oClass);

				$(this).toggleClass(aClass);
			}
		}

		function closeMenuBtn (e) {
			e.preventDefault();
			if (window.matchMedia(mq.xs).matches) {
				btnMenu.removeClass(aClass);
				closeMenu();
			}
		}

		btnMenu.on('click', toggleMenu);
		btnClose.on('click', closeMenuBtn);

		searchBtn.on('click', toggleSearch);

		$('.primary-nav a').attr('tabindex', '-1');
	}


	/*
		Function to hide/show responsive elements
	 */
	function responsive () {
		var toggleMobileEls = $('.site-header_search-wrap');
		enquire.register( mq.xs , {
			setup: function () {
				if (window.matchMedia(mq.xs).matches) {
					// do mobile stuff
					TM.set(toggleMobileEls, { height: 0 });
				} else {
					toggleMobileEls.removeAttr('style').removeClass('open');
					$('.primary-nav a').removeAttr('tabindex');
				}
			},
			match: function () {
				TM.set(toggleMobileEls, { height: 0 });
			},
			unmatch: function () {
				toggleMobileEls.removeAttr('style').removeClass('open');
				$('.primary-nav a').removeAttr('tabindex');
			}
		});
	}


	function skipLinks () {
		var links = $('.skip-links a');

		function removeFocus () {
			$(this).removeAttr('tabindex');
		}

		function applyFocus () {
			var target = $(this).attr('href');

			$(target).attr('tabindex', '-1').focus();
			$(target).one('blur', removeFocus);
		}

		links.on('click', applyFocus);
	}

	function carousels () {
		var dataSelector = 'data-carousel';
		var loadElClass = 'bx-loading-el';
		var targets = $('['+dataSelector+']');
		function createCarousel () {
			var self = $(this);
			var classAttr = self.attr('data-class');
			var optionsAttr = self.attr(dataSelector);
			var options = JSON.parse(optionsAttr);
			var loadEl = null;

			function removeLoader () {
				$('.'+loadElClass, self).remove();
			}

			options = $.extend({}, options, { onSliderLoad: removeLoader })
			self.bxSlider(options).closest('.bx-wrapper').addClass(classAttr);
			self.after('<div class="'+loadElClass+'" />');

			TM.to(searchForm, 0.45, { easing: tmEasing, height: 0 });
		}	
		targets.each(createCarousel);
	}

	$(function () {
		menuMobile();
		responsive();
		skipLinks();
		carousels();
	});
}(jQuery, TweenMax));
