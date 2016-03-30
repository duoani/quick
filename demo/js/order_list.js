$( function (){
    "use strict";
    // nav滑动
    var $topNav = $('#topNav'),
        $topTab = $('#topTab'),
        $content = $('.content'),
        topNavHeight = $topNav.height();
    $content.scrollwatcher(function (direction, top){
        if ( direction === 'down' && top >= topNavHeight) {
            $topNav.addClass('nav-float');
            $topTab.addClass('tab-float');
        } else {
            $topNav.removeClass('nav-float');
            $topTab.removeClass('tab-float');
        }
    });

    $('.jsTime').each( function (){
        var _this = $(this),
            iTimeOut = parseInt( _this.attr('timeout'), 10 ) || 10,
            oTime = new C.Timer( {
                timeout: 1e3 * iTimeOut,
                interval: 100,
                step: 100,
                onStarting: function ( iTimeOut ){
                    var e = C.formatCountdown( iTimeOut );
                    _this.text( '请在' + e + '内付款' );
                },
                onStop: function (){
                    window.location.reload();
                }
            } );
        oTime.start();
    });
    // 立即支付
    $('.jsPay').on('tap', function (){
        $('#jsOrderForm').submit();
    });
    $('.jsUnOrder').on( 'tap', function (){
        var order_code = $(this).data('order-id');
        $.confirm( {
            content: '您确定要删除此订单？',
            buttons: [{text: "确定删除", type: "primary"}, {text: "取消"}]
        } )
            .on( 'modal:action', function ( e ){
                if ( e.index === 0 ) {
                    handleOrder('Order/delete', {
                        order_code: order_code
                    });
                } 
            });
        return false;
    } );
    $('.jsTake').on( 'tap', function (){
        var order_code = $(this).data('order-id'),
            act_code = window.localStorage.getItem("act_code") || "";
        $.confirm( {
            content: '确定收货后可对购买商品进行评价。',
            buttons: [ '确定收货', '取消' ]
        } )
            .on( 'modal:action', function ( e ){
                if ( e.index === 0 ) {
                    handleOrder('Order/confirmDelivered', {
                        order_code: order_code,
                        act_code: act_code
                    });
                }
            });
        return false;
    } );

    function handleOrder(url, data){
        C.postJSON(url, data).done(function (data){
            if ( data.status ) {
                location.reload();
            } else {
                $.toastWarning( '操作失败' );
            }
        }).fail(function (){

        });
    }
});
