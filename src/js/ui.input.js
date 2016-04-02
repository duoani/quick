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
