!function(t){t.tpl=function(t,n){var e="var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+t.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');",o=new Function("obj",e);return n?o(n):o},t.adaptObject=function(n,e,o,p,r,i){var a=n;if("string"!=typeof o){var s=t.extend({},e,"object"==typeof o&&o);t.isArray(a)&&a.length&&"script"===t(a)[0].nodeName.toLowerCase()?a=t(t.tpl(a[0].innerHTML,s)).appendTo("body"):t.isArray(a)&&a.length&&""===a.selector?a=t(t.tpl(a[0].outerHTML,s)).appendTo("body"):t.isArray(a)||(a=t(t.tpl(p,s)).appendTo("body"))}return a.each(function(){var n=t(this),p=n.data("dui."+i);p||n.data("dui."+i,p=new r(this,t.extend({},e,"object"==typeof o&&o))),"string"==typeof o&&p[o]()})}}(Zepto),$(function(){document.body.addEventListener("touchstart",function(){})});