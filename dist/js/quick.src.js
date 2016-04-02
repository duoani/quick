/**
 * Created by duoani on 2015/11/20.
 * require zepto.js
 */

/*jshint -W030 */
!function($){
    /**
     * 简单模板引擎
     * @param tpl {String} 模板字符串
     * @param data {Object} 数据
     *
     * $.tpl('<a href="<%= href %>"><%= text %></a>', {text: '美篮子', href: 'http://www.mlzmall.com'})
     */
    $.tpl = function (tpl, data) {
        var c = "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + tpl.replace(/[\r\t\n]/g, " ")
        .split("<%")
        .join("	")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                 .replace(/\t=(.*?)%>/g, "',$1,'")
                 .split("	")
                 .join("');")
                 .split("%>")
                 .join("p.push('")
                 .split("\r")
                 .join("\\'") + "');}return p.join('');";

                 /*jslint evil: true */
                 var fn = new Function("obj", c);
                 return data ? fn(data) : fn;
    };

    $.adaptObject = function (element, defaults, options, template, plugin, pluginName) {
        var $this= element;

        if (typeof options != 'string'){

            // 获得配置信息
            var context = $.extend({}, defaults, typeof options == 'object' && options);

            // 如果传入script标签的选择器
            if($.isArray($this) && $this.length && $($this)[0].nodeName.toLowerCase() === "script"){
                // 根据模板获得对象并插入到body中
                $this = $($.tpl($this[0].innerHTML, context)).appendTo("body");
            }
            // 如果传入模板字符串
            else if($.isArray($this) && $this.length && $this.selector === ""){
                // 根据模板获得对象并插入到body中
                $this = $($.tpl($this[0].outerHTML, context)).appendTo("body");
            }
            // 如果通过$.dialog()的方式调用
            else if(!$.isArray($this)){
                // 根据模板获得对象并插入到body中
                $this = $($.tpl(template, context)).appendTo("body");
            }
        }

        return $this.each(function () {

            var el = $(this);
            // 读取对象缓存

            var data  = el.data('dui.'+pluginName);

            if (!data) {
                el.data('dui.'+pluginName, (data = new plugin(this, $.extend({}, defaults,  typeof options == 'object' && options))));
            }
            if (typeof options == 'string') data[options]();
        });
    };
}(Zepto);

$(function(){
    //触发手机端hover效果
    document.body.addEventListener('touchstart', function(){ });
});

/**
 * require zepto.js
 * require ui.js
 */
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

/**
 * require zepto.js
 * require ui.js
 * require ui.district.data.js
 */
// 省市区选择
!function($){
    
    var defaults = {
        value: '',
        show: true,
        itemHeight: 40
    };

    var tpl ='<div class="area-modal">'+
        '   <div class="area-backdrop">点击此处取消选择</div>'+
        '   <div class="area-dialog">'+
        '      <div class="area-list area-province border-r">'+
        '           <div class="area-title border-b">省份</div>'+
        '           <div class="area-content">'+
        '               <ul class="province">'+
        '               </ul>'+
        '           </div>'+
        '       </div>'+
        '       <div class="area-list area-city border-r">'+
        '           <div class="area-title border-b">城市</div>'+
        '           <div class="area-content">'+
        '               <ul class="city">'+
        '               </ul>'+
        '           </div>'+
        '       </div>'+
        '       <div class="area-list area-county">'+
        '           <div class="area-title border-b">区/县</div>'+
        '           <div class="area-content">'+
        '               <ul class="county">'+
        '               </ul>'+
        '           </div>'+
        '       </div>'+
        '   </div>'+
        '</div>';

    function District(element, options){
        this.options = options;
        this.element = $(element);
        this.province = this.element.find(".province");
        this.city = this.element.find(".city");
        this.county = this.element.find(".county");

        if( options.value ){
            var p = C.area.getProvinceByAreaCode(options.value);
            var c = C.area.getCityByAreaCode(options.value);
            var a = C.area.getAreaByCode(options.value);

            this._renderProvince(C.area.getProvinceList(), p.code);
            this._renderCity(C.area.getCityList(p.code), c.code);
            this._renderCounty(C.area.getAreaList(c.code), a.code);

        }else{
            this._renderProvince(C.area.getProvinceList());
        }
        this._bind();
        if( this.options.show ){
            this.show();
        }
    }
    District.prototype = {
        _bind: function(){
            var me = this;

            this.element.children(".area-backdrop").on("touchend", function(e){
                me.hide();
                e.preventDefault(); 
            });


            //点击省级，显示市级，隐藏区级
            this.province.on("tap", "li", function(e){
                var $this = $(this),
                    code = $this.attr("code");
                $this.addClass("active").siblings().removeClass("active");
                me._renderCity(C.area.getCityList(code) || []);
                me._renderCounty([]);
                e.preventDefault();
            });
            
            //点击市级，显示区级
            this.city.on("tap", "li", function(e){
                var $this = $(this),
                    code = $this.attr("code");
                $this.addClass("active").siblings().removeClass("active");
                me._renderCounty(C.area.getAreaList(code) || []);
                e.preventDefault();
            });

            //点击区级，关闭控件
            this.county.on("tap", "li", function(e){
                var $this = $(this),
                    code = $this.attr("code");
                $this.addClass("active").siblings().removeClass("active");

                me.element.trigger($.Event("district:change"), [[C.area.getProvinceByAreaCode(code), C.area.getCityByAreaCode(code), C.area.getAreaByCode(code)]]);
                me.hide();
                e.preventDefault();
            });
        },
        _renderProvince: function(list, activeCode){
            var html = "", i=0, item;
            while(item = list[i++]){
                html += '<li class="nowrap'+ (activeCode && activeCode == item.code ? ' active' : "") + '" code="' + item.code + '">' + item.display + '</li>';
            }
            this.province.html(html);
        },
        _renderCity: function(list, activeCode){
            var html = "", i=0, item;
            while(item = list[i++]){
                html += '<li class="nowrap'+ (activeCode && activeCode == item.code ? ' active' : "") + '" code="' + item.code + '">' + item.name + '</li>';
            }
            this.city.html(html);
        },
        _renderCounty: function(list, activeCode){
            var html = "", i=0, item;
            while(item = list[i++]){
                html += '<li class="nowrap'+ (activeCode && activeCode == item.code ? ' active' : "") + '" code="' + item.code + '">' + item.name + '</li>';
            }
            this.county.html(html);

        },
        show: function(){
            var me = this;
            var options = this.options;

            // 如果有选中，需要将选中项调整到可视区域。
            if(options.value){
                var index = this.province.children(".active").index();
                index >= 0 && this.province.parent().scrollTop(index * options.itemHeight);
                index = this.city.children(".active").index();
                index >= 0 && this.city.parent().scrollTop(index * options.itemHeight);
                index = this.county.children(".active").index();
                index >= 0 && this.county.parent().scrollTop(index * options.itemHeight);
            }

            setTimeout(function(){
                var e = $.Event('district:show');
                me.element.addClass('modal-open').trigger(e);
            }, 30);
        },
        hide: function(){
            var me = this;
            me.element.removeClass('modal-open');
            setTimeout(function(){
                var e = $.Event('district:hide');
                me.element.trigger(e).remove();
            }, 400);
        }
    };
    // 禁止冒泡
    function _stopScroll(e){
        e.preventDefault();
        return false;
    }
    
    $.fn.district = $.district = function(options){
        return $.adaptObject(this, defaults, options, tpl, District, 'district');
    };

}(window.Zepto);

;(function ($) {

var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };


/*
 * 工具类
 */
var utils = (function () {

	var me = {};

	var _elementStyle = document.createElement('div').style;

	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}
		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}


	me.getTime = Date.now || function getTime () { return new Date().getTime(); };


	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};


	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);	
	};


	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};


	me.prefixPointerEvent = function (pointerEvent) {
		return window.MSPointerEvent ? 
			'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
			pointerEvent;
	};


	/**
     * 根据一定时间内的滑动距离计算出最终停止距离和时间。
     * @param current：当前滑动位置
     * @param start：touchStart 时候记录的开始位置，但是在touchmove时候可能被重写
     * @param time：touchstart 到手指离开时候经历的时间，同样可能被touchmove重写
     * @param lowerMargin：可移动的最大距离，这个一般为计算得出 this.wrapperHeight - this.scrollerHeight
     * @param wrapperSize：如果有边界距离的话就是可拖动，不然碰到0的时候便停止
     * @param deceleration：匀减速
     * @returns {{destination: number, duration: number}}
     */
	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin'),
		transitionProperty: _prefixStyle('transitionProperty')
	});


	me.offset = function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		return {
			left: left,
			top: top
		};
	};


	/* 
	 * 配合 config 里面的 preventDefaultException 属性
	 * 不对匹配到的 element 使用 e.preventDefault()
	 * 默认阻止所有事件的冒泡，包括 click 或 tap
	 */
	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}
		return false;
	};


	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		pointerdown: 3,
		pointermove: 3,
		pointerup: 3,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});


	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});

	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};

	me.click = function (e) {
		var target = e.target,
			ev;
		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();



/*
 * 构造函数
 */
function Scroll(el, options) {

	this.wrapper = typeof el == 'string' ? $(el)[0] : el;

	this.options = {
		startX: 0,					// 初始化 X 坐标
		startY: 0,					// 初始化 Y 坐标
		scrollY: true,				// 竖向滚动
		scrollX: false,				// 默认非水平
		directionLockThreshold: 5,	// 确定滚动方向的阈值
		momentum: true,				// 是否开启惯性滚动

		duration: 300,				// transition 过渡时间

		bounce: true,				// 是否有反弹动画
		bounceTime: 600,			// 反弹动画时间
		bounceEasing: '',			// 反弹动画类型：'circular'(default), 'quadratic', 'back', 'bounce', 'elastic'

		preventDefault: true,		// 是否阻止默认滚动事件（和冒泡有区别）
		eventPassthrough: true,		// 穿透，是否触发原生滑动（取值 true、false、vertical、horizental）

		freeScroll: false,			// 任意方向的滚动。若 scrollX 和 scrollY 同时开启，则相当于 freeScroll

	    bindToWrapper : true,		// 事件是否绑定到 wrapper 元素上，否则大部分绑定到 window（若存在嵌套，则绑定在元素上最好）
    	resizePolling : 60,			// resize 时候隔 60ms 就执行 refresh 方法重新获取位置信息(事件节流)
    	
    	disableMouse : false,		// 是否禁用鼠标
	    disableTouch : false,		// 是否禁用touch事件
	    disablePointer : false,		// 是否禁用win系统的pointer事件

		tap: true,					// 是否模拟 tap 事件
		click: false,				// 是否模拟点击事件（false 则使用原生click事件）

		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ }, // 当遇到正则内的元素则不阻止冒泡

		HWCompositing: true, 		// Hardware acceleration
		useTransition: true,		// Transition || requestAnimationFrame
		useTransform: true			// Translate || Left/Top
	};


	for ( var i in options ) {
		this.options[i] = options[i];
	}


	// scroller
	// ==================================

	if (!this.options.role && this.options.scrollX === false) {
		this.options.eventPassthrough = 'horizontal';	// 竖直滚动的 scroller 不拦截横向原生滚动
	}

	// slide
	// ==================================

	if (this.options.role === 'slider') {

		this.options.scrollX = true;
		this.options.scrollY = false;
		this.options.momentum = false;

		this.scroller = $('.ui-slider-content',this.wrapper)[0];
		$(this.scroller.children[0]).addClass('current');

		this.currentPage = 0;
		this.count = this.scroller.children.length;

		this.scroller.style.width = this.count+"00%";

		this.itemWidth = this.scroller.children[0].clientWidth;
		this.scrollWidth = this.itemWidth * this.count;

        if(this.count <= 1){
            this.options.indicator = false;
        }

		if (this.options.indicator) {
			var temp = '<ul class="ui-slider-indicators">';

			for (var i=1; i<=this.count; i++) {
				if (i===1) {
					temp += '<li class="current">'+i+'</li>';
				}
				else {
					temp += '<li>'+i+'</li>';
				}
			}
			temp += '</ul>';
			$(this.wrapper).append(temp);
			this.indicator = $('.ui-slider-indicators',this.wrapper)[0];
		}
	}


	// tab
	// ==================================

	else if (this.options.role === 'tab') {

		this.options.scrollX = true;
		this.options.scrollY = false;
		this.options.momentum = false;

		this.scroller = $('.ui-tab-content',this.wrapper)[0];
		this.nav = $('.ui-tab-nav',this.wrapper)[0];

		$(this.scroller.children[0]).addClass('current');
		$(this.nav.children[0]).addClass('current');

		this.currentPage = 0;
		this.count = this.scroller.children.length;

		this.scroller.style.width = this.count+"00%";

		this.itemWidth = this.scroller.children[0].clientWidth;
		this.scrollWidth = this.itemWidth * this.count;


	}
	else {
		this.scroller = this.wrapper.children[0];
	}
	this.scrollerStyle = this.scroller.style;


	this.translateZ = utils.hasPerspective && this.options.HWCompositing ? ' translateZ(0)' : '';
	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;
	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;
	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;
	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;
	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if (this.options.tap === true) {
		this.options.tap = 'tap';
	}
	if (this.options.useTransform === false) {
		this.scroller.style.position = 'relative';
	}

	// Some defaults
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

	this._init();	// 绑定各种事件
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();

	// 自动播放
	if (this.options.autoplay) {
		var context = this;
		this.options.interval = this.options.interval || 2000;
		this.options.flag = setTimeout(function(){
			context._autoplay.apply(context)
		}, context.options.interval);
	}
}



