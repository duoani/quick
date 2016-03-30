
//设置商品数量
+(function ($) {
    "use strict";

    var triggerIncrease = '[data-num="increase"]';
    var triggerDecrease = '[data-num="decrease"]';
    var triggerInput = '[data-num="input"]';

    var defaults = {
        min: 1,
        max: 100,
        disabled: false,
        readonly: false,
        reviseDefault: true,
    };

    var toStr = Object.prototype.toString;
    function getParent($this){
        return $this.closest(".ctrl-num");
    }

    function CtrlNum(element, options) {

        options = options || {};
        this.$element = $(element);
        //min\max值优先用js赋值方式，其次为dom赋值方式，最后才用默认值。
        if( options.min === undefined ){
            var min = this.$element.attr("data-min");
            if( min && !isNaN(min)){
                options.min = parseInt(min, 10);
            }
        }
        if( options.max === undefined ){
            var max = this.$element.attr("data-max");
            if(max && !isNaN(max)){
                options.max = parseInt(max, 10);
            }
        }
        if( options.reviseDefault === undefined ){
            var revise = this.$element.attr("data-revise-default");
            options.reviseDefault = revise === '' || revise === 'true';
        }

        this.options = $.extend({}, defaults, options);
        this.$input = this.$element.find("input");
        this.$btnDec = this.$element.find(triggerDecrease);
        this.$btnInc = this.$element.find(triggerIncrease);
        this.init();
    }
    CtrlNum.prototype = {
        init: function () {
            var cur = parseInt(this.$input.val(), 10) || 0;
            if(this.options.reviseDefault){
                cur = this.fix(cur);
            }
            this.$input.val(cur);
            this.cache(cur);

            this.bind();

            //初始disabled检测
            if (this.options.disabled || this.$element.hasClass("disabled")) {
                this.disable();
            }

            //初始readonly检测
            if (this.options.readonly || this.$element.hasClass("readonly")) {
                this.readOnly();
            }
            this.checkDisable();
        },
        setOptions: function(key, val){
            var type = toStr.call(key);
            if(type === '[object Object]'){
                for(var k in key){
                    this.options[k] = key[k];
                }
            }
            else if(type === '[object String]'){
                this.options[key] = val;
            }

        },
        cache: function (val) {
            this.value = val;
        },
        fix: function (num) {
            num = num >= this.options.min ? num : this.options.min;
            return num <= this.options.max ? num : this.options.max;
        },
        bind: function () {
            var me = this;
            //数量减
            //me.$btnDec.on("touchstart", function () {
                //me.decrease();
            //});
            //数量加
            //me.$btnInc.on("touchstart", function () {
                //me.increase();
            //});
            //数量直接输入
            //me.$input.on("blur", function () {
                //return me.input();
            //});
        },
        increase: function(){
            var me = this;
            if (me.options.disabled || me.options.readonly || me.$element.hasClass('inc-disabled')) {
                return;
            }
            var cur = parseInt(me.$input.val(), 10) || 0,
                prev = me.value;
            cur = me.fix(cur + 1);
            me.$input.val(cur);
            me.cache(cur);
            if (cur !== prev) {
                me.trigger();
            }
        },
        decrease: function(){
            var me = this;
            if (me.options.disabled || me.options.readonly || me.$element.hasClass('dec-disabled')) {
                return;
            }
            var cur = parseInt(me.$input.val(), 10) || 0,
                prev = me.value;
            cur = me.fix(cur - 1);
            me.$input.val(cur);
            me.cache(cur);
            if (cur !== prev) {
                me.trigger();
            }
        },
        input: function(triggerEvent){
            var me = this;
            if (me.options.disabled || me.options.readonly) {
                return false;
            }
            var cur = parseInt(me.$input.val(), 10) || 0,
                prev = me.value;
            cur = me.fix(cur);
            me.$input.val(cur);
            me.cache(cur);
            if (cur !== prev && triggerEvent !== false) {
                me.trigger();
            }
        },
        disable: function () {
            this.$element.addClass("disabled");
            this.$input.prop("disabled", true);
            this.options.disabled = true;
        },
        enable: function () {
            this.$element.removeClass("disabled");
            this.$input.prop("disabled", false);
            this.options.disabled = false;
        },
        readOnly: function (){
            this.$element.addClass("readonly");
            this.$input.prop("readonly", true);
            this.options.readonly = true;
        },
        enaOnly: function (){
            this.$element.addClass("readonly");
            this.$input.prop("readonly", false);
            this.options.readonly = false;
        },
        checkDisable: function(){
            if( this.value <= this.options.min ){
                this.$element.addClass("dec-disabled");
            }else{
                this.$element.removeClass("dec-disabled");
            }
            if( this.value >= this.options.max ){
                this.$element.addClass("inc-disabled");
            }else{
                this.$element.removeClass("inc-disabled");
            }
        },
        trigger: function () {
            this.checkDisable();
            this.$element.trigger($.Event('ctrlnum:change'), this.value);
        }
    };

    $.fn.ctrlnum = function (options) {
        var args = Array.prototype.slice.call(arguments, 1),
            value;
        this.each(function (){
            var $this = $(this),
                data = $this.data("ui.ctrlnum");

            if (!data) {
                data = new CtrlNum(this, options);
                $this.data("ui.ctrlnum", data);

            } 
            if (typeof options == 'string') {
                //不允许调用私有方法(_methodName like)
                value = data[options] && options.indexOf("_") !== 0 && data[options].apply(data, args);
            }
        });
        return value !== undefined ? value : this;
    };

    $(".ctrl-num").ctrlnum();
    $(document)
        .on('touchstart.ui.ctrlnum.data-api', triggerIncrease, function(){
            getParent($(this)).ctrlnum("increase");
        })
        .on('touchstart.ui.ctrlnum.data-api', triggerDecrease, function(){
            getParent($(this)).ctrlnum("decrease");
        })
        .on('blur.ui.ctrlnum.data-api', triggerInput, function(){
            getParent($(this)).ctrlnum("input");
        });
})(window.Zepto);
