/**
 * Created by Administrator on 2015/11/20.
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

/**
 * 模态框
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
 * Loading
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
  非模态toast提示窗, 非模态, 不影响操作, 显示固定时间后自动消失
  用法:
  $.toast("弹出几秒后自动消失")
  */
!function($){

    // 默认模板
    var tpl='<div class="toast toast-<%=type%>">'+
    '<div class="toast-content">'+
    '<% if(type === "warning"){ %>'+
    '<i class="icon icon-emo-unhappy mr-md"></i>'+
    '<% }else if(type === "success"){ %>'+
    '<i class="icon icon-emo-happy mr-md"></i>'+
    '<% }else{ %>'+
    '<% } %>'+
    '<%=content%>'+
    '</div>'+
    '</div>';

    // 默认参数
    var defaults = {
        content  : '',
        duration : 3000,
        type     : 'info' //info success warning
    };

    // 构造函数
    var Toast   = function (element, options) {
        this.element       = $(element);
        this.elementHeight = $(element).height();
        this.options       = $.extend({}, defaults, options);

        this.effector = options.effect && options.effect == "fade-out-up" ? FadeOutUpEffector : SlideDownUpEffector;
        this.effector.init(this);

        this.show();
    };
    Toast.prototype={
        show: function(){
            this.effector.start(this);
        },
        hide :function () {
            this.effector.end(this);
        },
        getOptions: function(){
            return this.options;
        },
        getElement: function(){
            return this.element;
        },
        onShow: function(){
            this.element.trigger($.Event("toast:show"));
        },
        onHide: function(){
            this.element.trigger($.Event("toast:hide"));
        }
    };
    
    /**
     * Toast动画效果类
     * @param {Toast} context 上下文
     */
    var SlideDownUpEffector = function(){};
    SlideDownUpEffector.init = function(context){
        context.getElement().css({
            "-webkit-transform":"translateY(-"+context.elementHeight+"px)"
        });
    };
    SlideDownUpEffector.start = function(context){
        var options = context.getOptions(),
            element = context.getElement();

        setTimeout(function(){
            element.css({
                "-webkit-transition":"all .5s"
            });

            context.onShow();
            element.css({
                "-webkit-transform":"translateY(0px)"
            });
            if(options.duration > 0){
                setTimeout(function(){
                    context.hide();
                }, options.duration);
            }
        },20);
    };
    SlideDownUpEffector.end = function(context){
        var options = context.getOptions(),
            element = context.getElement();

        context.onHide();
        element.css({
            "-webkit-transform":"translateY(-"+context.elementHeight+"px)"
        });
        setTimeout(function(){
            element.remove();
        }, 500);

    };

    var FadeOutUpEffector= function(){};
    FadeOutUpEffector.init = function(context){
        context.getElement()
            .addClass('toast-fade-out-up')
            .css({
                "top": (document.documentElement.clientHeight - context.elementHeight ) / 4 * 3
            });
    };
    FadeOutUpEffector.start = function(context){
        var options = context.getOptions(),
            element = context.getElement();

        setTimeout(function(){
            element.css({
                "-webkit-animation-duration": options.duration +"ms",
                "animation-duration": options.duration + "ms",
            });

            context.onShow();
            element.addClass('fadeInOutUp');

            setTimeout(function(){
                context.hide();
            }, options.duration);
        },20);
    };
    FadeOutUpEffector.end = function(context){
        var options = context.getOptions(),
            element = context.getElement();

        context.onHide();
        setTimeout(function(){
            element.remove();
        }, 20);

    };

    function Plugin(options) {
        return $.adaptObject(this, defaults, options, tpl, Toast, "toast");
    }

    $.toast = function(options){
        var type = options === null || options === undefined ? null : Array.prototype.toString.call(options);
        if( type === '[object String]' ){
            return Plugin({content: options});    
        } 
        return Plugin(options);
    };
    $.toastSuccess = function(options){
        var type = options === null || options === undefined ? null : Array.prototype.toString.call(options);
        if( type === '[object String]' ){
            options = {content: options};
        } 
        options.type = 'success';
        return Plugin(options);
    };
    $.toastWarning = function(options){
        var type = options === null || options === undefined ? null : Array.prototype.toString.call(options);
        if( type === '[object String]' ){
            options = {content: options};
        } 
        options.type = 'warning';
        return Plugin(options);
    };

}(window.Zepto);

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

$(function(){
    //触发手机端hover效果
    document.body.addEventListener('touchstart', function(){ });
});
