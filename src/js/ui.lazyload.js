!function ($) {

    // lazy type
    var LAZY_IMAGE      = 'data-lazy-img',
        LAZY_BACKGROUND = 'data-lazy-bg',
        LAZY_FUNCTION   = 'data-lazy-fn',
        LAZY_JAVASCRIPT = 'data-lazy-js';

    var defaults = {
        type             : "img",
        source           : "data-lazy-img",
        feature          : ['img', 'bg'], // 'fn' or 'js'
        delay            : 100,
        offset            : 100,
        onChange         : null,
        onLoaded         : null,
        placeholderClass : "lazy-load",
        errorClass       : "err-poster",
        scrollTarget     : window,
        render           : true
    };

    function docHeight() {
        var doc = "BackCompat" == document.compatMode ? document.body : document.documentElement;
        return Math.max(doc.clientHeight, doc.scrollHeight);
    }

    function Lazyload(element, options) {
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        if (this.options.render) {
            this.render();
        }
    }
    Lazyload.prototype = {
        render: function () {
            var me = this;
            var options = this.options;
            var feature = {};

            //要开启的赖加载功能
            $.each(options.feature, function(k, v){
                feature[v] = 1;
            });

            var load = function () {
                var scrollTop = $(me.options.scrollTarget).scrollTop();
                var viewDeep = scrollTop + docHeight() + options.offset; //可视的最低高度
                if( feature.img ){
                    me.check($('img['+LAZY_IMAGE+']', me.element).not('img['+LAZY_IMAGE+'=done]'), LAZY_IMAGE, scrollTop, viewDeep);
                }
                if( feature.bg ){
                    me.check($('['+LAZY_BACKGROUND+']', me.element).not('['+LAZY_BACKGROUND+'=done]'), LAZY_BACKGROUND, scrollTop, viewDeep);
                }
                if( feature.fn ){
                    me.check($('['+LAZY_FUNCTION+']', me.element).not('['+LAZY_FUNCTION+'=done]'), LAZY_FUNCTION, scrollTop, viewDeep);
                }
                if( feature.js ){
                    me.check($('['+LAZY_JAVASCRIPT+']', me.element).not('['+LAZY_JAVASCRIPT+'=done]'), LAZY_JAVASCRIPT, scrollTop, viewDeep);
                }
            };
            var tick = setTimeout(load, 100);
            var timeoutLoad = function () {
                tick && clearTimeout(tick);
                tick = setTimeout(load, options.delay);
            };

            $(this.options.scrollTarget).on("scroll", timeoutLoad);
            $(window).bind("resize", timeoutLoad);
        },
        load: function () {
            $(this.options.scrollTarget).trigger("scroll");
        },
        check: function($elements, lazyType, scrollTop, viewDeep){
            var me = this,
                options = me.options;
            $.each($elements, function () {
                var $elem = $(this);
                var source = $elem.attr(lazyType);

                if (source !== null) {
                    var top = me.getTop($elem[0]);
                    if (top > 0 && top > scrollTop - $elem.height() && viewDeep > top) {
                        if ("done" == source) {

                        } else if (LAZY_IMAGE == lazyType) {
                            loadImage($elem, source, options);
                        }else if(LAZY_BACKGROUND == lazyType){
                            loadBackground($elem, source, options);

                        } else if (LAZY_JAVASCRIPT == lazyType) {
                            loadJS($elem, source, options);

                        } else if (LAZY_FUNCTION == lazyType) {
                            loadFn($elem, source, options);
                        }
                    }
                }
            });
        },
        getTop: function (elem) {
            var b = elem.offsetTop;
            if (null != elem.parentNode) {
                var c = elem.offsetParent;
                for (; null != c;) {
                    b += c.offsetTop;
                    c = c.offsetParent;
                }
            }
            return b;
        }
    };

    //加载图片
    function loadImage($img, src, options) {
        if (!$img.attr("src") && src) {
            $img.addClass(options.placeholderClass);
        }
        $img.attr("src", src);
        $img.attr(LAZY_IMAGE, "done");

        if (src) {
            $img[0].onerror = function () {
                $img.removeClass(options.placeholderClass);
                $img[0].onerror = null;
                $.isFunction(options.onLoaded) && options.onLoaded.call($img, false);
            };
            $img[0].onload = function () {
                $img.removeClass(options.placeholderClass);
                $.isFunction(options.onLoaded) && options.onLoaded.call($img, true);
            };
        }
        $.isFunction(options.onChange) && options.onChange.call($img);
    }

    //加载图片
    function loadBackground($elem, src, options) {
        $elem.addClass(options.placeholderClass);
        $elem.attr(LAZY_BACKGROUND, "done");

        if (src) {
            var img = new Image();
            img.src = src;
            img.onerror = function () {
                $elem.removeClass(options.placeholderClass);
                $elem[0].onerror = null;
                $.isFunction(options.onLoaded) && options.onLoaded.call($elem, false);
            };
            img.onload = function () {
                $elem.removeClass(options.placeholderClass).css("backgroundImage", 'url("' + src + '")');
                $.isFunction(options.onLoaded) && options.onLoaded.call($elem, true);
            };
        }
        options.onChange && options.onChange.call($elem);
    }

    //加载JS
    function loadJS($elem, src, options) {
        $elem.attr(LAZY_JAVASCRIPT, "done");
        $.ajax({url: src, dataType: "script", cache: !0});
        options.onChange && options.onChange.call($elem);
    }

    //调用方法
    function loadFn($elem, src, options) {
        $elem.attr(LAZY_FUNCTION, "done");
        window[src] && window[src]($elem);
    }

    function Plugin() {
        var options = arguments[0],
            args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('ui.lazyload');

            if (!data){
                $this.data('ui.lazyload', (data = new Lazyload($this[0], options)));
            }
            else if (typeof options == 'string') {
                data[options].apply(data, args);

            }
        });
    }

    var old = $.fn.lazyload;

    $.fn.lazyload = Plugin;
    $.fn.lazyload.Constructor = Lazyload;

    // TAB NO CONFLICT
    // ===============

    $.fn.lazyload.noConflict = function () {
        $.fn.lazyload = old;
        return this;
    };
}(Zepto);
