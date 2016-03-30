!function(t){"use strict";function e(){var e,i=arguments[0],n=Array.prototype.slice.call(arguments,1);return this.each(function(){var r=t(this),s=r.data("ui.textarea");s?"string"==typeof i&&(e=s[i].apply(s,n)):r.data("ui.textarea",s=new a(r[0],i))}),void 0!==e?e:this}var i={limit:!0,useSBC:!0,min:0,max:400,wrapper:!0,wrapperClass:"ui-text",errorClass:"",render:!0},n=function(t){return t.replace(/[^\x00-\xff]/g,"xx").length},a=function(e,n){this.$element=t(e),this.options=t.extend({},i,n),this.options.render&&this.render()};a.prototype={render:function(){var e=this,i=e.options;i.wrapper&&(e.$element.is("textarea")?(e.$element.wrap('<div class="'+e.options.wrapperClass+'"></div>'),i.limit&&(e.$info=t('<div class="ui-text-info text-muted"></div>').insertAfter(e.$element))):e.$element.is("input:text")),e.$element.bind({input:function(){e.check()},propertychange:function(){e.check()}}),i.limit&&e.check(!0)},check:function(e){var i=!0,a=this.options;if(a.limit){var r=t.trim(this.$element.val()),s=n(r),o="";s?s<this.options.min?(this.$info&&this.$info.addClass("text-danger"),o=a.useSBC?"请再输入"+Math.ceil((a.min-s)/2)+"个字":"请再输入"+(a.min-s)+"个字符",i=!1):s>this.options.max?(this.$info&&this.$info.addClass("text-danger"),o=a.useSBC?"已超出"+Math.ceil((s-a.max)/2)+"个字":"已超出"+(s-a.max)+"个字符",i=!1):(this.$info&&this.$info.removeClass("text-danger"),o=a.useSBC?"还可输入"+Math.ceil((a.max-s)/2)+"个字":"还可输入"+(a.max-s)+"个字符",i=!0):(!e&&this.$info&&this.$info.addClass("text-danger"),o=a.useSBC?"请输入"+parseInt(a.min/2)+"至"+parseInt(a.max/2)+"个字":"请输入"+a.min+"至"+a.max+"个字符",i=!1),this.$info&&this.$info.text(o)}if(!e&&a.errorClass){var l=a.wrapper?this.$element.parent():this.$element;i?l.addClass(a.errorClass):l.addClass(a.errorClass)}return i}};var r=t.fn.textarea;t.fn.textarea=e,t.fn.textarea.Constructor=a,t.fn.textarea.noConflict=function(){return t.fn.textarea=r,this}}(Zepto);