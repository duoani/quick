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