Scroll.prototype = {

	_init: function () {
		this._initEvents();
	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		/*
		 * 给 addEventListener 传递 this
		 * 程序会自动找到 handleEvent 方法作为回调函数
		 */
		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
			eventType(target, utils.prefixPointerEvent('pointermove'), this);
			eventType(target, utils.prefixPointerEvent('pointercancel'), this);
			eventType(target, utils.prefixPointerEvent('pointerup'), this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);

		// tab
		// =============================
		if (this.options.role === 'tab') {
			eventType(this.nav, 'touchend', this);
			eventType(this.nav, 'mouseup', this);
			eventType(this.nav, 'pointerup', this);
		}
	},

	
	refresh: function () {
		var rf = this.wrapper.offsetHeight;	// Force reflow

		// http://jsfiddle.net/y8Y32/25/
		// clientWidth = content + padding
		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;


		// 添加 wrapper 的 padding 值到 scroller 身上，更符合使用预期
		var matrix = window.getComputedStyle(this.wrapper, null); 
		var pt = matrix['padding-top'].replace(/[^-\d.]/g, ''),
			pb = matrix['padding-bottom'].replace(/[^-\d.]/g, ''),
			pl = matrix['padding-left'].replace(/[^-\d.]/g, ''),
			pr = matrix['padding-right'].replace(/[^-\d.]/g, '');

		var matrix2 = window.getComputedStyle(this.scroller, null);
		var	mt2 = matrix2['margin-top'].replace(/[^-\d.]/g, ''),
			mb2 = matrix2['margin-bottom'].replace(/[^-\d.]/g, ''),
			ml2 = matrix2['margin-left'].replace(/[^-\d.]/g, ''),
			mr2 = matrix2['margin-right'].replace(/[^-\d.]/g, '');


		// offsetWidth = content + padding + border
		this.scrollerWidth	= this.scroller.offsetWidth+parseInt(pl)+parseInt(pr)+parseInt(ml2)+parseInt(mr2);
		this.scrollerHeight	= this.scroller.offsetHeight+parseInt(pt)+parseInt(pb)+parseInt(mt2)+parseInt(mb2);


		// slide
		// ==================================
		if (this.options.role === 'slider' || this.options.role === 'tab') {
			this.itemWidth = this.scroller.children[0].clientWidth;
            this.scrollWidth = this.itemWidth * this.count;
			this.scrollerWidth = this.scrollWidth;
		}

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);
		this.resetPosition();
	},
	
	
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'pointerdown':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'pointermove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'pointerup':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'pointercancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'wheel':
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	},



	_start: function (e) {

		if ( utils.eventType[e.type] != 1 ) {	// 如果是鼠标点击，则只响应鼠标左键
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		// 如果 preventDefault === true 且 不是落后的安卓版本 且 不是需要过滤的 target 就阻止默认的行为
		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,	// 检验是触摸事件对象还是鼠标事件对象
			pos;

		this.initiated	= utils.eventType[e.type];	// 初始化事件类型（1：触摸，2：鼠标，3：pointer）
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();
		this.startTime = utils.getTime();

		// 定住正在滑动的 scroller，slider/tab 不这么做
		if ( this.options.useTransition && this.isInTransition && this.options.role !== 'slider' && this.options.role !== 'tab') {
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
		}
		// 场景：（没有使用 Transition 属性）
		else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;

		// throttle
		// ======================
		if (this.options.autoplay) {
			var context = this;

			clearTimeout(this.options.flag);
			this.options.flag = setTimeout(function() {
				context._autoplay.apply(context);
			}, context.options.interval);
		}

		event.stopPropagation();
	},



	_move: function (e) {

		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {	// 如果事件类型和 touchstart 初始化的事件类型不一致，退出
			return;
		}
		if ( this.options.preventDefault ) {	// 这么做才能确保 Android 下 touchend 能被正常触发（需测试）
			e.preventDefault();
		}
		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);
		

		// 如果在很长的时间内只移动了少于 10 像素的距离，那么不会触发惯性滚动
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// 屏蔽滚动方向的另外一个方向（可配置）
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}
		if ( this.directionLocked == 'h' ) {
			// slider/tab 外层高度自适应
			if (this.options.role === 'tab') {
				$(this.scroller).children('li').height('auto');	
			}
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}
			deltaY = 0;	// 不断重置垂直偏移量为 0
		}
		else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}
			deltaX = 0;	// 不断重置水平偏移量为 0
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;
		
		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		this.moved = true;	// 滚动开始
		this._translate(newX, newY);

		if ( timestamp - this.startTime > 300 ) {	// 每 300 毫秒重置一次初始值
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}
	},



	_end: function (e) {

		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.changedTouches ? e.changedTouches[0] : e,	// 移开屏幕的那个触摸点，只会包含在 changedTouches 列表中，而不会包含在 touches 或 targetTouches 列表中
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();
	

		if ( this.resetPosition(this.options.bounceTime) ) {	// reset if we are outside of the boundaries
			if (this.options.role === 'tab') {
				$(this.scroller.children[this.currentPage]).siblings('li').height(0);	
			}
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		if (!this.moved) {	// we scrolled less than 10 pixels
			if (this.options.tap && utils.eventType[e.type] === 1) {
				utils.tap(e, this.options.tap);
			}
			if ( this.options.click) {
				utils.click(e);
			}
		}

		// 300ms 内的滑动要启动惯性滚动
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}
			this.scrollTo(newX, newY, time, easing);
			return;
		}


		// tab
		// ==========================
		if (this.options.role === 'tab' && $(event.target).closest('ul').hasClass('ui-tab-nav')) {
			$(this.nav).children().removeClass('current');
			$(event.target).addClass('current');
			var tempCurrentPage = this.currentPage;
			this.currentPage = $(event.target).index();

			$(this.scroller).children().height('auto');	// tab 外层高度自适应
			this._execEvent('beforeScrollStart', tempCurrentPage, this.currentPage);
		}



		// slider & tab
		// ==============================
		if (this.options.role === 'slider' || this.options.role === 'tab') {

			if (distanceX < 30) {
				this.scrollTo(-this.itemWidth*this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}
			else if (newX-this.startX<0) {	// 向前
				this._execEvent('beforeScrollStart', this.currentPage, this.currentPage+1);
				this.scrollTo(-this.itemWidth*++this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}
			else if (newX-this.startX>=0) {	// 向后
				this._execEvent('beforeScrollStart', this.currentPage, this.currentPage-1);
				this.scrollTo(-this.itemWidth*--this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}

			// tab 外层高度自适应
			if (this.options.role === 'tab') {
				$(this.scroller.children[this.currentPage]).siblings('li').height(0);
			}

			if (this.indicator && distanceX >= 30) {
				$(this.indicator).children().removeClass('current');
				$(this.indicator.children[this.currentPage]).addClass('current');
			}
			else if (this.nav && distanceX >= 30) {
				$(this.nav).children().removeClass('current');
				$(this.nav.children[this.currentPage]).addClass('current');
			}

			$(this.scroller).children().removeClass('current');
			$(this.scroller.children[this.currentPage]).addClass('current');
		}
	},


	_resize: function () {
		var that = this;
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},


	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}
		this._transitionTime();

		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd', this.currentPage);
		}
	},


	destroy: function () {
		this._initEvents(true);		// 去除事件绑定
	},


	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}
		this.scrollTo(x, y, time, this.options.bounceEasing);
		return true;
	},



	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},



	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}
		this._events[type].push(fn);
	},
	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},


	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}
		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}
		for ( ; i < l; i++ ) {
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},


	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {

			if ((this.options.role === 'slider' || this.options.role === 'tab') && time !== 0) {	// 不添加判断会影响 left/top 的过渡
				time = this.options.duration;
				this.scrollerStyle[utils.style.transitionProperty] = utils.style.transform;	
			}
			this.scrollerStyle[utils.style.transitionTimingFunction] = easing.style;
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},


	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}
		var pos = utils.offset(el);
		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		// 若 offsetX/Y 都是 true，则会滚动到元素在屏幕中间的位置
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}
		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;
		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},


	_transitionTime: function (time) {
		time = time || 0;
		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}
	},


	_translate: function (x, y) {
		if ( this.options.useTransform ) {
			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}
		this.x = x;
		this.y = y;
	},


	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	
	_animate: function (destX, destY, duration, easingFn) {	// 当浏览器不支持 transition 时提供的退化方案 requestAnimationFrame
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd', this.currentPage);
				}
				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}
		this.isAnimating = true;
		step();
	},


	_autoplay: function() {
		var self = this,
			curPage = self.currentPage;
		
		self.currentPage = self.currentPage >= self.count-1 ? 0 : ++self.currentPage;
		self._execEvent('beforeScrollStart', curPage, self.currentPage);	// 对于自动播放的 slider/tab，这个时机就是 beforeScrollStart

		// tab 外层高度自适应
		if (this.options.role === 'tab') {
			$(this.scroller).children().height('auto');
			document.body.scrollTop = 0;
		}
		self.scrollTo(-self.itemWidth*self.currentPage, 0, self.options.bounceTime, self.options.bounceEasing);

		if (self.indicator) {
			$(self.indicator).children().removeClass('current');
			$(self.indicator.children[self.currentPage]).addClass('current');
			$(self.scroller).children().removeClass('current');
			$(self.scroller.children[self.currentPage]).addClass('current');
		}
		else if (self.nav) {
			$(self.nav).children().removeClass('current');
			$(self.nav.children[self.currentPage]).addClass('current');
			$(self.scroller).children().removeClass('current');
			$(self.scroller.children[self.currentPage]).addClass('current');
		}

		self.options.flag = setTimeout(function() {
			self._autoplay.apply(self);
		}, self.options.interval);
	},
    
    moveTo: function(index){
		var self = this,
			curPage = self.currentPage;
		
		self.currentPage = index < 0 ? 0 : index > self.count-1 ? self.count : index;
		self._execEvent('beforeScrollStart', curPage, self.currentPage);	// 对于自动播放的 slider/tab，这个时机就是 beforeScrollStart

		// tab 外层高度自适应
		if (this.options.role === 'tab') {
			$(this.scroller).children().height('auto');
			document.body.scrollTop = 0;
		}
		self.scrollTo(-self.itemWidth*self.currentPage, 0, 0, self.options.bounceEasing);

		if (self.indicator) {
			$(self.indicator).children().removeClass('current');
			$(self.indicator.children[self.currentPage]).addClass('current');
			$(self.scroller).children().removeClass('current');
			$(self.scroller.children[self.currentPage]).addClass('current');
		}
		else if (self.nav) {
			$(self.nav).children().removeClass('current');
			$(self.nav.children[self.currentPage]).addClass('current');
			$(self.scroller).children().removeClass('current');
			$(self.scroller.children[self.currentPage]).addClass('current');
		}
    }


};

