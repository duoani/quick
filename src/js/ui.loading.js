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
