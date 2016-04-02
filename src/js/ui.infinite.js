/**
 * 无限滚动
 * require zepto.js
 */
!function($){
    var defaults = {
        offset: -200,      //top偏移
        disabled: false,  //初始化时是否激活滚动监听
        scrollTarget: window,
        callback: $.noop,
        render: true
    };


    function docHeight() {
        var doc = "BackCompat" == document.compatMode ? document.body : document.documentElement;
        return Math.max(doc.clientHeight, doc.scrollHeight);
    }

    function Infinite(element, options){
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this.$scrollTarget = $(this.options.scrollTarget || window);
        this.scrollTick = 0;
        this.busy = false;
        this.disabled = !!this.options.disabled;
        this.scrollHandler = this.checkScroll();
        if (this.options.render) {
            this.render();
        }
    }

    Infinite.prototype = {
        render: function(){
            var me = this;
            me.$scrollTarget.on("scroll", this.scrollHandler);
            //初始化时触发一次
            setTimeout(function () {
                me.scrollHandler();
            }, 50);
        },
        done: function () {
            this.busy = false;
        },
        checkScroll: function () {
            var me = this;
            return function () {
                if (me.busy || me.disabled) {
                    return;
                }
                clearTimeout(me.scrollTick);
                me.scrollTick = setTimeout(function () {
                    var scrollTop = me.$scrollTarget.scrollTop(),
                        clientHeight = docHeight(),
                        offset = me.element.offset(),
                        elemTop = me.element[0].offsetTop, //or use element.offset().top for jQuery
                        elemHeight = offset.height; //or use element.outerHeight() for jQuery

                    if (scrollTop + clientHeight >= elemTop + elemHeight + me.options.offset) {
                        me.busy = true;
                        var defer = $.Deferred();
                        defer.then(function () {
                            me.done();
                        }, function () {
                            me.done();
                        });
                        me.options.callback.call(me.element[0], defer);
                    }
                }, 50);
            };
        },
        enable: function () {
            this.disabled = false;
        },
        disable: function () {
            this.disabled = true;
        },
        dispose: function(){
            clearTimeout(this.scrollTick);
            this.$scrollTarget.off("scroll", this.scrollHandler);
        }
    };

    function Plugin() {
        var options = arguments[0],
            args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('ui.infinite');

            if (!data){
                $this.data('ui.infinite', (data = new Infinite($this[0], options)));
            }
            else if (typeof options == 'string') {
                data[options].apply(data, args);

            }
        });
    }

    var old = $.fn.infinite;

    $.fn.infinite = Plugin;
    $.fn.infinite.Constructor = Infinite;

    // TAB NO CONFLICT
    // ===============

    $.fn.infinite.noConflict = function () {
        $.fn.infinite = old;
        return this;
    };
}(Zepto);