// Scroll.utils = utils;
window.fz = window.fz || {};
window.frozen = window.frozen || {};
window.fz.Scroll = window.frozen.Scroll = Scroll;

/*
 * 兼容 RequireJS 和 Sea.js
 */
if (typeof define === "function") {
	define(function(require, exports, module) {
		module.exports = Scroll;
	});
}

})(window.Zepto);

/*
 * 图片预览
 * require zepto.js
 * require ui.js
 * require ui.modal.js
 * require ui.slider.js
 */ 
!function($){
    'use strict';

    var toggle      = '[data-toggle= "gallery"]';
    var dataUrl     = 'data-gallery-url';
    var dataLazySrc = 'data-gallery-lazy-src';
    var dataParent  = 'data-gallery-parent';
    var dataText    = 'data-gallery-text';
    var dataDynamic  = 'data-gallery-dynamic';
    var dataEnableRemove= 'data-gallery-enable-remove';

    var defaults = {
        direction: 'horizontal',
        dynamic: false
    };

    var tpl = '' +
        '<div class="gallery-dialog"></div>';
    
    var contentTpl = ''+
        '<div class="gallery-slide">'+
        '   <ul class="gallery-content ui-slider-content" style="width: <%=urls.length%>00%;">'+
        '       <% for(var i=0, len=urls.length; i<len; i++){ %>'+
        '       <li><img class="gallery-img gallery-loading" '+dataLazySrc+'="<%= urls[i] %>"/></li>'+
        '       <% } %>'+
        '   </ul>'+
        '</div>'+
        '<% if( text ){ %>'+
        '<div class="gallery-text"><%= text %></div>'+
        '<% } %>'+
        '<div class="gallery-icon gallery-back"><i class="icon icon-left-open-big"></i></div>'+
        '<% if( remove ){ %>'+
        '<div class="gallery-icon gallery-remove"><i class="icon icon-trash-empty"></i></div>'+
        '<% } %>';
    function Gallery(element, options){
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this.options.text = this.element.find('['+dataText+']').text() || '';
        this.options.dynamic = this.element.attr(dataDynamic) === "true" || this.element.attr(dataDynamic) === "" ? true : false;
        this.options.enableRemove = this.element.attr(dataEnableRemove) === "true" || this.element.attr(dataEnableRemove) === "" ? true : false;
        this.urls = []; //图片url
        this.imgs = [];   //图片dom
        if(!this.options.dynamic){
            this.init();
        }
    }

    Gallery.prototype = {
        init: function(){
            var urls = [];
            var imgs = this.element.find(toggle).each(function(){
                var u = $(this).attr(dataUrl);
                if( u ){
                    urls.push(u);
                }
            });
            this.urls = urls; //图片url
        },

        show: function(current){
            var me = this;
            //动态标记为true时每次打开都重新初始化数据
            if(this.options.dynamic){
                this.init();
            }
            me.indexing(current);
            var $modal = $.modal({
                layout: 'blank',
                customClass: 'modal-dark',
                html: tpl,
                show: false
            }); 
            $modal.on('modal:show', function(){
                var $dialog = $(this);
                me.build();
                me.bind();
                me.load(me.index);
                //me.move(me.index, 0);
            });
            $modal.on('modal:hide', function(){
                me.dialog = null;
            });
            // must assign before modal is shown
            this.dialog = $modal;
            $modal.modal("show");
        },
        hide: function(){

        },
        indexing: function(current){
            var index = 0;
            if( current ){
                var u = $(current).attr(dataUrl);
                if( u ){
                    index = $.inArray(u, this.urls);
                }
            }
            this.index = index >= 0 ? index : 0;
        },
        build: function(){
            this.imgs = this.dialog.find('.gallery-dialog').html($.tpl(contentTpl, {urls: this.urls, text: this.options.text, remove: this.options.enableRemove})).find('.gallery-img');
        },
        bind: function(){
            var me = this;

            //退出
            me.dialog.find('.gallery-back').on('tap', function(e){
                me.dialog.modal('hide');
                e.stopPropagation();
            });

            //切换
            var slider = new fz.Scroll(me.dialog.find('.gallery-slide')[0], {
                role: 'slider',
                indicator: true,
                autoplay: false,
                interval: 3000
            });
            slider.moveTo(this.index);
            slider.on('beforeScrollStart', function(fromIndex, toIndex) {
                me.load(toIndex);
            });


            //移除
            if(me.options.enableRemove){
                me.dialog.find('.gallery-remove').on('tap', function(e){
                    $.confirm({
                        content: '确定删除此图片?',
                        buttons: [{text: '删除', type: 'primary'}, '取消']
                    }).on('modal:action', function(e){
                        if(e.index === 0){
                            me.element.trigger($.Event('gallery:remove'), slider.currentPage);
                            me.dialog.modal('hide');
                        }
                    });
                    e.stopPropagation();
                });
            }

            //描述
            if(me.options.text){
                var $text = me.dialog.find('.gallery-text');
                me.dialog.find('.gallery-slide').on('tap', function(){
                    $text.toggle();
                });
            }
        },
        load: function(index){
            var me = this;

            var $img = me.imgs.eq(index);
            var url = $img.attr(dataLazySrc);
            // done表示已加载过
            if(url && url != 'done'){
                var img = new Image();
                $.loadingShow();
                img.onload = function(){
                    //屏幕的宽高与图片的宽高之比最小值来达到全屏效果
                    var clientWidth = document.documentElement.clientWidth;
                    var clientHeight = document.documentElement.clientHeight;
                    var imgWidth, imgHeight;
                    //图片宽:屏幕宽 图片高:屏幕高
                    var dW = img.width / clientWidth;
                    var dH = img.height /clientHeight;
                    //图片尺寸比屏幕小
                    if(dW <= 1 && dH <= 1){
                        imgWidth = img.width;
                        imgHeight = img.height;

                    } else if( dW > dH ){ // 图片宽比较大
                        //imgWidth = img.width * dW; 
                        //imgHeight = img.height * dW;
                        imgWidth = '100%';
                        imgHeight = 'auto';

                    }else{ //图片高比较大
                        //imgWidth = img.width * dH; 
                        //imgHeight = img.height * dH;
                        imgWidth = 'auto';
                        imgHeight = '100%';
                    }
                    $img
                        .css({
                            width: imgWidth,
                            height: imgHeight
                        })
                        .attr('src', url)
                        .attr(dataLazySrc, 'done'); //设置图片为已加载
                    $.loadingHide();
                };
                img.onerror = function(){
                    $.loadingHide();
                };
                img.src = url;
            }
        }
    };

    function Plugin() {
        var options = arguments[0],
            args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this);
            var parentSelector = $this.attr(dataParent);
            var $parent = parentSelector ? $this.closest(parentSelector) : $this.parent();
            var data  = $parent.data('ui.gallery');

            if (!data) $parent.data('ui.gallery', (data = new Gallery($parent[0])));
            if (typeof options == 'string') data[options].apply(data, args);
        });
    }

    var old = $.fn.gallery;

    $.fn.gallery = Plugin;
    $.fn.gallery.Constructor = Gallery;

    // TAB NO CONFLICT
    // ===============

    $.fn.gallery.noConflict = function () {
        $.fn.gallery = old;
        return this;
    };

    // TAB DATA-API
    // ============

    var clickHandler = function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show', this);
    };

    $(document) .on('tap.ui.gallery.data-api', '[data-toggle="gallery"]', clickHandler);
}(Zepto);

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

/**
 * require zepto.js
 */
!function($){

    var ATTR_INPUT = '[data-input-type="text"]';
    var ATTR_CLEAR = '[data-input-type="clear"]';

    function getParent($elem){
        return $elem.closest('.form-control');
    }
    function autoToggle($input){
        if($input.val()){
            getParent($input).addClass('has-value');
        }else{
            getParent($input).removeClass('has-value');
        }
    }

    // data api
    $(document)
        .on('blur.ui.input.data-api', ATTR_INPUT, function(){
            autoToggle($(this));
        })
        .on('touchend.ui.input.data-api', ATTR_CLEAR, function(){
            var $parent = getParent($(this)).removeClass('has-value');
            var $input = $parent.find(ATTR_INPUT).val('');

            //定位焦点到输入框
            setTimeout(function(){
                $input.focus();
            }, 50);
        });

    //初始化
    $(function(){
        $(ATTR_INPUT).each(function(){
            autoToggle($(this));
        });
    });
}(window.Zepto);

/**
 * Loading
 * require zepto.js
 * require ui.js
 */
!function($){
    var defaults = {
        //content: '努力加载中...',
        show: true,
        type: 'modeless'
    }; 

    var tpl = ''+
    '<% if(type === "modal"){ %>'+
    '<div class="loading loading-modal">'+
    '    <div class="loading-modal-dialog">'+
    '        <i></i>'+
    '    </div>'+
    '</div>'+
    '<% }else{ %>'+
    '<div class="loading loading-modeless loading-open">'+
    '    <i></i>'+
    '</div>'+
    '<% } %>';

    var cache = {};

    function Loading(element, options){
        this.options = options;
        this.element = $(element);

        if( this.options.show ){
            this.show();
        }
    }

    Loading.prototype = {
        show: function(){
            this.element.addClass('loading-open');
            this.options.show = true;
        },
        hide: function(){
            this.element.removeClass('loading-open');
            this.options.show = false;
        }
    };

    $.fn.loading = $.loading = function(options){
        return $.adaptObject(this, defaults, options, tpl, Loading, 'loading');
    };
    
    var loadingCount = 0;
    $.loadingShow = function(){
        loadingCount ++;
        if( !cache.modeless ){
            cache.modeless = $.adaptObject(this, defaults, {}, tpl, Loading, 'loading');
        }
        cache.modeless.loading('show');
    };
    $.loadingHide = function(){
        loadingCount --;
        if( cache.modeless && !loadingCount ){
            cache.modeless.loading('hide');
        }
    };
}(Zepto);

/**
 * require zepto.js
 */
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

/**
 * $.modal
 * require zepto.js
 * require ui.js
 */
