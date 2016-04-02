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
