!function(t){function n(t){return t.closest(".form-control")}function a(t){t.val()?n(t).addClass("has-value"):n(t).removeClass("has-value")}var u='[data-input-type="text"]',i='[data-input-type="clear"]';t(document).on("blur.ui.input.data-api",u,function(){a(t(this))}).on("touchend.ui.input.data-api",i,function(){var a=n(t(this)).removeClass("has-value"),i=a.find(u).val("");setTimeout(function(){i.focus()},50)}),t(function(){t(u).each(function(){a(t(this))})})}(window.Zepto);