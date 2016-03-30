$(function(){
    var $main = $('body');
    var $list = $('.wishlist');
    var $btnEdit = $('#editWishlist');
    var tpl = '<nav class="nav nav-b nav-action action-bar"><ul><li> <div class="btn btn-sm btn-danger btn-round btn-fat btnRemoveWishlist">删除</div></li></ul></nav>';
    var $modal = null;
    var openEdit = function(){
        $btnEdit.text('完成');
        $main.addClass('open-edit');
        $modal = $.modal({
            layout: 'custom',
            allowScroll: true,
            html: tpl 
        }).on('modal:show', function(){
            $(this).find('.btnRemoveWishlist').on('tap', function(){
                onRemoveWishlist();
            });
        });
    };
    var closeEdit = function(){
        $btnEdit.text('编辑');
        $main.removeClass('open-edit');
        $list.find('.checkbox input').prop('checked', false);
        $modal && $modal.modal('hide');
    };

    $btnEdit.on('tap', function(){
        $btnEdit.toggleClass('open');
        if($btnEdit.hasClass('open')){
            openEdit();
        }
        else{
            closeEdit();
        }
    });

    function onRemoveWishlist(){
        var $checked = $list.find('.checkbox input:checked');
        var ids = [];
        $checked.each(function(){
            var id = this.value;
            if(id){
                ids.push(id);
            }
        });
        if(ids.length){
            $.confirm({
                content: '确定要删除这'+ids.length+'种商品吗?',
                buttons: [{text: '删除', type: 'primary'}, '取消']
            }).on('modal:action', function(e){
                if( e.index === 0 ){
                    $checked.each(function(){
                        $(this).closest('li').remove();
                    });
                    $.toastSuccess({content: '删除成功', duration: 1500});

                    //删除了所有商品，须切换为空状态
                    if(!$list.children().length){
                        var html = '<div class="notice"><div class="notice-icon notice-icon-fail"></div><div class="notice-text"><h4>收藏夹里还没有你的宝贝</h4></div></div>';
                        $list.after(html).remove();
                        closeEdit();
                        $btnEdit.hide();
                    }
                }
            });

        }
        else{
            $.toast("您还没有选择商品哦!");
        }
    }
});