!function($){

    var defaults = {
        title       : '',       // 主标题
        subtitle    : '',       // 副标题
        content     : '',       // 内容
        buttons     : [{text:'确定'}], // 按钮组
        allowScroll : false,    // 是否允许modal在显示状态时滚动背景滚动条
        show        : true,     // 在初始化modal时立即显示
        html        : false,    //是否允许自定义html
        backdrop    : true,     //是否有遮罩
        backdropClose: false,   //点击遮罩层是否自动关闭弹窗
        layout      : 'normal',  //noraml | actionsheet 布局: 默认 | Action Sheet
        customClass : '',
        animate     : ''
    };
    var confirmDefaults = {
        buttons: [{text:'确定'}, {text:'取消'}],
        backdropClose: true,
        layout: 'actionsheet'
    };

    var toStr = Object.prototype.toString;
    var tpl =''+
    '<% if(layout == "normal"){ %>'+
    '<div class="modal modal-default<% if(customClass){%> <%= customClass %><% } %>">'+ 
    '    <% if(backdrop){ %>'+
    '    <div class="modal-backdrop"></div>'+
    '    <% } %>'+
    '    <div class="modal-dialog">'+
    '        <% if(title){ %>'+
    '        <div class="modal-header"><%= title %></div>'+
    '        <% } %>'+
    '        <div class="modal-body">'+
    '            <% if(html === false){ %>'+
    '               <div class="modal-content">'+
    '               <% if(subtitle !== ""){ %>'+
    '               <h4><%= subtitle %></h4>'+
    '               <% } %>'+
    '               <p><%= content %></p>'+
    '               </div>'+
    '            <% }else if(type === "html"){ %>'+
    '               <%= content %>'+
    '            <% } %>'+
    '        </div>'+
    '        <div class="modal-footer">'+
    '            <% for(var i=0, len=buttons.length; i<len; i++){ %>'+
    '            <button <% if(buttons[i].type){ %>class="modal-btn-<%= buttons[i].type %>"<% } %> type="button" data-role="button"><%= buttons[i].text %></button>'+
    '            <% } %>'+
    '        </div>'+
    '    </div>'+
    '</div>'+
    '<% } else if(layout == "actionsheet") { %>'+
    '<div class="actionsheet-modal<% if(customClass){%> <%= customClass %><% } %>">'+
    '   <% if(backdrop){ %>'+
    '   <div class="modal-backdrop"></div>'+
    '   <% } %>'+
    '   <div class="actionsheet-dialog">'+
    '       <div class="actionsheet-menu">'+
    '           <% if(content){ %>'+
    '           <div class="actionsheet-desc"><%= content %></div>'+    
    '           <% } %>'+
    '           <% for(var i=0, len=buttons.length-1; i<len; i++){ %>'+
    '           <div class="actionsheet-cell <% if(buttons[i].type){ %><%= "cell-"+buttons[i].type %><% } %>" data-role="button"><%= buttons[i].text %></div>'+    
    '           <% } %>'+
    '       </div>'+
    '       <div class="actionsheet-cancel">'+
    '           <% if(buttons.length){ %><div class="actionsheet-cell" data-role="button"><%= buttons[buttons.length-1].text %></div><% } %>'+    
    '       </div>'+
    '   </div>'+
    '</div>'+
    '<% } else if(layout == "blank"){ %>'+
    '<div class="modal<% if(animate){%> modal-<%= animate%><% } %><% if(customClass){%> <%= customClass %><% } %>">'+ 
    '   <% if(backdrop){ %>'+
    '   <div class="modal-backdrop"></div>'+
    '   <% } %>'+
    '   <%= html %>'+
    '   </div>'+
    '</div>'+
    '<% } else if(layout == "custom"){ %>'+
    '   <%= html %>'+
    '<% } %>';
    function Modal(element, options){
        this.options = options;
        this.element = $(element);
        this._bind();
        if( this.options.show ){
            this.show();
        }
    }
    Modal.prototype = {
        _bind: function(){
            var me = this;
            var $btn = me.element.find('[data-role="button"]');

            if(me.options.backdrop && me.options.backdropClose){
                me.element.children(".modal-backdrop").on("tap", function(e){
                    me.hide();
                    e.preventDefault(); 
                });
            }

            $btn.on('tap', function(e){
                var index = $btn.index(this); 
                var event=$.Event('modal:action');

                event.index=index;
                me.element.trigger(event);
                me.hide();
                e.preventDefault();
            });
        },
        show: function(){
            var me = this;
            !me.options.allowScroll && $(document).on("touchmove" , _stopScroll);
            setTimeout(function(){
                var e = $.Event('modal:show');
                me.element.addClass('modal-open');
                me.element.trigger(e);
            }, 30);
        },
        hide: function(){
            var me = this;
            !me.options.allowScroll && $(document).off("touchmove" , _stopScroll);
            me.element.removeClass('modal-open');
            setTimeout(function(){
                var e = $.Event('modal:hide');
                me.element.trigger(e).remove();
            }, 400);
        }
    };

    // 禁止冒泡
    function _stopScroll(e){
        e.preventDefault && e.preventDefault();
        e.returnValue=false;
        e.stopPropagation && e.stopPropagation();
        return false;
    }

    function buildBtn(btns){
        var arr = [];   
        for(var i=0, len=btns.length; i<len; i++){
            if(toStr.call(btns[i]) === '[object String]'){
                arr[i] = {text: btns[i]};
            }else{
                arr[i] = btns[i];
            }
        }
        return arr;
    }
    $.fn.modal = $.modal = function(options){
        if( options && options.buttons ){
            options.buttons = buildBtn(options.buttons);
        }
        return $.adaptObject(this, defaults, options, tpl, Modal, 'modal');
    };

    $.alert = function(options){
        var type = options === null || options === undefined ? null : Array.prototype.toString.call(options);
        if( type === '[object String]' ){
            return $.modal({subtitle: options});    
        } 
        return $.modal(options);
    };

    $.confirm = function(options){
        var type = options === null || options === undefined ? null : Array.prototype.toString.call(options);
        options = type === '[object String]' ? {content: options} : options;
        return $.modal($.extend({}, confirmDefaults, options));
    };
}(Zepto);

/**
 * $.fn.scrollwatcher
 * require zepto.js
 */
!function($){
    $.fn.scrollwatcher = function(callback){
        return this.each(function(){
            var $elem = $(this),
                beforeScrollTop = $elem.scrollTop(),
                fn = callback || function (){};

            $elem.on('scroll', function (){
                var afterScrollTop = $elem.scrollTop(),
                    delta = afterScrollTop - beforeScrollTop;
                if (delta === 0) {
                    return false;
                }
                fn( delta > 0 ? 'down' : 'up', afterScrollTop );
                beforeScrollTop = afterScrollTop;
            });
        });
    };
}(window.Zepto);

/**
 * $.fn.tab
 * require zepto.js
 */
!function($){
    'use strict';
    function Tab(element){
        this.element = $(element);
    }
    Tab.prototype = {
        show: function(tabItem){
            var $current = $(tabItem);
            var $ul = $(this.element);
            var selector = $current.attr('data-target');

            if( !selector ){
                selector = $current.attr('href');
            }

            if( $current.parent('li').hasClass('active') ){
                return;
            }

            var $previous = $ul.children('li.active').children('a');
            var hideEvent = $.Event('tab:hide', {
                relatedTarget: $current[0]
            });
            var showEvent = $.Event('tab:show', {
                relatedTarget: $previous[0]
            });

            $previous.trigger(hideEvent);
            $current.trigger(showEvent);

            var $target = $(selector);
            this.activate($current.closest('li'), $ul);
            this.activate($target, $target.parent(), function(){
                $previous.trigger({
                    type: 'tab:hidden',
                    relatedTarget: $current[0]
                });
                $current.trigger({
                    type: 'tab:shown',
                    telatedTarget: $previous[0]
                });
            });

        },
        activate: function(element, container, callback){
            var $active    = container.find('> .active');

            function next() {
                $active.removeClass('active');
                element.addClass('active');
                callback && callback();
            }

            next();
        }
    };

    function Plugin() {
        var options = arguments[0],
            args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this);
            var parentSelector = $this.attr('data-parent') || 'ul.tab';
            var $parent = $this.closest(parentSelector);
            var data  = $parent.data('ui.tab');

            if (!data) $parent.data('ui.tab', (data = new Tab($parent[0])));
            if (typeof options == 'string') data[options].apply(data, args);
        });
    }

    var old = $.fn.tab;

    $.fn.tab = Plugin;
    $.fn.tab.Constructor = Tab;

    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this;
    };

    // TAB DATA-API
    // ============

    var clickHandler = function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show', this);
    };

    $(document) .on('click.ui.tab.data-api', '[data-toggle="tab"]', clickHandler);
}(Zepto);

/**
 * $.fn.textarea
 * require zepto.js
 */
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


/**
 * 图片上传控件 image uploader
 * require zepto.js
 *
 var uploader = new lupload.Uploader({
     trigger: ".upload",
     url: "index.php?route=tool/upload/image",
     filters: [{extensions: "png,jpg"}],
     multipart_params: {contentType: "text/html"}
 });

 uploader
     .on(lupload.EVENT_ERROR, function (uploader, msg) {
        console.log("ERROR", msg);
     })
     .on(lupload.EVENT_FILE_UPLOAD_COMPLETE, function (me, file, res) {
        console.log("complete", file, res)
     })
     .init();
 */
