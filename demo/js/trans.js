!(function(){
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
});
