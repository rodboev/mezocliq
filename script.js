'use strict';

var mezocliq = mezocliq || {};

mezocliq = (function() {
    String.prototype.inMS = function() {
        return this.slice(-2, this.length) === 'ms' ? parseFloat(this) :
            this.slice(-1, this.length) === 's' ? parseFloat(this) * 1000 :
            0;
    };

    var stateChangeAllowed = true,
        stateChange = function(e) {
            if (!isMobile()) { 
                if (stateChangeAllowed)
                    get(document.location, false);
                else
                    history.pushState({url: path}, title, path);
            }
            else {
                document.location = e.target.location.pathname;
            }
        },
        main = function() {
            var instance,
                links = document.querySelectorAll('section nav a'),
                slidesBg = new Image(),
                i;

            nav('section nav p');
            ajax();
            video();
            addMenu();

            slidesBg.src = '/img/bg.jpg';
            for (i = 0; i < links.length; i++) {
                links[i].addEventListener('mouseenter', preloadTargetSlide);
            }

            ga('send', 'pageview'); // Google Analytics
        },
        addMenu = function() {
            var header = document.querySelector('header'),
                icon = document.createElement('div'),
                pageNav = document.querySelector('section nav').cloneNode(true),
                links = pageNav.querySelectorAll('a'),
                toggleMenu = function() {
                    var icon = document.querySelector('.icon');

                    if (icon.classList.contains('selected')) {
                        icon.classList.remove('selected');
                    }
                    else {
                        icon.classList.add('selected');
                    }
                };

            icon.className = 'icon';
            header.appendChild(icon);
            header.appendChild(pageNav);

            for (i = 0; i < links.length; i++) {
                if (links[i].parentNode.classList.contains('selected')) {
                    links[i].parentNode.removeAttribute('class');
                }
                if (links[i].href.indexOf(path) !== -1) {
                    links[i].parentNode.classList.add('selected');   
                }
            }

            icon.addEventListener('click', toggleMenu);
            nav('header nav p');
        },
        autoAdvanceTimeout,
        autoAdvanceInterval,
        stopAutoAdvance = function() {
            var nav = document.querySelector('section nav');
            nav.classList.remove('slow');

            clearInterval(autoAdvanceInterval);
            clearTimeout(autoAdvanceTimeout);
        },
        seen = function() {
            nav('footer a');
        },
        home = function() {
            var links = document.querySelectorAll('section nav a'),
                startAutoAdvance = function() {
                    stopAutoAdvance();
                    autoAdvanceTimeout = setTimeout(function() {
                        var nav = document.querySelector('section nav'),
                            links = document.querySelectorAll('section nav a');

                        nav.classList.add('slow');

                        autoAdvanceInterval = setInterval(function() {
                            var selected,
                                next;

                            for (i = 0; i < links.length; i++) {
                                if (links[i].parentNode.classList.contains('selected')) {
                                    selected = i;
                                }
                            }

                            links[selected].parentNode.classList.remove('selected');

                            if (selected >= links.length - 1)
                                links[0].parentNode.classList.add('selected');
                            else 
                                links[selected + 1].parentNode.classList.add('selected')
                        }, 3500);
                    }, 500)
                },
                i;

            for (i = 0; i < links.length; i++) {
                links[i].addEventListener('mouseout', startAutoAdvance);
                links[i].addEventListener('mouseover', stopAutoAdvance);
                links[i].addEventListener('click', function() {
                    var links = document.querySelectorAll('section nav a');

                    for (i = 0; i < links.length; i++) {
                        links[i].removeEventListener('mouseout', startAutoAdvance);
                        links[i].removeEventListener('mouseover', stopAutoAdvance);
                    }
                });
            }

            links[0].parentNode.classList.add('selected');
            startAutoAdvance();
        },
        removeHighlightTimeout = [],
        nav = function(selector) {
            var links = document.querySelectorAll(selector),
                nav = links[0].parentNode,
                highlight = function(e) {
                    clearTimeout(removeHighlightTimeout[selector]);
                    nav.classList.remove('slow');
                    for (i = 0; i < links.length; i++) {
                        links[i].classList.remove('selected');
                    }
                    e.currentTarget.classList.add('selected');
                },
                removeHighlight = function(e) {
                    var currentPage = document.querySelector('main');

                    if (!currentPage.classList.contains('home') || currentPage.classList.contains('seen')) {
                        clearTimeout(removeHighlightTimeout[selector]);
                        removeHighlightTimeout[selector] = setTimeout(function() {
                            nav.classList.add('slow');
                            setTimeout(function() {
                                nav.classList.remove('slow');
                            }, 800);

                            for (i = 0; i < links.length; i++) {
                                links[i].classList.remove('selected');

                                if (links[i].classList.contains('current')) {
                                    links[i].classList.add('selected');
                                }
                            }
                        }, 800);
                    }
                },
                i, j;

                for (i = 0; i < links.length; i++) {
                    links[i].addEventListener('mouseenter', highlight);
                    links[i].addEventListener('mouseleave', removeHighlight);
                }
        },
        popstate = false,
        ajax = function() {
            var links = document.querySelectorAll('a'),
                i;

            for (i = 0; i < links.length; i++) {
                links[i].addEventListener('click', function(e) {
                    var href = this.getAttribute('href');
                    
                    if (!isMobile()) {
                        if (e.currentTarget.host === location.host) {
                            e.preventDefault();
                            get(href);
                        }
                    }
                })
            }
        },
        path = document.location.pathname,
        title = document.title,
        scrollbarWidth,
        get = function(url, update) {
            var xhr = new XMLHttpRequest(),
                currentPage = document.querySelector('main'),
                newPage,
                gridContainer,
                urlParts,
                pathParts,
                useGrid,
                loginButton = document.querySelector('a[title="Login"]'),
                rightColumn = document.querySelector('div.right'),
                replace = function() {
                    Number.prototype.inVW = function() { return this / window.innerWidth * 100; };

                    var links = currentPage.querySelectorAll('a'),
                        i;

                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            newPage = this.responseXML.querySelector('main');
                            if (useGrid) {
                                newPage.classList.add('hidden');
                                gridContainer = document.querySelector('main.animating');

                                if (currentPage.style.width !== '')
                                    gridContainer.style.width = currentPage.style.width;

                                gridContainer.parentNode.insertBefore(newPage, gridContainer);
                                resize();
                            }
                            else {
                                currentPage.parentNode.insertBefore(newPage, currentPage);
                                resize();

                                if (currentPage.style.width !== '')
                                    newPage.style.width = currentPage.style.width;

                                currentPage.classList.add('hiding')
                                setTimeout(function() {
                                    if (currentPage.querySelector('main') !== null)
                                        videoPlayerDispose(currentPage);
                                    currentPage.parentNode.removeChild(currentPage);
                                    updateCurrentSlide();
                                }, animDuration / 2);
                            }

                            // init page
                            (function() {
                                var page = document.querySelector('main').classList.item(0);

                                if (typeof mezocliq[page] === 'function') {
                                    mezocliq[page]();
                                }
                            })();

                            if (path === '/')
                                stopAutoAdvance();

                            for (i = 0; i < links.length; i++) {
                                links[i].removeAttribute('href');
                                links[i].classList.add('disabled');
                            }

                            if (update !== false) {
                                history.pushState({url: url}, this.responseXML.title, url);
                            }
                            path = url;
                            document.title = this.responseXML.title;
                            main();
                        } else {
                            console.error(xhr.statusText);
                        }
                    }
                };

            if (typeof url !== 'string') url = url.pathname;

            if (url !== path) {
                urlParts = url.split('/');
                pathParts = path.split('/');
                
                if (urlParts[1] === '' && pathParts[1] === 'seen') {
                    useGrid = false;
                }
                else if (pathParts[1] === '' && urlParts[1] === 'seen') {
                    useGrid = false;
                }
                else if (urlParts.length <= 3 && urlParts[1] !== pathParts[1]) {
                    useGrid = true;
                }
                else if (urlParts[1] !== pathParts[1]) {
                    useGrid = true;
                }

                if (useGrid)
                    showSlide(getSlide(url));

                xhr.addEventListener('load', replace);
                xhr.open('GET', url);
                xhr.responseType = 'document';
                xhr.send();
            }
        },
        currentSlide,
        cells,
        gridEl,
        currentPage = document.querySelector('main'),
        newPage,
        createGrid = function(container) {
            var size = [40, 27],
                cell,
                x, y;

            gridEl = document.createElement('div');

            for (y = 1; y <= size[1]; y++) {
                for (x = 1; x <= size[0]; x++) {
                    cell = document.createElement('div');
                    cell.className = 'r' + y + ' c' + x + ' x' + x + '-y' + y;
                    gridEl.appendChild(cell);
                }
            }

            gridEl.className = 'grid';
            container.appendChild(gridEl);
        },
        isMobile = function() {
            return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 1280;
        },
        resize = function() {
            var page = document.querySelector('main:not(.animating)');

            if (!isMobile()) {
                scrollbarWidth = window.innerWidth - document.body.clientWidth;
                if (scrollbarWidth > 0) {
                    page.removeAttribute('style');
                    page.style.width = window.innerWidth + 'px';
                }
                else {
                    page.removeAttribute('style');
                }
            }

            checkRedSquare();
        },
        checkRedSquare = function() {
            var lastPara = document.querySelector('.left p:last-of-type');

            if (lastPara !== null) {
                if (lastPara.offsetTop + lastPara.offsetHeight > document.body.clientHeight) {
                    lastPara.classList.add('trim');
                }
                else {
                    lastPara.classList.remove('trim');
                }
            }
        },
        animCallback,
        animDuration = window.getComputedStyle(currentPage).transitionDuration.inMS(),
        getSlide = function(url) {
            var slide;

            if (url === '/' || url === '/seen/')
                slide = 0;
            else if (url === '/genesis/')
                slide = 1;
            else if (url === '/solution/')
                slide = 2;
            else if (url === '/coordinates/')
                slide = 3;
            else if (url.indexOf('/solution/') === 0)
                slide = 4;
            else if (url.indexOf('/coordinates/') === 0)
                slide = 5;

            return slide;
        },
        showSlide = function(targetSlide) {
            var animation,
                fadeOutDuration = animDuration / 3,
                gridContainer,
                ua = window.navigator.userAgent,
                isFirefox = ua.indexOf('Firefox') !== -1;

            stateChangeAllowed = false;

            // General guide:
            // - if going forward, use animation (targetSlide + 1 - 1)
            // - if going backward, use animation (targetSlide + 1)
            // - if going forward by > 1, also replace url of (targetSlide + 1 - 1) with (currentSlide + 1)
            // - if going backward by < 1, also replace url of (targetSlide + 1 + 1) with (currentSlide + 1)

            if (currentSlide === 4 && targetSlide === 3) { // solution subpage to coordinates main page
                animation = 3;
                replaceBg('img/slide-4', '/img/slide-5');
                replaceBg('img/slide-3', '/img/slide-4');
            }
            else if (targetSlide === 4 || targetSlide === 5) {
                animation = 1;
                replaceBg('img/slide-1', '/img/slide-' + (currentSlide + 1));
                replaceBg('img/slide-2', '/img/slide-' + (targetSlide + 1));
            }
            else if (targetSlide === currentSlide + 1) {
                animation = targetSlide; // targetSlide + 1 - 1
            }
            else if (targetSlide === currentSlide - 1) {
                animation = targetSlide + 1;
            }
            else if (targetSlide > currentSlide + 1) {
                animation = targetSlide;  // targetSlide + 1 - 1
                replaceBg('img/slide-' + targetSlide, '/img/slide-' + (currentSlide + 1));
            }
            else if (targetSlide < currentSlide - 1) {
                animation = targetSlide + 1;
                replaceBg('img/slide-' + (targetSlide + 2), '/img/slide-' + (currentSlide + 1));
            }

            gridContainer =  document.createElement('main');
            gridContainer.classList.add('animating');
            currentPage = document.querySelector('main');
            currentPage.parentNode.insertBefore(gridContainer, currentPage);
            createGrid(gridContainer);
            gridEl.classList.add('a' + animation);
            if (targetSlide < currentSlide) {
                gridEl.classList.add('p1');
                gridEl.classList.add('p2');
                gridEl.style.transitionDuration = '0s';
                gridEl.removeAttribute('style');
                gridEl.offsetWidth; // force reflow
            }

            currentPage.classList.add('hiding');
            setTimeout(function() {
                if (currentPage.querySelector('main') !== null)
                    videoPlayerDispose(currentPage);
                currentPage.parentNode.removeChild(currentPage);
            }, animDuration / 2);

            setTimeout(function() {
                if (!isFirefox)
                    gridContainer.classList.add('zoom');

                if (targetSlide > currentSlide) {
                    gridEl.offsetWidth; // force reflow
                    gridEl.classList.add('p1');
                }
                else if (targetSlide < currentSlide) {
                    gridEl.classList.remove('p2');
                }

                clearTimeout(animCallback);
                animCallback = setTimeout(function() {
                    if (!isFirefox)
                        gridContainer.classList.remove('zoom');

                    if (targetSlide > currentSlide) {
                        gridEl.classList.add('p2');
                    }
                    else if (targetSlide < currentSlide) {
                        gridEl.classList.remove('p1');
                    }

                    setTimeout(function(targetSlide) {
                        return function() {
                            var newPage = document.querySelector('main.hidden'),
                                page = newPage.classList.item(0);

                            gridEl.offsetWidth; // force reflow
                            resize();

                            /*
                            scrollbarWidth = window.innerWidth - document.body.clientWidth;
                            if (scrollbarWidth > 0) {
                                gridContainer.style.marginLeft = '-' + Math.floor(scrollbarWidth / 2) + 'px';
                            }
                            */
                            if (currentPage.style.width !== '')
                                gridContainer.style.width = currentPage.style.width;

                            newPage.classList.remove('hidden');
                            gridContainer.classList.add('hiding');
                            setTimeout(function() {
                                var transitionCSS = document.head.querySelectorAll('#transition');

                                for (i = 0; i < transitionCSS.length; i++) {
                                    transitionCSS[i].parentNode.removeChild(transitionCSS[i]);
                                }

                                gridContainer.parentNode.removeChild(gridContainer);
                                stateChangeAllowed = true;

                                if (typeof mezocliq[page] === 'function')
                                    mezocliq[page]();
                            }, animDuration / 2);

                            updateCurrentSlide();
                        }
                    }(targetSlide), animDuration);
                }, animDuration);
            }, fadeOutDuration);
        },
        replaceBg = function(source, target) {
            // http://stackoverflow.com/questions/2952667/find-all-css-rules-that-apply-to-an-element
            // https://davidwalsh.name/add-rules-stylesheets
            // refactor with https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
            var sheets = document.styleSheets,
                rules,
                styles,
                o = [],
                url,
                css,
                tag = document.createElement('style');

            for (var i in sheets) {
                rules = sheets[i].cssRules;
                for (var j in rules) {
                    if (typeof rules[j].cssText !== 'undefined') {
                        styles = rules[j].style;
                        for (var k in styles) {
                            if (styles[k] !== '' && typeof styles.backgroundImage !== 'undefined' && styles.backgroundImage !== '' && styles.backgroundImage.indexOf(source) !== -1) {
                                // if (typeof bgurl === 'undefined') url = styles.backgroundImage;
                                // o.push(rules[j].selectorText);
                                o.push(rules[j].selectorText + ' { background-image: ' + styles.backgroundImage.replace(source, target) + '; }');
                            }
                        }
                    }
                }
            }
            // css = o.join(', ') +  ' { background-image: ' + url.replace('img', '/img').replace(source, target) + '; }';
            css = o.join('\n');
            tag.id = 'transition';
            tag.appendChild(document.createTextNode('')); // webkit hack
            tag.appendChild(document.createTextNode(css));
            document.head.appendChild(tag);
        },
        updateCurrentSlide = function() {
            var slideBg = new Image();

            currentSlide = getSlide(path);

            if (!isMobile()) slideBg.src = '/img/slide-' + (currentSlide + 1) + '.jpg';
        },
        preloadTargetSlide = function(e) {
            var url = e.currentTarget.pathname,
                slide = getSlide(url),
                slideBg = new Image();

            if (!isMobile()) slideBg.src = '/img/slide-' + (slide + 1) + '.jpg';
        },
        player = [],
        video = function() {
            var el = document.querySelector('main').querySelector('video'),
                iOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !window.MSStream,
                instance;

            if (el !== null) {
                if (!iOS) {
                    instance = player.length;
                    player[instance] = videojs(el, {
                        'controls': true,
                        'autoplay': false
                    });

                    el.addEventListener('ended', function() {
                        player[instance].exitFullscreen().reset().initChildren();
                    });

                    el.parentNode.addEventListener('click', function() {
                        ga('send', 'event', 'Video', 'play', player[instance].currentSrc());
                    });
                }
                else {
                    el.setAttribute('controls', '');
                }
            }
        },
        videoPlayerDispose = function(page) {
            var oldVideo = page.querySelector('video'),
                newVideo = document.querySelector('main').querySelector('video'),
                instance;

            if (oldVideo !== null) {
                instance = newVideo === null ? player.length - 1 : player.length - 2;
                player[instance].dispose();
            }
        },
        i;

    document.addEventListener('DOMContentLoaded', function() {
        var page = document.querySelector('main').classList.item(0);

        window.addEventListener('popstate', stateChange);

        // https://developers.google.com/analytics/devguides/collection/analyticsjs/
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
        ga('create', 'UA-89055800-1', 'auto');

        main();

        if (typeof mezocliq[page] === 'function')
            mezocliq[page]();

        updateCurrentSlide();

        FastClick.attach(document.body);
        
        window.addEventListener('resize', resize);
        window.onload = function() {
            resize();
        }
    });

    return {
        home: home,
        seen: seen
    };
})();


