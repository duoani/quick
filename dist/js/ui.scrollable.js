!function(t){function i(t,i){}i.prototype={},t.fn.scrollable=function(n){var o,a=Array.prototype.slice.call(arguments,1);return this.each(function(){var e=t(this),l=e.data("ui.scrollable");l||(l=new i(this,n),e.data("ui.scrollable",l)),"string"==typeof n&&(o=l[n]&&0!==n.indexOf("_")&&l[n].apply(l,a))}),void 0!==o?o:this}}(window.Zepto);