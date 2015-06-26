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

$(document).ready(function(){
	var inputTouchKeyboardDisabled = false;
	/*$("#input").on('touchend', function(e){
		e.preventDefault();
		reqFrame(function(){
			if( inputTouchKeyboardDisabled ) {
				return;
			}
			$("#keyboard").removeClass('hidden');
			$("#calculator").addClass('keyboard');
			$("#input").blur();
			updateInputCaret();
		});
	});*/
	
	function addBracketCompletion(bracketOpen, bracketClose, keyCodeOpen, keyCodeClose) {
		$("#input").on('keypress', function(e){
			if( e.which == keyCodeOpen ) {
				var cursorPos = $(this)[0].selectionStart;
				var cursorEnd = $(this)[0].selectionEnd;
				if( cursorPos != cursorEnd ) {
					return;
				}
				e.preventDefault();
				var text = $(this).val();
				var closeBrackets = 0;
				for( var i in text ) {
					if( text[i] == bracketClose ) {
						closeBrackets++;
					} else if( text[i] == bracketOpen ) {
						closeBrackets--;
					}
				}
				var ftext = bracketOpen + bracketClose;
				if( closeBrackets != 0 ) {
					ftext = bracketOpen;
				}
				text = text.substr(0,cursorPos) + ftext + text.substring(cursorPos, text.length);
				$(this).val(text);
				$(this)[0].selectionStart = cursorPos + 1;
				$(this)[0].selectionEnd = cursorPos + 1;
				inputHandle();
			} else if( e.which == keyCodeClose ) {
				var cursorPos = $(this)[0].selectionStart;
				var cursorEnd = $(this)[0].selectionEnd;
				if( cursorPos != cursorEnd ) {
					return;
				}
				var text = $(this).val();
				var openBrackets = 0;
				for( var i in text ) {
					if( text[i] == bracketOpen ) {
						openBrackets++;
					} else if( text[i] == bracketClose ) {
						openBrackets--;
					}
				}
				if( !openBrackets ) {
					if( text.substr(cursorPos,1) == bracketClose ) {
						e.preventDefault();
						$(this)[0].selectionEnd++;
						$(this)[0].selectionStart++;
					}
				}
				inputHandle();
			}
		}).on('keydown', function(e){
			if( e.which == 8 ) {
				var cursorPos = $(this)[0].selectionStart;
				var cursorEnd = $(this)[0].selectionEnd;
				if( cursorPos != cursorEnd ) {
					return;
				}
				var text = $(this).val();
				if( text.substr(cursorPos,1) == bracketClose && text.substr(cursorPos-1,1) == bracketOpen ) {
					e.preventDefault();
					text = text.substring(0, cursorPos - 1) + text.substring(cursorPos + 1, text.length);
					$(this).val(text);
					$(this)[0].selectionStart = cursorPos - 1;
					$(this)[0].selectionEnd = cursorPos - 1;
				}
				inputHandle();
			}
		});
	}
	addBracketCompletion('(',')',40,41);
	addBracketCompletion('[',']',91,93);
	addBracketCompletion('{','}',123,125);
	
	//clear input by dragging to the right
	(function(){
		var touching = false, tcf = false, touchX = 0, touchStartX = 0;
		var inputPosLeft = 0, caretWasEnabled = false;
		$("#input").on('touchstart', function(e){
			touching = true;
			touchStartX = e.originalEvent.touches[0].pageX;
			inputPosLeft = $("#input").offset().left;
			caretWasEnabled = !$("#caret").hasClass('hidden');
		});
		$(document).on('touchmove', function(e){
			var x = e.originalEvent.touches[0].pageX;
			if( touching && !tcf ) {
				if( x < touchStartX - 10 || x > touchStartX + 10 ) {
					tcf = true;
				}
			}
			if( tcf ) {
				$("#caret").addClass('hidden');
				touchX = x - touchStartX - inputPosLeft;
				if( touchX < 0 ) {
					touchX = Math.pow(Math.abs(touchX), 1/1.2) * -1;
				}
				$("#input").css({
					'-webkit-transform': 'translateX(' + touchX + 'px)'
				});
				if( touchX > $(window).width() / 3 ) {
					$("#input").addClass('clearPotential');
				} else {
					$("#input").removeClass('clearPotential');	
				}
			}
		}).on('touchend', function(e){
			touching = false;
			if( tcf ) {
				inputTouchKeyboardDisabled = true;
				e.stopPropagation();
				e.preventDefault();
				tcf = false;
				var wasCleared = $("#input").hasClass('clearPotential');
				$("#input").removeClass('clearPotential');
				$("#input").css({
					'-webkit-transition': '-webkit-transform .3s cubic-bezier(.2,.3,0,1)',
					'-o-transition': '-o-transform .3s cubic-bezier(.2,.3,0,1)',
					'transition': 'transform .3s cubic-bezier(.2,.3,0,1)'
				});
				reqFrame(function(){
					if( wasCleared ) {
						$("#input").val("");
						reqFrame(inputHandle);
					}
					var onEnd = function(){
						$("#input").off('transitionend webkitTransitionEnd oTransitionEnd', onEnd);
						$("#input").css({
							'-webkit-transition': '',
							'-o-transition': '',
							'transition': ''
						});
						inputTouchKeyboardDisabled = false;
						if( caretWasEnabled ) {
							updateInputCaret();
						}
					}
					$("#input").css({
						'-webkit-transform': '',
						'-o-transform': '',
						'transform': ''
					}).on('transitionend webkitTransitionEnd oTransitionEnd', onEnd);
				});
			}
		});
	})();
});