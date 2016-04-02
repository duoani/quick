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
