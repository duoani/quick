!function(){
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
}();
