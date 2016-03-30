!function ($) {
    "use strict";
    var defaults = {
        limit: true,    //是否启用输入限制, 当limit为false时, 设置min/max无效
        useSBC: true,   //是否采用全角字符验证，1个全角字符等于2个半角字符
        min: 0,        //最小输入"字符"数限制，无论是否启用useSBC，此参数的输入都为"字符"数；
        // 例如：
        // min为20时，当useSBC为false时，min相当于20个字符；当useSBC为false时，min相当于10个字
        max: 400,       //最大输入"字符"数限制
        wrapper: true,  //input/textarea是否添加wrapper
        wrapperClass: "ui-text", //wrapper样式类
        errorClass: "", //错误样式类
        render: true    //是否自动渲染
    };
    /**
     * 计算字符串长度(中文为2个字节,英文1个字节)
     * @param {String} str
     * @return {Number} 返回字符串长度
     */
    var chlen = function (str) {
        return str.replace(/[^\x00-\xff]/g, "xx").length;
    };
    
    var Textarea = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaults, options);

        if (this.options.render) {
            this.render();
        }
    };

    Textarea.prototype = {
        render: function () {
            var me = this,
                options = me.options;

            if (options.wrapper) {
                if (me.$element.is("textarea")) {
                    //添加textarea wrapper
                    me.$element
                        .wrap('<div class="' + me.options.wrapperClass + '"></div>');

                    //添加字符数限制显示
                    if (options.limit) {
                        me.$info = $('<div class="ui-text-info text-muted"></div>').insertAfter(me.$element);

                    }
                } else if (me.$element.is("input:text")) {

                }
            }

            me.$element.bind({
                input: function () {
                    me.check();
                },
                propertychange: function () {
                    me.check();
                }
            });

            if (options.limit) {
                me.check(true);
            }
        },

        /**
         * 验证输入是否超过限制
         * @returns {boolean}
         */
        check: function (init) {
            var isValid = true,
                options = this.options;

            if (options.limit) {
                var text = $.trim(this.$element.val()),
                    len = chlen(text),
                    info = "";

                if (!len) {
                    !init && this.$info && this.$info.addClass("text-danger");
                    if (options.useSBC) {
                        info = "请输入" + parseInt(options.min / 2) + "至" + parseInt(options.max / 2) + "个字";
                    } else {
                        info = "请输入" + options.min + "至" + options.max + "个字符";
                    }
                    isValid = false;

                } else if (len < this.options.min) {
                    this.$info && this.$info.addClass("text-danger");
                    if (options.useSBC) {

                        info = "请再输入" + Math.ceil((options.min - len) / 2) + "个字";
                    } else {
                        info = "请再输入" + (options.min - len) + "个字符";
                    }
                    isValid = false;

                } else if (len > this.options.max) {
                    this.$info && this.$info.addClass("text-danger");
                    if (options.useSBC) {
                        info = "已超出" + Math.ceil((len - options.max) / 2) + "个字";
                    } else {
                        info = "已超出" + (len - options.max) + "个字符";
                    }
                    isValid = false;

                } else {
                    this.$info && this.$info.removeClass("text-danger");
                    if (options.useSBC) {
                        info = "还可输入" + Math.ceil((options.max - len) / 2) + "个字";
                    } else {
                        info = "还可输入" + (options.max - len) + "个字符";
                    }
                    isValid = true;
                }
                this.$info && this.$info.text(info);
            }
            if (!init && options.errorClass) {
                var elem = options.wrapper ? this.$element.parent() : this.$element;
                if (isValid) {
                    elem.addClass(options.errorClass);
                } else {
                    elem.addClass(options.errorClass);
                }
            }
            return isValid;
        }
    };

    function Plugin() {
        var options = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            returnValue;

        this.each(function () {
            var $this = $(this);
            var data  = $this.data('ui.textarea');

            if (!data){
                $this.data('ui.textarea', (data = new Textarea($this[0], options)));
            }
            else if (typeof options == 'string') {
                returnValue = data[options].apply(data, args);
            }
        });
        return returnValue !== undefined ? returnValue : this;
    }

    var old = $.fn.textarea;

    $.fn.textarea = Plugin;
    $.fn.textarea.Constructor = Textarea;

    // TAB NO CONFLICT
    // ===============

    $.fn.textarea.noConflict = function () {
        $.fn.textarea = old;
        return this;
    };
}(Zepto);
