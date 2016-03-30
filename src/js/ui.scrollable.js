!function($){
    function Scrollable(element, options){

    }
    Scrollable.prototype = {

    };

    $.fn.scrollable = function (options) {
        var args = Array.prototype.slice.call(arguments, 1),
            value;
        this.each(function (){
            var $this = $(this),
                data = $this.data("ui.scrollable");

            if (!data) {
                data = new Scrollable(this, options);
                $this.data("ui.scrollable", data);

            } 
            if (typeof options == 'string') {
                //不允许调用私有方法(_methodName like)
                value = data[options] && options.indexOf("_") !== 0 && data[options].apply(data, args);
            }
        });
        return value !== undefined ? value : this;
    };
}(window.Zepto);