+(function (window, undefined) {
    var seed = 0;
    var i18n = {};
    var lupload = {
        //state
        STATE_STOPPED: 1,
        STATE_STARTED: 2,
        STATE_QUEUED: 1,
        STATE_UPLOADING: 2,
        STATE_FAILED: 4,
        STATE_DONE: 5,

        //error code
        ERROR_GENERIC: -100,
        ERROR_HTTP: -200,
        ERROR_IO: -300,
        ERROR_SECURITY: -400,
        ERROR_INIT: -500,
        ERROR_FILE_SIZE: -600,
        ERROR_FILE_EXTENSION: -601,
        ERROR_FILE_COUNT: -602,
        ERROR_IMAGE_FORMAT: -700,
        ERROR_IMAGE_MEMORY: -701,
        ERROR_IMAGE_DIMENSIONS: -702,

        //events
        EVENT_INIT: "init",
        EVENT_INIT_AFTER: "init-after",
        EVENT_FILES_ADD: "files-add",
        EVENT_FILES_REMOVE: "files-remove",
        EVENT_FILES_UPLOAD_COMPLETE: "files-upload-complete",
        EVENT_FILE_UPLOAD_BEFORE: "file-upload-before",
        EVENT_FILE_UPLOAD_START: "file-upload-start",
        EVENT_FILE_UPLOAD_PROGRESS: "file-upload-progress",
        EVENT_FILE_UPLOAD_COMPLETE: "file-upload-complete",
        EVENT_FILE_UPLOAD_CANCEL: "file-upload-cancel",
        EVENT_FILE_UPLOAD_CHUNK: "file-chunk-uploaded",
        EVENT_QUEUE_CHANGE: "queue-change",
        EVENT_START: "start",
        EVENT_STOP: "stop",
        EVENT_REFRESH: "refresh",
        EVENT_BROWSE_DISABLE: "browse-disable",
        EVENT_DISPOSE: "dispose",
        EVENT_ERROR: "error",

        runtimes: [],               //可用的运行时
        guidPrefix: "p",
        guid: function () {
            var s = (new Date).getTime().toString(32);
            for (var i = 0; 5 > i; i++) {
                s += Math.floor(65535 * Math.random()).toString(32)
            }
            return lupload.guidPrefix + s + (seed++).toString(32)
        },
        addRuntime: function (name, properties) {
            properties.name = name;
            lupload.runtimes[name] = properties;
            lupload.runtimes.push(properties);
            return properties
        },
        ua: (function () {
            var d, e, f, a = navigator, b = a.userAgent, c = a.vendor;
            d = /WebKit/.test(b);
            f = d && -1 !== c.indexOf("Apple");
            e = window.opera && window.opera.buildNumber;
            return {
                windows: -1 !== navigator.platform.indexOf("Win"),
                ie: !d && !e && /MSIE/gi.test(b) && /Explorer/gi.test(a.appName),
                webkit: d,
                gecko: !d && /Gecko/.test(b),
                safari: f,
                opera: !!e
            }
        })(),
        mimeTypes: (function (str) {
            var d = {},
                b = str.split(/,/),
                i, j, f;
            for (i = 0; i < b.length; i += 2) {
                f = b[i + 1].split(/ /);
                for (j = 0; j < f.length; j++) {
                    d[f[j]] = b[i];
                }
            }
            return d;
        })("application/msword,doc dot,application/pdf,pdf,application/pgp-signature,pgp,application/postscript,ps ai eps,application/rtf,rtf,application/vnd.ms-excel,xls xlb,application/vnd.ms-powerpoint,ppt pps pot,application/zip,zip,application/x-shockwave-flash,swf swfl,application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx,application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx,application/vnd.openxmlformats-officedocument.presentationml.template,potx,application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx,application/x-javascript,js,application/json,json,audio/mpeg,mpga mpega mp2 mp3,audio/x-wav,wav,audio/mp4,m4a,image/bmp,bmp,image/gif,gif,image/jpeg,jpeg jpg jpe,image/photoshop,psd,image/png,png,image/svg+xml,svg svgz,image/tiff,tiff tif,text/plain,asc txt text diff log,text/html,htm html xhtml,text/css,css,text/csv,csv,text/rtf,rtf,video/mpeg,mpeg mpg mpe,video/quicktime,qt mov,video/mp4,mp4,video/x-m4v,m4v,video/x-flv,flv,video/x-ms-wmv,wmv,video/avi,avi,video/webm,webm,video/vnd.rn-realvideo,rv,application/vnd.oasis.opendocument.formula-template,otf,application/octet-stream,exe"),
        buildUrl: function (url, params) {
            var qs = "";
            $.each(params, function (name, value) {
                qs += (qs ? "&" : "") + encodeURIComponent(name) + "=" + encodeURIComponent(value);
            });
            qs && (url += (url.indexOf("?") > 0 ? "&" : "?") + qs);
            return url;
        },
        addI18n: function (o) {
            return $.extend(i18n, o);
        },
        translate: function (code) {
            return i18n[code] || code;
        }
    };

    /**
     * @param {Object} options
     */
    var Uploader = function (options) {
        this._map = {};
        this.options = $.extend({
            trigger: null,
            dropElement: "",
            className: "",
            url: '/',               //文件上传URL
            file_data_name: "file", //文件参数名
            multipart_params: {},   //上传时额外post的参数信息
            headers: [],
            multi_selection: true,  //是否支持多文件选择
            multipart: true,
            filters: [],            //[{extensions: "png,jpg"}]
            unique_names: "",
            chunk_size: 0,
            max_file_size: 4000000, //最大文件大小
            max_file_count: 0,
            required_features: '',  //依赖功能，依赖多个功能时用英文逗号分隔
            runtimes: '',           //指定运行时，多个运行时用英文逗号分隔，如"html5,html4"
            init: false             //初始化回调 {false|Function|FunctionArray}
        }, options);

        this.progress = new QueueProgress();
        this.files = [];

        this.id = lupload.guid();
        this.state = lupload.STATE_STOPPED;
        this.runtime = "";
        this.features = {};
        this.timestamp = 0;
        this.disabled = false;
    };
    Uploader.prototype = {
        init: function () {
            var me = this,
                options = this.options;

            //文件已添加
            this.on(lupload.EVENT_FILES_ADD, function (me, files) {
                var filters = options.filters,
                    validFileCount = 0,
                    file, filterReg;

                if (filters && filters.length) {
                    filterReg = [];
                    $.each(filters, function (i, filter) {
                        $.each(filter.extensions.split(/,/), function (i, ext) {
                            filterReg.push(/^\s*\*\s*$/.test(ext) ? "\\.*" : "\\." + ext.replace(new RegExp("[" + "/^$.*+?|()[]{}\\".replace(/./g, "\\$&") + "]", "g"), "\\$&"));
                        });
                    });
                    filterReg = new RegExp(filterReg.join("|") + "$", "i");
                }
                for (var i = 0; i < files.length; i++) {
                    file = files[i];
                    file.loaded = 0;
                    file.percent = 0;
                    file.status = lupload.STATE_QUEUED;

                    if (!filterReg || filterReg.test(file.name)) {
                        if (file.size !== undefined && file.size > options.max_file_size) {
                            me.trigger(lupload.EVENT_ERROR, {
                                code: lupload.ERROR_FILE_SIZE,
                                message: lupload.translate("File size error."),
                                file: file
                            });
                        } else if (options.max_file_count && me.files.length >= options.max_file_count) {
                            me.trigger(lupload.EVENT_ERROR, {
                                code: lupload.ERROR_FILE_COUNT,
                                message: lupload.translate("File count error."),
                                file: file
                            });
                            break;
                        } else {
                            me.files.push(file);
                            validFileCount++;
                        }
                    } else {
                        me.trigger(lupload.EVENT_ERROR, {
                            code: lupload.ERROR_FILE_EXTENSION,
                            message: lupload.translate("File extension error."),
                            file: file
                        });
                    }
                }

                if (validFileCount) {
                    setTimeout(function () {
                        me.trigger(lupload.EVENT_QUEUE_CHANGE);
                        me.refresh();
                    }, 1);
                }
            });

            if (options.unique_names) {
                me.on(lupload.EVENT_FILE_UPLOAD_START, function (me, file) {
                    var reg = file.name.match(/\.([^.]+)$/), //后缀名
                        ext = "tmp";
                    reg && (ext = reg[1]);
                    file.target_name = file.id + "." + ext;
                });
            }

            me.on(lupload.EVENT_FILE_UPLOAD_PROGRESS, function (me, file) {
                file.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;
                me._updateProgress();
            });

            me.on(lupload.EVENT_QUEUE_CHANGE, function (me) {
                me._updateProgress();
                me.start();
            });

            me.on(lupload.EVENT_ERROR, function (me, error) {
                if (error.file) {
                    error.file.status = lupload.STATE_FAILED;
                    me._updateProgress();
                    if (me.state == lupload.STATE_STARTED) {
                        setTimeout(function () {
                            me._queueUpload.call(me);
                        }, 1);
                    }
                }
            });

            me.on(lupload.EVENT_FILE_UPLOAD_COMPLETE, function (me, file) {
                file.status = lupload.STATE_DONE;
                file.loaded = file.size;
                me.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, file);
                setTimeout(function () {
                    me._queueUpload();
                }, 1);
            });

            var runtimes = [],
                runtimeIndex = 0;
            if (options.runtimes) {
                var requiredRuntimes = options.runtimes.split(/\s?,\s?/);
                for (var i = 0, len = requiredRuntimes.length; i < len; i++) {
                    lupload.runtimes[requiredRuntimes[i]] && runtimes.push(lupload.runtimes[requiredRuntimes[i]]);
                }
            } else {
                runtimes = lupload.runtimes;
            }

            //设置可用的运行时
            function setRuntime() {
                var runtime = runtimes[runtimeIndex++],
                    features, requiredFeatures;

                if (runtime) {
                    features = runtime.getFeatures();
                    requiredFeatures = options.required_features;
                    if (requiredFeatures) {
                        requiredFeatures = requiredFeatures.split(",");
                        for (var i = 0, len = requiredFeatures.length; i < len; i++) {
                            if (!features[requiredFeatures[i]]) {
                                setRuntime();
                                return;
                            }
                        }
                    }
                    runtime.init(me, function (d) {
                        if (d && d.success) {
                            me.features = features;
                            me.runtime = runtime.name;
                            me.trigger(lupload.EVENT_INIT, {runtime: runtime.name});
                            me.trigger(lupload.EVENT_INIT_AFTER);
                            me.refresh();
                        } else {
                            setRuntime();
                        }
                    });
                } else {
                    //没有可用的运行时
                    me.trigger(lupload.EVENT_ERROR, {code: lupload.ERROR_INIT, message: lupload.translate("Init error.")});
                }
            }

            setRuntime();

            if (options.init) {
                typeof options.init == "function" ? options.init(me) : $.each(options.init, function (event, handler) {
                    me.on(event, handler);
                });
            }
        },
        /**
         * 触发事件
         * @param {String} event
         * @returns {boolean}
         */
        trigger: function (event) {
            var args = Array.prototype.slice.call(arguments, 0),
                msg;

            args[0] = this;
            var handlers, handler;
            if (handlers = this._map[event]) {
                var onceEvent = [],
                    i = 0,
                    len = handlers.length;
                for (; i < len; i++) {
                    handler = handlers[i];
                    msg = handler.func.apply(handler.scope, args);
                    handler.once && onceEvent.push(handler.func);
                }
                if (onceEvent.length) {
                    for (i = 0, len = onceEvent.length; i < len; i++) {
                        this.off(event, onceEvent[i]);
                    }
                }
            }
            return msg !== false;
        },

        /**
         * 绑定事件
         * @param {String} event
         * @param {Function} func
         * @param {Object} scope
         * @param {Boolean} once
         */
        on: function (event, func, scope, once) {
            if (typeof (func) !== "function") {
                return this;
            }
            var handlers;
            if (!(handlers = this._map[event])) {
                this._map[event] = handlers = [];
            }
            handlers.push({func: func, scope: scope || this, once: !!once});
            return this;
        },

        /**
         * 绑定事件，触发一次后解除绑定
         * @param {String} event
         * @param {Function} func
         * @param {Object} scope
         */
        once: function (event, func, scope) {
            if (typeof (func) !== "function") {
                return this;
            }
            return this.on(event, func, scope, true);
        },

        /**
         * 解除绑定
         * @param {String} event event name
         * @param {Function} func Subscriber to be remove. If not set, clear all in event
         */
        off: function (event, func) {
            var i = -1, handlers;
            //未传入事件名，则清空所有绑定的事件
            if (!event) {
                this._map = {};

            } else if (func) { //删除指定handler
                handlers = this._map[event];
                for (var j = 0, len = handlers.length; j < len; j++) {
                    if (handlers[j].func === func) {
                        i = j;
                    }
                }

                if (i >= 0) {
                    handlers.splice(i, 1);
                }

            } else { //删除指定事件的所有handler
                this._map[event] = [];
            }
            return this;
        },

        //按队列先后顺序上传图片
        _queueUpload: function () {
            var file, uploadedFileCount = 0;
            if (this.state == lupload.STATE_STARTED) {
                for (var i = 0, len = this.files.length; i < len; i++) {
                    if (file || this.files[i].status != lupload.STATE_QUEUED) {
                        uploadedFileCount++;
                    } else {
                        file = this.files[i];
                        file.status = lupload.STATE_UPLOADING;

                        if (this.trigger(lupload.EVENT_FILE_UPLOAD_BEFORE, file)) {
                            this.trigger(lupload.EVENT_FILE_UPLOAD_START, file);
                        }
                    }
                }

                if (uploadedFileCount == this.files.length) {
                    this.stop();
                    this.trigger(lupload.EVENT_FILES_UPLOAD_COMPLETE, this.files);
                }
            }
        },

        //更新进程统计
        _updateProgress: function () {
            var file;
            this.progress.reset();
            for (var i = 0, len = this.files.length; i < len; i++) {
                file = this.files[i];
                if (file.size !== undefined) {
                    this.progress.size += file.size;
                    this.progress.loaded += file.loaded;
                } else {
                    this.progress.size = undefined;
                }
                if (file.status == lupload.STATE_DONE) {
                    this.progress.uploaded++;
                } else if (file.status == lupload.STATE_FAILED) {
                    this.progress.failed++;
                } else {
                    this.progress.queued++;
                }
            }
            if (this.progress.size === undefined) {
                this.progress.percent = this.files.length > 0 ? Math.ceil(this.progress.uploaded / this.files.length * 100) : 0;
            } else {
                this.progress.bytesPerSec = Math.ceil(this.progress.loaded / ((+new Date - this.timestamp || 1) / 1e3));
                this.progress.percent = this.progress.size > 0 ? Math.ceil(this.progress.loaded / this.progress.size * 100) : 0;
            }
        },

        /**
         * 刷新UI
         */
        refresh: function () {
            this.trigger(lupload.EVENT_REFRESH);
        },

        /**
         * 开启上传
         */
        start: function () {
            if (this.files.length && this.state != lupload.STATE_STARTED) {
                this.state = lupload.STATE_STARTED;
                this.timestamp = +new Date;
                this.trigger(lupload.EVENT_START);
                this._queueUpload();
            }
        },

        /**
         * 关闭上传
         */
        stop: function () {
            if (this.state != lupload.STATE_STOPPED) {
                this.state = lupload.STATE_STOPPED;
                for (var i = this.files.length - 1; i >= 0; i--) {
                    if (this.files[i].status == lupload.STATE_UPLOADING) {
                        this.files[i].status = lupload.STATE_QUEUED;
                        this._updateProgress();
                    }
                }
                this.trigger(lupload.EVENT_FILE_UPLOAD_CANCEL);
                this.trigger(lupload.EVENT_STOP);
            }
        },
        disableBrowse: function () {
            this.disabled = arguments[0] !== undefined ? arguments[0] : true;
            this.trigger(lupload.EVENT_BROWSE_DISABLE, this.disabled);
        },

        /**
         * 获取文件
         * @param id {String} 文件id
         * @returns {File}
         */
        getFile: function (id) {
            var i = this.files.length - 1, file;
            while (file = this.files[i--]) {
                if (file.id === id) {
                    return file;
                }
            }
        },

        /**
         * 删除文件
         * @param id {String}
         */
        removeFile: function (id) {
            for (var i = this.files.length - 1; i >= 0; i--) {
                if (this.files[i].id === id) {
                    return this.splice(i, 1)[0];
                }
            }
        },

        /**
         * 删除指定位置的文件
         * @param index
         * @param len
         * @returns {Array.<T>}
         */
        splice: function (index, len) {
            var files = this.files.splice(index === undefined ? 0 : index, len === undefined ? this.files.length : len);
            this.trigger(lupload.EVENT_FILES_REMOVE, files);
            this.trigger(lupload.EVENT_QUEUE_CHANGE);
            return files;
        },
        dispose: function () {
            this.stop();
            this.trigger(lupload.EVENT_DISPOSE);
            this.off();
            this.supr();
        }
    };


    var File = function (id, name, size) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.loaded = 0;
        this.percent = 0;
        this.status = 0;
    };


    var Runtime = {
        getFeatures: function () {
        },
        init: function () {
        }
    };

    var QueueProgress = function(){
        var me = this;
        me.size = 0;
        me.loaded = 0;
        me.uploaded = 0;
        me.failed = 0;
        me.queued = 0;
        me.percent = 0;
        me.bytesPerSec = 0;
        me.reset = function () {
            me.size = me.loaded = me.uploaded = me.failed = me.queued = me.percent = me.bytesPerSec = 0;
        };
    };

    lupload.File = File;
    lupload.Uploader = Uploader;
    lupload.Runtime = Runtime;

    window.lupload = lupload;


})(window);

