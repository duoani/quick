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