/*
FT FastClick from https://github.com/ftlabs/fastclick/blob/master/lib/fastclick.js
Copyright (c) 2014 The Financial Times Ltd.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
*/
;(function () {
    'use strict';

    /**
     * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
     *
     * @codingstandard ftlabs-jsv2
     * @copyright The Financial Times Limited [All Rights Reserved]
     * @license MIT License (see LICENSE.txt)
     */

    /*jslint browser:true, node:true*/
    /*global define, Event, Node*/


    /**
     * Instantiate fast-clicking listeners on the specified layer.
     *
     * @constructor
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    function FastClick(layer, options) {
        var oldOnClick;

        options = options || {};

        /**
         * Whether a click is currently being tracked.
         *
         * @type boolean
         */
        this.trackingClick = false;


        /**
         * Timestamp for when click tracking started.
         *
         * @type number
         */
        this.trackingClickStart = 0;


        /**
         * The element being tracked for a click.
         *
         * @type EventTarget
         */
        this.targetElement = null;


        /**
         * X-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartX = 0;


        /**
         * Y-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartY = 0;


        /**
         * ID of the last touch, retrieved from Touch.identifier.
         *
         * @type number
         */
        this.lastTouchIdentifier = 0;


        /**
         * Touchmove boundary, beyond which a click will be cancelled.
         *
         * @type number
         */
        this.touchBoundary = options.touchBoundary || 10;


        /**
         * The FastClick layer.
         *
         * @type Element
         */
        this.layer = layer;

        /**
         * The minimum time between tap(touchstart and touchend) events
         *
         * @type number
         */
        this.tapDelay = options.tapDelay || 200;

        /**
         * The maximum time for a tap
         *
         * @type number
         */
        this.tapTimeout = options.tapTimeout || 700;

        if (FastClick.notNeeded(layer)) {
            return;
        }

        // Some old versions of Android don't have Function.prototype.bind
        function bind(method, context) {
            return function() { return method.apply(context, arguments); };
        }


        var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }

        // Set up event handlers as required
        if (deviceIsAndroid) {
            layer.addEventListener('mouseover', this.onMouse, true);
            layer.addEventListener('mousedown', this.onMouse, true);
            layer.addEventListener('mouseup', this.onMouse, true);
        }

        layer.addEventListener('click', this.onClick, true);
        layer.addEventListener('touchstart', this.onTouchStart, false);
        layer.addEventListener('touchmove', this.onTouchMove, false);
        layer.addEventListener('touchend', this.onTouchEnd, false);
        layer.addEventListener('touchcancel', this.onTouchCancel, false);

        // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
        // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
        // layer when they are cancelled.
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === 'click') {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };

            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === 'click') {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }

        // If a handler is already declared in the element's onclick attribute, it will be fired before
        // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
        // adding it as listener.
        if (typeof layer.onclick === 'function') {

            // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
            // - the old one won't work if passed to addEventListener directly.
            oldOnClick = layer.onclick;
            layer.addEventListener('click', function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }

    /**
    * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
    *
    * @type boolean
    */
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

    /**
     * Android requires exceptions.
     *
     * @type boolean
     */
    var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


    /**
     * iOS requires exceptions.
     *
     * @type boolean
     */
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


    /**
     * iOS 4 requires an exception for select elements.
     *
     * @type boolean
     */
    var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


    /**
     * iOS 6.0-7.* requires the target element to be manually derived
     *
     * @type boolean
     */
    var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

    /**
     * BlackBerry requires exceptions.
     *
     * @type boolean
     */
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

    /**
     * Determine whether a given element requires a native click.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element needs a native click
     */
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {

        // Don't send a synthetic click to disabled inputs (issue #62)
        case 'button':
        case 'select':
        case 'textarea':
            if (target.disabled) {
                return true;
            }

            break;
        case 'input':

            // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
            if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                return true;
            }

            break;
        case 'label':
        case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
        case 'video':
            return true;
        }

        return (/\bneedsclick\b/).test(target.className);
    };


    /**
     * Determine whether a given element requires a call to focus to simulate click into element.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
     */
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
        case 'textarea':
            return true;
        case 'select':
            return !deviceIsAndroid;
        case 'input':
            switch (target.type) {
            case 'button':
            case 'checkbox':
            case 'file':
            case 'image':
            case 'radio':
            case 'submit':
                return false;
            }

            // No point in attempting to focus disabled inputs
            return !target.disabled && !target.readOnly;
        default:
            return (/\bneedsfocus\b/).test(target.className);
        }
    };


    /**
     * Send a click event to the specified element.
     *
     * @param {EventTarget|Element} targetElement
     * @param {Event} event
     */
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;

        // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }

        touch = event.changedTouches[0];

        // Synthesise a click event, with an extra attribute so it can be tracked
        clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };

    FastClick.prototype.determineEventType = function(targetElement) {

        //Issue #159: Android Chrome Select Box does not open with a synthetic click event
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
            return 'mousedown';
        }

        return 'click';
    };


    /**
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.focus = function(targetElement) {
        var length;

        // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };


    /**
     * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
     *
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;

        scrollParent = targetElement.fastClickScrollParent;

        // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
        // target element was moved to another parent.
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }

                parentElement = parentElement.parentElement;
            } while (parentElement);
        }

        // Always update the scroll top tracker if possible.
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };


    /**
     * @param {EventTarget} targetElement
     * @returns {Element|EventTarget}
     */
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

        // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }

        return eventTarget;
    };


    /**
     * On touch start, record the position and scroll offset.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;

        // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
        if (event.targetTouches.length > 1) {
            return true;
        }

        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];

        if (deviceIsIOS) {

            // Only trusted events will deselect text on iOS (issue #49)
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }

            if (!deviceIsIOS4) {

                // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
                // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
                // with the same identifier as the touch event that previously triggered the click that triggered the alert.
                // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
                // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
                // Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
                // which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
                // random integers, it's safe to to continue if the identifier is 0 here.
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }

                this.lastTouchIdentifier = touch.identifier;

                // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
                // 1) the user does a fling scroll on the scrollable layer
                // 2) the user stops the fling scroll with another tap
                // then the event.target of the last 'touchend' event will be the element that was under the user's finger
                // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
                // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
                this.updateScrollParent(targetElement);
            }
        }

        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;

        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            event.preventDefault();
        }

        return true;
    };


    /**
     * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;

        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }

        return false;
    };


    /**
     * Update the last position.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }

        // If the touch has moved, cancel the click tracking
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }

        return true;
    };


    /**
     * Attempt to find the labelled control for the given label element.
     *
     * @param {EventTarget|HTMLLabelElement} labelElement
     * @returns {Element|null}
     */
    FastClick.prototype.findControl = function(labelElement) {

        // Fast path for newer browsers supporting the HTML5 control attribute
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }

        // All browsers under test that support touch events also support the HTML5 htmlFor attribute
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }

        // If no for attribute exists, attempt to retrieve the first labellable descendant element
        // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };


    /**
     * On touch end, determine whether to send a click event at once.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

        if (!this.trackingClick) {
            return true;
        }

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }

        if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
            return true;
        }

        // Reset to prevent wrong click cancel on input (issue #156).
        this.cancelNextClick = false;

        this.lastClickTime = event.timeStamp;

        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;

        // On some iOS devices, the targetElement supplied with the event is invalid if the layer
        // is performing a transition or scroll, and has to be re-detected manually. Note that
        // for this to function correctly, it must be called *after* the event target is checked!
        // See issue #57; also filed as rdar://13048589 .
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];

            // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }

        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }

                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {

            // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
            // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
            if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                this.targetElement = null;
                return false;
            }

            this.focus(targetElement);
            this.sendClick(targetElement, event);

            // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
            // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
            if (!deviceIsIOS || targetTagName !== 'select') {
                this.targetElement = null;
                event.preventDefault();
            }

            return false;
        }

        if (deviceIsIOS && !deviceIsIOS4) {

            // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
            // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }

        // Prevent the actual click from going though - unless the target node is marked as requiring
        // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }

        return false;
    };


    /**
     * On touch cancel, stop tracking the click.
     *
     * @returns {void}
     */
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };


    /**
     * Determine mouse events which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onMouse = function(event) {

        // If a target element was never set (because a touch event was never fired) allow the event
        if (!this.targetElement) {
            return true;
        }

        if (event.forwardedTouchEvent) {
            return true;
        }

        // Programmatically generated events targeting a specific element should be permitted
        if (!event.cancelable) {
            return true;
        }

        // Derive and check the target element to see whether the mouse event needs to be permitted;
        // unless explicitly enabled, prevent non-touch click events from triggering actions,
        // to prevent ghost/doubleclicks.
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

            // Prevent any user-added listeners declared on FastClick element from being fired.
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {

                // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
                event.propagationStopped = true;
            }

            // Cancel the event
            event.stopPropagation();
            event.preventDefault();

            return false;
        }

        // If the mouse event is permitted, return true for the action to go through.
        return true;
    };


    /**
     * On actual clicks, determine whether this is a touch-generated click, a click action occurring
     * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
     * an actual click which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onClick = function(event) {
        var permitted;

        // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }

        // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
        if (event.target.type === 'submit' && event.detail === 0) {
            return true;
        }

        permitted = this.onMouse(event);

        // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
        if (!permitted) {
            this.targetElement = null;
        }

        // If clicks are permitted, return true for the action to go through.
        return permitted;
    };


    /**
     * Remove all FastClick's event listeners.
     *
     * @returns {void}
     */
    FastClick.prototype.destroy = function() {
        var layer = this.layer;

        if (deviceIsAndroid) {
            layer.removeEventListener('mouseover', this.onMouse, true);
            layer.removeEventListener('mousedown', this.onMouse, true);
            layer.removeEventListener('mouseup', this.onMouse, true);
        }

        layer.removeEventListener('click', this.onClick, true);
        layer.removeEventListener('touchstart', this.onTouchStart, false);
        layer.removeEventListener('touchmove', this.onTouchMove, false);
        layer.removeEventListener('touchend', this.onTouchEnd, false);
        layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };


    /**
     * Check whether FastClick is needed.
     *
     * @param {Element} layer The layer to listen on
     */
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;

        // Devices that don't support touch don't need FastClick
        if (typeof window.ontouchstart === 'undefined') {
            return true;
        }

        // Chrome version - zero for other browsers
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (chromeVersion) {

            if (deviceIsAndroid) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // Chrome 32 and above with width=device-width or less don't need FastClick
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }

            // Chrome desktop doesn't need FastClick (issue #15)
            } else {
                return true;
            }
        }

        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

            // BlackBerry 10.3+ does not require Fastclick library.
            // https://github.com/ftlabs/fastclick/issues/251
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // user-scalable=no eliminates click delay.
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // width=device-width (or less than device-width) eliminates click delay.
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }

        // IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
        if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        // Firefox version - zero for other browsers
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (firefoxVersion >= 27) {
            // Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

            metaViewport = document.querySelector('meta[name=viewport]');
            if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }

        // IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
        // http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
        if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        return false;
    };


    /**
     * Factory method for creating a FastClick object
     *
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };


    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

        // AMD. Register as an anonymous module.
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
}());
