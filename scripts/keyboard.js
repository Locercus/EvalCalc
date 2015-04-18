/**
 * Copyright 2015 Jonatan Nordentoft, Creeper32605
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var updateInputCaret = function() {
	var ppos = getCaretCoordinates($("#input")[0], $("#input")[0].selectionStart);
	var offs = { top: $("#input").offset().top, left: $("#input").offset().left };
	$("#caret").css('top', offs.top + ppos.top).css('left', offs.left + ppos.left);
	$("#caret").addClass('na').removeClass('na').removeClass('hidden');
}
$(document).ready(function(){
	try {
		renderMathInElement($("#keyboard")[0]);
	} catch(err){
		console.log(err);
	}
	
	$("#keyboard-open-btn").click(function(){
		if( $("#keyboard").hasClass('hidden') ) {	
			$("#calculator").addClass('keyboard');
			$("#keyboard").removeClass('hidden');
			updateInputCaret();
		} else {
			$("#calculator").removeClass('keyboard');
			$("#keyboard").addClass('hidden');
		}
	});
	$("#input").focus(function(){
		$("#caret").addClass('hidden')
	}).keydown(function(){
		$("#caret").addClass('hidden');
	});
	$(window).resize(updateInputCaret);
	$("#keyboard .key").each(function(){
		$(this).click(function(){
			var val = $(this).attr('value');
			var car = parseInt($(this).attr('caret')) || 0;
			var cmd = false;
			if( val.substr(0,2) == '__' ) {
				cmd = true;
				val = val.substr(2);
			}
			if( !cmd ) {
				var cursorPos = $("#input")[0].selectionStart;
				var cursorEnd = $("#input")[0].selectionEnd;
				var text = $("#input").val();
				text = text.substr(0,cursorPos) + val + text.substr(cursorEnd);
				var newCursorPos = cursorPos + val.length + car;
				$("#input").val(text);
				$("#input")[0].selectionEnd = newCursorPos;
				$("#input")[0].selectionStart = newCursorPos;
				inputHandle();
				updateInputCaret();
			} else {
				if( val == 'enter' ) {
					tryAssignVariable();
				} else if( val == 'bcksp' ) {
					var text = $("#input").val();
					var cursorPos = $("#input")[0].selectionStart;
					var cursorEnd = $("#input")[0].selectionEnd;
					var newCursorPos;
					if( cursorPos != cursorEnd ) {
						text = text.substr(0,cursorPos) + text.substr(cursorEnd);
						newCursorPos = cursorPos;
					} else {
						text = text.substr(0,cursorPos - 1) + text.substr(cursorPos);
						newCursorPos = cursorPos - 1;
					}
					$("#input").val(text);
					$("#input")[0].selectionEnd = newCursorPos;
					$("#input")[0].selectionStart = newCursorPos;
					inputHandle();
					updateInputCaret();
				} else if( val == 'left' ) {
					if( $("#input")[0].selectionStart > 0 ) {
						$("#input")[0].selectionStart--;
						$("#input")[0].selectionEnd--;
					}
					updateInputCaret();
				} else if( val == 'right' ) {
					$("#input")[0].selectionEnd++;
					$("#input")[0].selectionStart++;
					updateInputCaret();
				} else if( val == 'close' ) {
					$("#keyboard").addClass('hidden');
					$("#calculator").removeClass('keyboard');
					$("#caret").addClass('hidden');
				}
			}
		});
	});
	
	var kbdScrollTimeout = setTimeout(function(){})
	$("#keyboard-sections").scroll(function(e){
		clearTimeout(kbdScrollTimeout);
		kbdScrollTimeout = setTimeout(function(){
			var section = Math.floor(($("#keyboard-sections").scrollTop() + ($("#keyboard-sections").height()/2)) /
				$("#keyboard-sections").height());
			var start = Date.now();
			var end = Date.now() + 300;
			var kbst = $("#keyboard-sections").scrollTop();
			var kben = $("#keyboard-sections").height() * section;
			function loop() {
				var prc = jQuery.easing.easeInOutExpo( 1 - ((end - Date.now()) / 300 ));
				$("#keyboard-sections").scrollTop(kbst + (kben - kbst) * prc );
				if( Date.now() >= end ) {
					$("#keyboard-sections").scrollTop(kben);
				} else {
					reqFrame(loop);
				}
			}
			loop();
		},400);
	});
	$("#keyboard").on('mousewheel wheel', function(e){
		var dx = e.originalEvent.wheelDeltaX;
		var dy = e.originalEvent.wheelDeltaY;
		if( dy > 100 || dy < -100 ) {
			e.preventDefault();
			var section = Math.floor(($("#keyboard-sections").scrollTop() + ($("#keyboard-sections").height()/2)) /
				$("#keyboard-sections").height());
			section -= Math.sign(dy);
			if( !$("#keyboard-sections .kbd-section:nth-child(" + (section + 1) + ")").length ) {
				return;
			}
			var start = Date.now();
			var end = Date.now() + 300;
			var kbst = $("#keyboard-sections").scrollTop();
			var kben = $("#keyboard-sections").height() * section;
			function loop() {
				var prc = jQuery.easing.easeInOutExpo( 1 - ((end - Date.now()) / 300 ));
				$("#keyboard-sections").scrollTop(kbst + (kben - kbst) * prc );
				if( Date.now() >= end ) {
					$("#keyboard-sections").scrollTop(kben);
				} else {
					reqFrame(loop);
				}
			}
			loop();
		}
	});
});