//HTML5 Runtime
+(function (window, document, lupload, d) {
    var f, fileCache = {};

    function readImage(file, callback) {
        var reader;

        if ("FileReader" in window) {
            reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                callback(reader.result);
            };
            return undefined;
        } else {
            return callback(file.getAsDataURL());
        }
    }

    function readBinary(file, callback) {
        var reader;
        if ("FileReader" in window) {
            reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function () {
                callback(reader.result);
            };
            return undefined;
        } else {
            return callback(file.getAsBinary());
        }
    }

    function resizeImage(file, resize, mimeType, callback) {
        var canvas, context, img, scale, uploader = this;
        readImage(fileCache[file.id], function (dataUrl) {
            canvas = document.createElement("canvas");
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            context = canvas.getContext("2d");
            img = new Image();
            img.onerror = img.onabort = function () {
                callback({success: !1});
            };
            img.onload = function () {
                var width, height, p, q;
                resize.width || (resize.width = img.width);
                resize.height || (resize.height = img.height);
                scale = Math.min(resize.width / img.width, resize.height / img.height);

                if (1 > scale || 1 === scale && "image/jpeg" === mimeType) {
                    width = Math.round(img.width * scale);
                    height = Math.round(img.height * scale);
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(img, 0, 0, width, height);
                    if ("image/jpeg" === mimeType) {
                        p = new l(atob(dataUrl.substring(dataUrl.indexOf("base64,") + 7)));
                        if (p.headers && p.headers.length) {
                            q = new m;
                            if (q.init(p.get("exif")[0])) {
                                q.setExif("PixelXDimension", width);
                                q.setExif("PixelYDimension", height);
                                p.set("exif", q.getBinary());
                                //uploader.hasEventListener("ExifData") && uploader.trigger("ExifData", file, q.EXIF());
                                //uploader.hasEventListener("GpsData") && uploader.trigger("GpsData", file, q.GPS());
                            }
                        }
                        if (resize.quality) {
                            try {
                                dataUrl = canvas.toDataURL(mimeType, resize.quality / 100);
                            } catch (r) {
                                dataUrl = canvas.toDataURL(mimeType);
                            }
                        }
                    } else {
                        dataUrl = canvas.toDataURL(mimeType);
                    }
                    dataUrl = dataUrl.substring(dataUrl.indexOf("base64,") + 7);
                    dataUrl = atob(dataUrl);
                    if (p && p.headers && p.headers.length) {
                        dataUrl = p.restore(dataUrl);
                        p.purge();
                    }
                    canvas.parentNode.removeChild(canvas);
                    callback({
                        success: true,
                        data: dataUrl
                    });
                } else {
                    callback({success: false});
                }
            };
            img.src = dataUrl;
        });
    }

    lupload.runtimes.Html5 = lupload.addRuntime("html5", {
        getFeatures: function () {
            var xhr,
                enableHTML5,
                enableProgress,
                enableSendBinary,
                enableImgResize,
                enableChunk;

            enableHTML5 = enableProgress = enableImgResize = enableChunk = false;

            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
                enableProgress = !!xhr.upload;
                enableHTML5 = !(!xhr.sendAsBinary && !xhr.upload);
            }
            if (enableHTML5) {
                enableSendBinary = !!(xhr.sendAsBinary || window.Uint8Array && window.ArrayBuffer);
                enableImgResize = !(!File || !File.prototype.getAsDataURL && !window.FileReader || !enableSendBinary);
                enableChunk = !(!File || !(File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice));
            }
            f = lupload.ua.safari && lupload.ua.windows;
            return {
                html5: enableHTML5,
                dragdrop: function () {
                    var elem = document.createElement("div");
                    return "draggable"in elem || "ondragstart"in elem && "ondrop"in elem;
                }(),
                jpgresize: enableImgResize,
                pngresize: enableImgResize,
                multipart: enableImgResize || !!window.FileReader || !!window.FormData,
                canSendBinary: enableSendBinary,
                cantSendBlobInFormData: !(!(lupload.ua.gecko && window.FormData && window.FileReader) || FileReader.prototype.readAsArrayBuffer),
                progress: enableProgress,
                chunks: enableChunk,
                multi_selection: !(lupload.ua.safari && lupload.ua.windows),
                triggerDialog: lupload.ua.gecko && window.FormData || lupload.ua.webkit
            };
        },
        init: function (uploader, callback) {
            var features, xhr;

            function eName(event) {
                return event + "." + uploader.id;
            }

            function l(fileList) {
                var oFile, id, files = [], exist = {};
                for (var i = 0, len = fileList.length; i < len; i++) {
                    oFile = fileList[i];
                    if (!exist[oFile.name]) {
                        exist[oFile.name] = true;
                        id = lupload.guid();
                        fileCache[id] = oFile;
                        files.push(new lupload.File(id, oFile.fileName || oFile.name, oFile.fileSize || oFile.size));
                    }
                }
                files.length && uploader.trigger(lupload.EVENT_FILES_ADD, files);
            }

            features = this.getFeatures();

            if (features.html5) {
                uploader.on(lupload.EVENT_INIT, function (uploader) {
                    var $component, $trigger, h, i, k, mimeType, $input,
                        accept = [],
                        options = uploader.options,
                        filters = uploader.options.filters,
                        $container = $(document.body);

                    $component = $('<div id="' + uploader.id + "_html5_container" + '" />');
                    if (options.className) {
                        $component.addClass(options.className);
                    }
                    $component.css({
                        position: "absolute",
                        background: "transparent",
                        overflow: "hidden",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0
                    });
                    $component.addClass("lupload html5");
                    if (options.container) {
                        $container = $(options.container);
                        if ("static" === $container.css("position")) {
                            $container.css("position", "relative");
                        }
                    }
                    $container.append($component);

                    a:for (h = 0; h < filters.length; h++) {
                        k = filters[h].extensions.split(/,/);
                        for (i = 0; i < k.length; i++) {
                            if ("*" === k[i]) {
                                accept = [];
                                break a;
                            }
                            mimeType = lupload.mimeTypes[k[i]];
                            mimeType && -1 === $.inArray(mimeType, accept) && accept.push(mimeType);
                        }
                    }

                    $input = $('<input id="' + uploader.id + '_html5"  style="font-size:999px" type="file" accept="' + accept.join(",") + '" ' + (uploader.options.multi_selection && uploader.features.multi_selection ? 'multiple="multiple"' : "") + " />")
                        .appendTo($component.scrollTop(100));
                    if (uploader.features.triggerDialog) {
                        $input.css({
                            position: "absolute",
                            left: 0,
                            width: "100%",
                            height: "100%"
                        });
                    } else {
                        $input.css("float", "right");
                    }
                    $input.on("change", function () {
                        l(this.files);
                        $(this).val("");
                    });
                    $trigger = $(options.trigger);
                    if ($trigger.size()) {
                        if (uploader.features.triggerDialog) {
                            $trigger.on(eName("click"), function (e) {
                                var $input = $("#" + uploader.id + "_html5");
                                if ($input.size() && !$input.is(":disabled")) {
                                    $input.trigger("click");
                                }
                                e.preventDefault();
                            });
                        }
                    }
                });

                uploader.on(lupload.EVENT_INIT_AFTER, function () {
                    var $dropArea = $(uploader.options.dropElement);
                    if ($dropArea.size()) {
                        if (f) {
                            $dropArea.on(eName("dragenter"), function () {
                                var $dropInput;
                                $dropInput = $("#" + uploader.id + "_drop");
                                if (!$dropInput.size()) {
                                    $dropInput = $('<input type="file" id="' + uploader.id + '_drop' + '" '+(uploader.options.multi_selection && uploader.features.multi_selection ? 'multiple="multiple"' : "")+' />');
                                    $dropInput.on(eName("change"), function () {
                                        l(this.files);
                                        $dropInput.off(eName("change"));
                                        $dropInput.remove();
                                    });
                                    $dropArea.append($dropInput);
                                }

                                if ("static" === $dropArea.css("position")) {
                                    $dropArea.css({position: "relative"});
                                }
                                $dropInput.css({
                                    position: "absolute",
                                    display: "block",
                                    top: 0,
                                    left: 0,
                                    width: ($dropArea[0].offsetWidth || $dropArea[0].clientWidth) + "px",
                                    height: ($dropArea[0].offsetHeight || $dropArea[0].clientHeight) + "px",
                                    opacity: 0
                                });
                            });
                            return;
                        }
                        $dropArea.on(eName("dragover"), function (e) {
                            e.preventDefault();
                        });
                        $dropArea.on(eName("drop"), function (e) {
                            var dataTransfer = e.originalEvent['dataTransfer'];
                            dataTransfer && dataTransfer.files && l(dataTransfer.files);
                            e.preventDefault();
                        });
                    }
                });

                uploader.on(lupload.EVENT_REFRESH, function (a) {
                });

                uploader.on(lupload.EVENT_BROWSE_DISABLE, function (uploader, disabled) {
                    var $input = $("#" + uploader.id + "_html5");
                    $input.size() && ($input.prop("disabled", disabled));
                });

                uploader.on(lupload.EVENT_FILE_UPLOAD_CANCEL, function () {
                    xhr && xhr.abort && xhr.abort();
                });

                uploader.on(lupload.EVENT_FILE_UPLOAD_START, function (uploader, file) {
                    var options = uploader.options;

                    function slice(a, b, c) {
                        var slice;
                        if (!File.prototype.slice) {
                            if ((slice = File.prototype.webkitSlice || File.prototype.mozSlice)) {
                                return slice.call(a, b, c);
                            } else {
                                return null;
                            }
                        }
                        try {
                            a.slice();
                            return a.slice(b, c);
                        } catch (e) {
                            return a.slice(b, c - b);
                        }
                    }

                    function n(e) {
                        var chunk = 0,
                            h = 0,
                            reader = "FileReader" in window ? new FileReader : null;

                        function l() {
                            var n, p, params, r, s, t,
                                url = uploader.options.url;

                            function send(e) {
                                var formData,
                                    f = 0,
                                    j = "----luploadboundary" + lupload.guid(),
                                    o = "--",
                                    v = "\r\n",
                                    w = "";

                                xhr = new XMLHttpRequest;
                                xhr.upload && (xhr.upload.onprogress = function (e) {
                                    file.loaded = Math.min(file.size, h + e.loaded - f);
                                    uploader.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, file);
                                });
                                xhr.onreadystatechange = function () {
                                    var status, result;
                                    if (4 == xhr.readyState && uploader.state !== lupload.STATE_STOPPED) {
                                        try {
                                            status = xhr.status
                                        } catch (e) {
                                            status = 0
                                        }
                                        if (status >= 400) {
                                            uploader.trigger(lupload.EVENT_ERROR, {
                                                code: lupload.ERROR_HTTP,
                                                message: lupload.translate("HTTP Error."),
                                                file: file,
                                                status: status
                                            });
                                        } else {
                                            if (p) {
                                                result = {
                                                    chunk: chunk,
                                                    chunks: p,
                                                    response: xhr.responseText,
                                                    status: status,
                                                    canceled: false
                                                };
                                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_CHUNK, file, result);
                                                h += s;
                                                if (result.canceled) {
                                                    file.status = lupload.STATE_FAILED;
                                                    return;
                                                }
                                                file.loaded = Math.min(file.size, (chunk + 1) * r)
                                            } else {
                                                file.loaded = file.size;
                                            }
                                            uploader.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, file);
                                            e = n = formData = w = null;
                                            if (!p || ++chunk >= p) {
                                                file.status = lupload.STATE_DONE;
                                                var res = xhr.responseText;
                                                try {
                                                    res = $.parseJSON(res);
                                                } catch (e) {
                                                }
                                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_COMPLETE, file, res)
                                            } else {
                                                l()
                                            }
                                        }
                                    }
                                };
                                if (uploader.options.multipart && features.multipart) {
                                    params.name = file.target_name || file.name;
                                    xhr.open("post", url, true);
                                    $.each(uploader.options.headers, function (a, b) {
                                        xhr.setRequestHeader(a, b)
                                    });
                                    if ("string" != typeof e && window.FormData) {
                                        formData = new FormData;
                                        $.each($.extend(params, uploader.options.multipart_params), function (name, value) {
                                            formData.append(name, value)
                                        });
                                        formData.append(uploader.options.file_data_name, e);
                                        xhr.send(formData);
                                        return
                                    }
                                    if ("string" == typeof e) {
                                        xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + j);
                                        $.each($.extend(params, uploader.options.multipart_params), function (a, b) {
                                            w += o + j + v + 'Content-Disposition: form-data; name="' + a + '"' + v + v;
                                            w += unescape(encodeURIComponent(b)) + v
                                        });
                                        t = lupload.mimeTypes[file.name.replace(/^.+\.([^.]+)/, "$1").toLowerCase()] || "application/octet-stream";
                                        w += o + j + v + 'Content-Disposition: form-data; name="' + uploader.options.file_data_name + '"; filename="' + unescape(encodeURIComponent(file.name)) + '"' + v + "Content-Type: " + t + v + v + e + v + o + j + o + v;
                                        f = w.length - e.length;
                                        e = w;
                                        if (xhr['sendAsBinary']) {
                                            xhr['sendAsBinary'](e);
                                        } else if (features.canSendBinary) {
                                            for (var x = new Uint8Array(e.length), y = 0; y < e.length; y++) {
                                                x[y] = 255 & e.charCodeAt(y);
                                            }
                                            xhr.send(x.buffer)
                                        }
                                        return
                                    }
                                }
                                url = lupload.buildUrl(uploader.options.url, $.extend(params, uploader.options.multipart_params));
                                xhr.open("post", url, true);
                                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                                $.each(uploader.options.headers, function (name, value) {
                                    xhr.setRequestHeader(name, value)
                                });
                                xhr.send(e)
                            }

                            if (file.status != lupload.STATE_DONE && file.status != lupload.STATE_FAILED && uploader.state != lupload.STATE_STOPPED) {
                                params = {name: file.target_name || file.name};
                                if (options.chunk_size && file.size > options.chunk_size && (features.chunks || "string" == typeof e)) {
                                    r = options.chunk_size;
                                    p = Math.ceil(file.size / r);
                                    s = Math.min(r, file.size - chunk * r);
                                    n = "string" == typeof e ? e.substring(chunk * r, chunk * r + s) : slice(e, chunk * r, chunk * r + s);
                                    params.chunk = chunk;
                                    params.chunks = p
                                } else {
                                    s = file.size;
                                    n = e
                                }

                                if (uploader.options.multipart && features.multipart && "string" != typeof n && reader && features.cantSendBlobInFormData && features.chunks && uploader.options.chunk_size) {
                                    reader.onload = function () {
                                        send(reader.result)
                                    };
                                    reader.readAsBinaryString(n)
                                }
                                else {
                                    send(n)
                                }
                            }
                        }

                        l()
                    }

                    var oFile = fileCache[file.id];
                    if (features.jpgresize && uploader.options.resize && /\.(png|jpg|jpeg)$/i.test(file.name)) {
                        resizeImage.call(uploader, file, uploader.options.resize, /\.png$/i.test(file.name) ? "image/png" : "image/jpeg", function (res) {
                            if (res.success) {
                                file.size = res.data.length;
                                n(res.data)
                            } else if (features.chunks) {
                                n(oFile)
                            } else {
                                readBinary(oFile, n)
                            }
                        })
                    } else if (!features.chunks && features.jpgresize) {
                        readBinary(oFile, n)
                    } else {
                        n(oFile)
                    }
                });

                uploader.on(lupload.EVENT_DISPOSE, function (uploader) {
                    var elem = {
                            inputContainer: "#" + uploader.id + "_html5_container",
                            inputFile: "#" + uploader.id + "_html5",
                            browseButton: uploader.options.trigger,
                            dropElm: uploader.options.dropElement
                        },
                        d, $elem;
                    for (d in elem) {
                        $elem = $(elem[d]);
                        $elem.size() && $elem.off("." + uploader.id);
                    }
                    $(document.body).off("." + uploader.id);
                    $(elem.inputContainer).remove();
                });
                callback({success: true})
            } else {
                callback({success: false})
            }
        }
    });
    function k() {
        var b, a = false;

        function c(c, d) {
            var g, e = a ? 0 : -8 * (d - 1), f = 0;
            for (g = 0; d > g; g++)f |= b.charCodeAt(c + g) << Math.abs(e + 8 * g);
            return f
        }

        function e(a, c, d) {
            var d = 3 === arguments.length ? d : b.length - c - 1;
            b = b.substr(0, c) + a + b.substr(d + c)
        }

        function f(b, c, d) {
            var h, f = "", g = a ? 0 : -8 * (d - 1);
            for (h = 0; d > h; h++)f += String.fromCharCode(c >> Math.abs(g + 8 * h) & 255);
            e(f, b, d)
        }

        return {
            II: function (b) {
                if (b === d) {
                    return a;
                } else {
                    a = b
                }
            },
            init: function (c) {
                a = !1;
                b = c
            },
            SEGMENT: function (a, c, d) {
                switch (arguments.length) {
                    case 1:
                        return b.substr(a, b.length - a - 1);
                    case 2:
                        return b.substr(a, c);
                    case 3:
                        e(d, a, c);
                        break;
                    default:
                        return b
                }
            },
            BYTE: function (a) {
                return c(a, 1)
            },
            SHORT: function (a) {
                return c(a, 2)
            },
            LONG: function (a, b) {
                return b === d ? c(a, 4) : void f(a, b, 4)
            },
            SLONG: function (a) {
                var b = c(a, 4);
                return b > 2147483647 ? b - 4294967296 : b
            },
            STRING: function (a, b) {
                var d = "";
                for (b += a; b > a; a++)d += String.fromCharCode(c(a, 1));
                return d
            }
        }
    }

    function l(a) {
        var e, f, i, b = {
            65505: {app: "EXIF", name: "APP1", signature: "Exif\x00"},
            65506: {app: "ICC", name: "APP2", signature: "ICC_PROFILE\x00"},
            65517: {app: "IPTC", name: "APP13", signature: "Photoshop 3.0\x00"}
        }, c = [], g = d, h = 0;

        e = new k;
        e.init(a);
        if (65496 === e.SHORT(0)) {
            for (f = 2, i = Math.min(1048576, a.length); i >= f;) {
                g = e.SHORT(f);
                if (g >= 65488 && 65495 >= g) {
                    f += 2;
                } else {
                    if (65498 === g || 65497 === g) {
                        break;
                    }
                    h = e.SHORT(f + 2) + 2;
                    if (b[g] && e.STRING(f + 4, b[g].signature.length) === b[g].signature) {
                        c.push({
                            hex: g,
                            app: b[g].app.toUpperCase(),
                            name: b[g].name.toUpperCase(),
                            start: f,
                            length: h,
                            segment: e.SEGMENT(f, h)
                        });
                    }
                    f += h
                }
            }
            e.init(null);
            return {
                headers: c,
                restore: function (a) {
                    e.init(a);
                    var b = new l(a);
                    if (!b.headers)return !1;
                    for (var d = b.headers.length; d > 0; d--) {
                        var g = b.headers[d - 1];
                        e.SEGMENT(g.start, g.length, "")
                    }
                    b.purge();
                    f = 65504 == e.SHORT(2) ? 4 + e.SHORT(4) : 2;
                    for (var d = 0, h = c.length; h > d; d++) {
                        e.SEGMENT(f, 0, c[d].segment);
                        f += c[d].length;
                    }
                    return e.SEGMENT()
                },
                get: function (a) {
                    for (var b = [], d = 0, e = c.length; e > d; d++)c[d].app === a.toUpperCase() && b.push(c[d].segment);
                    return b
                },
                set: function (a, b) {
                    var d = [];
                    "string" == typeof b ? d.push(b) : d = b;
                    var e = 0, ii = 0,
                        f = c.length;
                    for (; f > e && (c[e].app === a.toUpperCase() && (c[e].segment = d[ii], c[e].length = d[ii].length, ii++), !(ii >= d.length)); e++);
                },
                purge: function () {
                    c = [];
                    e.init(null)
                }
            }
        }
    }

    function m() {
        var a, b, f, e = {};
        a = new k;
        b = {
            tiff: {274: "Orientation", 34665: "ExifIFDPointer", 34853: "GPSInfoIFDPointer"},
            exif: {
                36864: "ExifVersion",
                40961: "ColorSpace",
                40962: "PixelXDimension",
                40963: "PixelYDimension",
                36867: "DateTimeOriginal",
                33434: "ExposureTime",
                33437: "FNumber",
                34855: "ISOSpeedRatings",
                37377: "ShutterSpeedValue",
                37378: "ApertureValue",
                37383: "MeteringMode",
                37384: "LightSource",
                37385: "Flash",
                41986: "ExposureMode",
                41987: "WhiteBalance",
                41990: "SceneCaptureType",
                41988: "DigitalZoomRatio",
                41992: "Contrast",
                41993: "Saturation",
                41994: "Sharpness"
            },
            gps: {
                0: "GPSVersionID",
                1: "GPSLatitudeRef",
                2: "GPSLatitude",
                3: "GPSLongitudeRef",
                4: "GPSLongitude"
            }
        };
        f = {
            ColorSpace: {1: "sRGB", 0: "Uncalibrated"},
            MeteringMode: {
                0: "Unknown",
                1: "Average",
                2: "CenterWeightedAverage",
                3: "Spot",
                4: "MultiSpot",
                5: "Pattern",
                6: "Partial",
                255: "Other"
            },
            LightSource: {
                1: "Daylight",
                2: "Fliorescent",
                3: "Tungsten",
                4: "Flash",
                9: "Fine weather",
                10: "Cloudy weather",
                11: "Shade",
                12: "Daylight fluorescent (D 5700 - 7100K)",
                13: "Day white fluorescent (N 4600 -5400K)",
                14: "Cool white fluorescent (W 3900 - 4500K)",
                15: "White fluorescent (WW 3200 - 3700K)",
                17: "Standard light A",
                18: "Standard light B",
                19: "Standard light C",
                20: "D55",
                21: "D65",
                22: "D75",
                23: "D50",
                24: "ISO studio tungsten",
                255: "Other"
            },
            Flash: {
                0: "Flash did not fire.",
                1: "Flash fired.",
                5: "Strobe return light not detected.",
                7: "Strobe return light detected.",
                9: "Flash fired, compulsory flash mode",
                13: "Flash fired, compulsory flash mode, return light not detected",
                15: "Flash fired, compulsory flash mode, return light detected",
                16: "Flash did not fire, compulsory flash mode",
                24: "Flash did not fire, auto mode",
                25: "Flash fired, auto mode",
                29: "Flash fired, auto mode, return light not detected",
                31: "Flash fired, auto mode, return light detected",
                32: "No flash function",
                65: "Flash fired, red-eye reduction mode",
                69: "Flash fired, red-eye reduction mode, return light not detected",
                71: "Flash fired, red-eye reduction mode, return light detected",
                73: "Flash fired, compulsory flash mode, red-eye reduction mode",
                77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
                79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
                89: "Flash fired, auto mode, red-eye reduction mode",
                93: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
                95: "Flash fired, auto mode, return light detected, red-eye reduction mode"
            },
            ExposureMode: {0: "Auto exposure", 1: "Manual exposure", 2: "Auto bracket"},
            WhiteBalance: {0: "Auto white balance", 1: "Manual white balance"},
            SceneCaptureType: {0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night scene"},
            Contrast: {0: "Normal", 1: "Soft", 2: "Hard"},
            Saturation: {0: "Normal", 1: "Low saturation", 2: "High saturation"},
            Sharpness: {0: "Normal", 1: "Soft", 2: "Hard"},
            GPSLatitudeRef: {N: "North latitude", S: "South latitude"},
            GPSLongitudeRef: {E: "East longitude", W: "West longitude"}
        };
        function g(b, c) {
            var h, i, j, k, l, m, n, o,
                g = a.SHORT(b), p = [], q = {};
            for (h = 0; g > h; h++) {
                n = m = b + 12 * h + 2;
                j = c[a.SHORT(n)];
                if (j !== d) {
                    k = a.SHORT(n += 2);
                    l = a.LONG(n += 2);
                    n += 4;
                    p = [];
                    switch (k) {
                        case 1:
                        case 7:
                            l > 4 && (n = a.LONG(n) + e.tiffHeader);
                            for (i = 0; l > i; i++) {
                                p[i] = a.BYTE(n + i);
                            }
                            break;
                        case 2:
                            l > 4 && (n = a.LONG(n) + e.tiffHeader);
                            q[j] = a.STRING(n, l - 1);
                            continue;
                        case 3:
                            l > 2 && (n = a.LONG(n) + e.tiffHeader);
                            for (i = 0; l > i; i++) {
                                p[i] = a.SHORT(n + 2 * i);
                            }
                            break;
                        case 4:
                            l > 1 && (n = a.LONG(n) + e.tiffHeader);
                            for (i = 0; l > i; i++) {
                                p[i] = a.LONG(n + 4 * i);
                            }
                            break;
                        case 5:
                            n = a.LONG(n) + e.tiffHeader;
                            for (i = 0; l > i; i++) {
                                p[i] = a.LONG(n + 4 * i) / a.LONG(n + 4 * i + 4);
                            }
                            break;
                        case 9:
                            n = a.LONG(n) + e.tiffHeader;
                            for (i = 0; l > i; i++) {
                                p[i] = a.SLONG(n + 4 * i);
                            }
                            break;
                        case 10:
                            n = a.LONG(n) + e.tiffHeader;
                            for (i = 0; l > i; i++) {
                                p[i] = a.SLONG(n + 4 * i) / a.SLONG(n + 4 * i + 4);
                            }
                            break;
                        default:
                            continue
                    }
                    o = 1 == l ? p[0] : p;
                    q[j] = f.hasOwnProperty(j) && "object" != typeof o ? f[j][o] : o
                }
            }
            return q
        }

        function h() {
            var c = d,
                f = e.tiffHeader;
            a.II(18761 == a.SHORT(f));

            if (42 !== a.SHORT(f += 2)) {
                return false
            } else {
                e.IFD0 = e.tiffHeader + a.LONG(f += 2);
                c = g(e.IFD0, b.tiff);
                e.exifIFD = "ExifIFDPointer" in c ? e.tiffHeader + c.ExifIFDPointer : d;
                e.gpsIFD = "GPSInfoIFDPointer" in c ? e.tiffHeader + c.GPSInfoIFDPointer : d;
                return true;
            }
        }

        function j(c, d, f) {
            var i, g, h, j, k = 0;
            if ("string" == typeof d) {
                var l = b[c.toLowerCase()];
                for (var hex in l)if (l[hex] === d) {
                    d = hex;
                    break
                }
            }
            for (g = e[c.toLowerCase() + "IFD"], h = a.SHORT(g), i = 0; h > i; i++)if (j = g + 12 * i + 2, a.SHORT(j) == d) {
                k = j + 8;
                break
            }
            if (k) {
                a.LONG(k, f);
                return true;
            } else {
                return false;
            }
        }

        return {
            init: function (b) {
                e = {tiffHeader: 10};
                if (b !== d && b.length) {
                    a.init(b);
                    if (65505 === a.SHORT(0) && "EXIF\x00" === a.STRING(4, 5).toUpperCase()) {
                        return h()
                    } else {
                        return false
                    }
                } else {
                    return false
                }
            },
            EXIF: function () {
                var a;
                a = g(e.exifIFD, b.exif);
                if (a.ExifVersion && "array" === c.typeOf(a.ExifVersion)) {
                    for (var d = 0, f = ""; d < a.ExifVersion.length; d++) {
                        f += String.fromCharCode(a.ExifVersion[d]);
                    }
                    a.ExifVersion = f
                }
                return a
            },
            GPS: function () {
                var a;
                a = g(e.gpsIFD, b.gps);
                if (a.GPSVersionID) {
                    a.GPSVersionID = a.GPSVersionID.join(".");
                }
                return a
            },
            setExif: function (a, b) {
                return "PixelXDimension" !== a && "PixelYDimension" !== a ? false : j("exif", a, b)
            },
            getBinary: function () {
                return a.SEGMENT()
            }
        }
    }
})(window, document, lupload);

