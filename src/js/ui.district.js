/**
 * require zepto.js
 * require ui.js
 * require ui.district.data.js
 */
// 省市区选择
!function($){
    
    var defaults = {
        value: '',
        show: true,
        itemHeight: 40
    };

    var tpl ='<div class="area-modal">'+
        '   <div class="area-backdrop">点击此处取消选择</div>'+
        '   <div class="area-dialog">'+
        '      <div class="area-list area-province border-r">'+
        '           <div class="area-title border-b">省份</div>'+
        '           <div class="area-content">'+
        '               <ul class="province">'+
        '               </ul>'+
        '           </div>'+
        '       </div>'+
        '       <div class="area-list area-city border-r">'+
        '           <div class="area-title border-b">城市</div>'+
        '           <div class="area-content">'+
        '               <ul class="city">'+
        '               </ul>'+
        '           </div>'+
        '       </div>'+
        '       <div class="area-list area-county">'+
        '           <div class="area-title border-b">区/县</div>'+
        '           <div class="area-content">'+
        '               <ul class="county">'+
        '               </ul>'+
        '           </div>'+
        '       </div>'+
        '   </div>'+
        '</div>';

    function District(element, options){
        this.options = options;
        this.element = $(element);
        this.province = this.element.find(".province");
        this.city = this.element.find(".city");
        this.county = this.element.find(".county");

        if( options.value ){
            var p = C.area.getProvinceByAreaCode(options.value);
            var c = C.area.getCityByAreaCode(options.value);
            var a = C.area.getAreaByCode(options.value);

            this._renderProvince(C.area.getProvinceList(), p.code);
            this._renderCity(C.area.getCityList(p.code), c.code);
            this._renderCounty(C.area.getAreaList(c.code), a.code);

        }else{
            this._renderProvince(C.area.getProvinceList());
        }
        this._bind();
        if( this.options.show ){
            this.show();
        }
    }
    District.prototype = {
        _bind: function(){
            var me = this;

            this.element.children(".area-backdrop").on("touchend", function(e){
                me.hide();
                e.preventDefault(); 
            });


            //点击省级，显示市级，隐藏区级
            this.province.on("tap", "li", function(e){
                var $this = $(this),
                    code = $this.attr("code");
                $this.addClass("active").siblings().removeClass("active");
                me._renderCity(C.area.getCityList(code) || []);
                me._renderCounty([]);
                e.preventDefault();
            });
            
            //点击市级，显示区级
            this.city.on("tap", "li", function(e){
                var $this = $(this),
                    code = $this.attr("code");
                $this.addClass("active").siblings().removeClass("active");
                me._renderCounty(C.area.getAreaList(code) || []);
                e.preventDefault();
            });

            //点击区级，关闭控件
            this.county.on("tap", "li", function(e){
                var $this = $(this),
                    code = $this.attr("code");
                $this.addClass("active").siblings().removeClass("active");

                me.element.trigger($.Event("district:change"), [[C.area.getProvinceByAreaCode(code), C.area.getCityByAreaCode(code), C.area.getAreaByCode(code)]]);
                me.hide();
                e.preventDefault();
            });
        },
        _renderProvince: function(list, activeCode){
            var html = "", i=0, item;
            while(item = list[i++]){
                html += '<li class="nowrap'+ (activeCode && activeCode == item.code ? ' active' : "") + '" code="' + item.code + '">' + item.display + '</li>';
            }
            this.province.html(html);
        },
        _renderCity: function(list, activeCode){
            var html = "", i=0, item;
            while(item = list[i++]){
                html += '<li class="nowrap'+ (activeCode && activeCode == item.code ? ' active' : "") + '" code="' + item.code + '">' + item.name + '</li>';
            }
            this.city.html(html);
        },
        _renderCounty: function(list, activeCode){
            var html = "", i=0, item;
            while(item = list[i++]){
                html += '<li class="nowrap'+ (activeCode && activeCode == item.code ? ' active' : "") + '" code="' + item.code + '">' + item.name + '</li>';
            }
            this.county.html(html);

        },
        show: function(){
            var me = this;
            var options = this.options;

            // 如果有选中，需要将选中项调整到可视区域。
            if(options.value){
                var index = this.province.children(".active").index();
                index >= 0 && this.province.parent().scrollTop(index * options.itemHeight);
                index = this.city.children(".active").index();
                index >= 0 && this.city.parent().scrollTop(index * options.itemHeight);
                index = this.county.children(".active").index();
                index >= 0 && this.county.parent().scrollTop(index * options.itemHeight);
            }

            setTimeout(function(){
                var e = $.Event('district:show');
                me.element.addClass('modal-open').trigger(e);
            }, 30);
        },
        hide: function(){
            var me = this;
            me.element.removeClass('modal-open');
            setTimeout(function(){
                var e = $.Event('district:hide');
                me.element.trigger(e).remove();
            }, 400);
        }
    };
    // 禁止冒泡
    function _stopScroll(e){
        e.preventDefault();
        return false;
    }
    
    $.fn.district = $.district = function(options){
        return $.adaptObject(this, defaults, options, tpl, District, 'district');
    };

}(window.Zepto);
