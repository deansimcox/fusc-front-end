'use strict';



/*
	console.log() polyfill
 */
(function (w) {
	w.console = w.console || {
		log: function () {}
	};
})(typeof window === 'undefined' ? this : window);



/*
	Main app
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
		var primaryNav = $('.primary-nav');
		var aClass = 'active';
		var oClass = 'open';
		var oNavClass = 'primary-nav-open';

		function focusMenu () {
			if (body.hasClass(oNavClass)) {
				$('a', primaryNav).removeAttr('tabindex');
				primaryNav.attr('tabindex', '-1').focus();
			} else {
				$('a', primaryNav).attr('tabindex', '-1');
				primaryNav.removeAttr('tabindex');
			}
		}

		function focusSearch () {
			if (searchForm.hasClass(oClass)) {
				$('input', searchForm).focus();
			}
		}

		function openMenu () {
			primaryNav.show();
			TM.to(viewport, 0.6, { easing: tmEasing, onComplete: focusMenu, x: '-70%' });
			body.addClass(oNavClass);
		}

		function closeMenu () {
			TM.to(viewport, 0.6, { easing: tmEasing, onComplete: function () {
				focusMenu();
				body.removeClass(oNavClass);
				primaryNav.hide();
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

		// do responsive things to primary-nav
		enquire.register(mq.xs, {
			setup: function () {
				if (window.matchMedia(mq.xs).matches) {
					primaryNav.hide();
				} else {
					primaryNav.show();
				}
			},
			match: function () {
				primaryNav.hide();
			},
			unmatch: function () {
				primaryNav.show();
			}
		});

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
		enquire.register(mq.xs, {
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
		var loadElClass = 'bx-loading-el-wrap';
		var targets = $('[' + dataSelector + ']');

		function createCarousel () {
			var self = $(this);
			var container = self.closest('.carousel-container-wrap');
			var classAttr = self.attr('data-class');
			var optionsAttr = self.attr(dataSelector);
			var options = JSON.parse(optionsAttr);

			function removeLoader () {
				setTimeout(function () {
					var target = $('.' + loadElClass, container);
					TM.to(target, 1, { easing: tmEasing, opacity: 0, scale: 0.9, onComplete: function () {
						target.hide();
					} });
				}, 500);
			}

			var optsCombined = $.extend({}, options, { onSliderLoad: removeLoader });
			self.bxSlider(optsCombined).closest('.bx-wrapper').addClass(classAttr);
		}
		targets.each(createCarousel);
	}

	function modals () {
		// set the default class name
		vex.defaultOptions.className = 'vex-default';

		/*
			Monkey patch for closeByID function
			https://github.com/HubSpot/vex/issues/142
		 */
		var animationEndSupport = false;
		(function () {
			var s;
			s = (document.body || document.documentElement).style;
			animationEndSupport = s.animation !== void 0 || s.WebkitAnimation !== void 0 || s.MozAnimation !== void 0 || s.MsAnimation !== void 0 || s.OAnimation !== void 0;
			return $(window).bind('keyup.vex', function (event) {
				if (event.keyCode === 27) {
					return vex.closeByEscape();
				}
			});
		}());
		vex.closeByIdOld = vex.closeByID;
		vex.closeByID = function (id) {
			/*eslint consistent-return: 0*/
			var $vex, $vexContent, beforeClose, close, hasAnimation, options;
			$vexContent = vex.getVexByID(id);
			if (!$vexContent.length) {
				return;
			}
			$vex = $vexContent.data().vex.$vex;
			options = $.extend({}, $vexContent.data().vex);
			beforeClose = function () {
				if (options.beforeClose) {
					return options.beforeClose($vexContent, options);
				}
			};
			close = function () {
				$vexContent.trigger('vexClose', options);
				$vex.remove();
				$('body').trigger('vexAfterClose', options);
				if (options.afterClose) {
					return options.afterClose($vexContent, options);
				}
			};
			hasAnimation = $vexContent.css('animationName') !== 'none' && $vexContent.css('animationDuration') !== '0s';
			if (animationEndSupport && hasAnimation) {
				if (beforeClose() !== false) {
					$vex.unbind(vex.animationEndEvent).bind(vex.animationEndEvent, function () {
						return close();
					}).addClass(vex.baseClassNames.closing);
				}
			} else {
				if (beforeClose() !== false) {
					close();
				}
			}
			return true;
		};

		// js to bind click event to open modal
		$('.js-modal-open').on('click', function () {
			vex.open({
				content: '<div>Content</div>'
			});
		});
	}

	$(function () {
		menuMobile();
		responsive();
		skipLinks();
		carousels();
		modals();
	});
}(jQuery, TweenMax));