+(function (window, document, lupload) {
    lupload.runtimes.Html4 = lupload.addRuntime("html4", {
        getFeatures: function () {
            return {
                multipart: true,
                triggerDialog: lupload.ua.gecko && window.FormData || lupload.ua.webkit
            }
        },
        init: function (uploader, callback) {
            uploader.on(lupload.EVENT_INIT, function () {
                var curIframe, curFile, id, mimeType, j,
                    body = document.body,
                    ids = [],
                    ie = /MSIE/.test(navigator.userAgent),
                    accept = [],
                    filters = uploader.options.filters,
                    eName = function (event) {
                        return event + "." + id;
                    };

                a:for (var i = 0; i < filters.length; i++) {
                    var extensions = filters[i].extensions.split(/,/);
                    for (j = 0; j < extensions.length; j++) {
                        if ("*" === extensions[j]) {
                            accept = [];
                            break a
                        }
                        mimeType = lupload.mimeTypes[extensions[j]];
                        mimeType && -1 === $.inArray(mimeType, accept) && accept.push(mimeType)
                    }
                }
                accept = accept.join(",");

                function buildForm() {
                    var form, input, btn;
                    id = lupload.guid();
                    ids.push(id);
                    form = $("<form />");
                    form.attr({
                        "id": "form_" + id,
                        "method": "post",
                        "enctype": "multipart/form-data",
                        "encoding": "multipart/form-data",
                        "target": uploader.id + "_iframe"
                    });
                    form.css("position", "absolute");

                    input = $("<input />");
                    input.attr({
                        "id": "input_" + id,
                        "type": "file",
                        "accept": accept,
                        "size": 1
                    });

                    btn = $(uploader.options.trigger);
                    if (uploader.features.triggerDialog && btn.size()) {
                        btn.on(eName("click"), function (e) {
                            $(this).is(":disabled") || input.trigger("click");
                            e.preventDefault();
                            return false;
                        });
                    }

                    input.css({
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        fontSize: "99px",
                        cursor: "pointer"
                    });

                    form.css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        overflow: "hidden"
                    });
                    ie && input.css({filter: "alpha(opacity=0)"});

                    input.on(eName("change"), function (e) {
                        var i, g = e.target, files = [];
                        if (g.value) {
                            $("#form_" + id).css("top", "-1048575px");
                            i = g.value.replace(/\\/g, "/");
                            i = i.substring(i.length, i.lastIndexOf("/") + 1);
                            files.push(new lupload.File(id, i));

                            if (uploader.features.triggerDialog) {
                                btn.off(eName("click"));
                            }
                            input.off(eName("change"));
                            buildForm();
                            files.length && uploader.trigger(lupload.EVENT_FILES_ADD, files)
                        }
                    });

                    form.append(input);
                    $(uploader.options.container || body).eq(0).append(form);
                    uploader.refresh()
                }

                function buildIframe() {
                    curIframe = $('<iframe id="' + uploader.id + '_iframe" name="' + uploader.id + '_iframe" src="javascript:false;" style="display:none"></iframe>');
                    $(body).append(curIframe);
                    curIframe.on(eName("load"), function () {
                        var res;
                        if (curFile) {
                            try {
                                res = $(this).contents().find("body").html();
                            } catch (e) {
                                return void uploader.trigger(lupload.EVENT_ERROR, {
                                    code: lupload.ERROR_SECURITY,
                                    message: lupload.translate("Security error."),
                                    file: curFile
                                })
                            }

                            try {
                                res = $.parseJSON(res);
                            } catch (e) {
                            }


                            if (res) {
                                curFile.status = lupload.STATE_DONE;
                                curFile.loaded = 1025;
                                curFile.percent = 100;
                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, curFile);
                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_COMPLETE, curFile, res)
                            }
                        }
                    })
                }

                if (uploader.options.container) {
                    var container = $(uploader.options.container);
                    if ("static" === container.css("position")) {
                        container.css("position", "relative");
                    }
                }

                uploader.on(lupload.EVENT_FILE_UPLOAD_START, function (me, file) {
                    var form, input;
                    if (file.status != lupload.STATE_DONE && file.status != lupload.STATE_FAILED && uploader.state != lupload.STATE_STOPPED) {
                        form = $("#form_" + file.id);
                        input = $("#input_" + file.id);
                        input.attr("name", uploader.options.file_data_name);
                        form.attr("action", uploader.options.url);
                        $.each(
                            //添加文件信息以及额外的参数信息
                            $.extend({name: file.target_name || file.name}, uploader.options.multipart_params),
                            function (name, value) {
                                var hidden = $('<input type="hidden" name="' + name + '" value="' + value + '"/>');
                                form.prepend(hidden)
                            }
                        );
                        curFile = file;
                        form.css("top", "-1048575px");
                        form[0].submit()
                    }
                });
                uploader.on(lupload.EVENT_FILE_UPLOAD_COMPLETE, function () {
                    uploader.refresh()
                });

                uploader.on(lupload.EVENT_FILES_REMOVE, function (me, files) {
                    var i, elem;
                    for (i = 0; i < files.length; i++) {
                        elem = $("#form_" + files[i].id);
                        elem.size() && elem.remove();
                    }
                });

                uploader.on(lupload.EVENT_BROWSE_DISABLE, function (me, disabled) {
                    var elem = $("#input_" + id);
                    elem.length && (elem.prop("disabled", disabled))
                });

                //开启上传
                uploader.on(lupload.EVENT_START, function () {
                    buildIframe();
                    $.each(uploader.files, function (i, file) {
                        if (file.status === lupload.STATE_DONE || file.status === lupload.STATE_FAILED) {
                            var form = $("#form_" + file.id);
                            form.size() && form.remove()
                        }
                    })
                });

                //关闭上传
                uploader.on(lupload.EVENT_STOP, function () {

                    setTimeout(function () {
                        curIframe.off(eName("load"));
                        curIframe.size() && curIframe.remove()
                    }, 0);

                    $.each(uploader.files, function (i, file) {
                        if (file.status === lupload.STATE_DONE || file.status === lupload.STATE_FAILED) {
                            var form = $("#form_" + file.id);
                            form.size() && form.remove()
                        }
                    })
                });

                //卸载
                uploader.on(lupload.EVENT_DISPOSE, function () {
                    $.each(ids, function (i, id) {
                        var form = $("#form_" + id);
                        form.size() && form.remove()
                    })
                });

                buildForm()
            });
            callback({success: true})
        }
    })
})(window, document, lupload);

+(function () {
    lupload.addI18n({
        "File size error.": "上传的文件太大了~",
        "File count error.": "上传的文件数量太多了~",
        "File extension error.": "上传的文件格式不正确",
        "Init error.": "可能暂时上传不了图片哦，请更换浏览器试试",
        "Security error.": "可能暂时上传不了图片哦，请更换浏览器试试",
        "HTTP Error.": "上传失败，是不是网络挂起了？"
    })
})(lupload);



