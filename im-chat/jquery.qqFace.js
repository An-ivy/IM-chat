// QQ表情插件
(function ($) {
	$.fn.qqFace = function (options) {
		var defaults = {
			id: 'facebox',
			path: 'face/',
			assign: 'content',
			tip: 'em_'
		};
		var option = $.extend(defaults, options);
		var assign = $('#' + option.assign);
		var id = option.id;
		var path = option.path;
		var tip = option.tip;

		if (assign.length <= 0) {
			alert('缺少表情赋值对象。');
			return false;
		}

		$(this).click(function (e) {
			var strFace, labFace;
			if ($('#' + id).length <= 0) {
				$.ajax({
					type: "get",
					url: "./emoji_map.xml",
					dataType: "xml",
					success:(data)=>{
						// console.log($($(data).find("resources").find("integer-array").find("item")[0]).text().substr(9))
						strFace = '<div id="' + id + '" style="position:absolute;display:none;z-index:1000;background: honeydew;box-shadow: 0 0 5px 5px darkgrey;height: 140px;overflow-y: scroll;" class="qqFace">' +
				'<table border="0" cellspacing="0" cellpadding="0"><tr>';
						$(data).find("resources").find("integer-array").find("item").map((i,item)=>{
							// console.log("42",strFace)
							// console.log($(item).text())
							labFace ='['+$(item).text().trim()+']';
							let aa=$(item).text() 
							let bb=path+'/u'+String.fromCodePoint(aa).codePointAt(0).toString(16)//表情码点转码
							strFace += '<td><span onclick="$(\'#' + option.assign + '\').setCaret();$(\'#' + option.assign + '\').insertAtCaret(\'' + labFace + '\');">'+'<img src='+bb+'.png style="width:20px;height:20px;" >'+'</span></td>';
							if ((i+1) % 15 == 0) strFace += '</tr><tr>';
						})
						strFace += '</tr></table></div>';
						// console.log(strFace);
						$(this).parent().append(strFace);
						var offset = $(this).position();
						offset.top=280;
						var top = offset.top + $(this).outerHeight();
						$('#' + id).css('top', top);
						$('#' + id).css('left', offset.left);
						$('#' + id).show();
						e.stopPropagation();
					}
				})
				
			}
		});

		$(document).click(function () {
			$('#' + id).hide();
			$('#' + id).remove();
		});
	};

})(jQuery);

jQuery.extend({
	unselectContents: function () {
		if (window.getSelection)
			window.getSelection().removeAllRanges();
		else if (document.selection)
			document.selection.empty();
	}
});
jQuery.fn.extend({
	selectContents: function () {
		$(this).each(function (i) {
			var node = this;
			var selection, range, doc, win;
			if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined') {
				range = doc.createRange();
				range.selectNode(node);
				if (i == 0) {
					selection.removeAllRanges();
				}
				selection.addRange(range);
			} else if (document.body && typeof document.body.createTextRange != 'undefined' && (range = document.body.createTextRange())) {
				range.moveToElementText(node);
				range.select();
			}
		});
	},

	setCaret: function () {
		if (!$.support.msie) return;
		var initSetCaret = function () {
			var textObj = $(this).get(0);
			textObj.caretPos = document.selection.createRange().duplicate();
		};
		$(this).click(initSetCaret).select(initSetCaret).keyup(initSetCaret);
	},

	insertAtCaret: function (textFeildValue) {
		var textObj = $(this).get(0);
		if (document.all && textObj.createTextRange && textObj.caretPos) {
			var caretPos = textObj.caretPos;
			caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
				textFeildValue + '' : textFeildValue;
		} else if (textObj.setSelectionRange) {
			var rangeStart = textObj.selectionStart;
			var rangeEnd = textObj.selectionEnd;
			var tempStr1 = textObj.value.substring(0, rangeStart);
			var tempStr2 = textObj.value.substring(rangeEnd);
			textObj.value = tempStr1 + textFeildValue + tempStr2;
			textObj.focus();
			var len = textFeildValue.length;
			textObj.setSelectionRange(rangeStart + len, rangeStart + len);
			textObj.blur();
		} else {
			console.log(textFeildValue)
			// textObj.value += textFeildValue;
			// let aa = replace_em(textFeildValue)
			let bb=textFeildValue.substring(1,textFeildValue.length-1)
			console.log(bb)
			$("#send_txt").append(String.fromCodePoint(bb))//es6转码
		}
	}
});