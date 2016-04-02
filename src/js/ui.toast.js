/**
 * 非模态toast提示窗, 非模态, 不影响操作, 显示固定时间后自动消失
 * 用法:
 * $.toast("弹出几秒后自动消失")
 * require zepto.js
 * require ui.js
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
