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

var addedVariable = function(){};
var onVariableRemove = function(){};
var callRemoveVariable = function(){};
var updateInputCaret = function(){};

var degRadVal = "nul";
(function(){
	var variableRemoveListeners = [];
	onVariableRemove = function(f) {
		if( typeof f != 'function' ) {
			throw new Error("Argument 0 must be a function");
		}
		variableRemoveListeners.push(f);
	}
	callRemoveVariable = function(k) {
		for( var i in variableRemoveListeners ) {
			try {
				variableRemoveListeners[i](k);
			} catch(baby) {
				throw baby;
			}
		}
	}
})();
$(document).ready(function(){
	var reqFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(f){setTimeout(f,17)};
	
	onStorageReady(function(){
		$("#controls").removeClass("pending");
		
		if( storage.data.degrad ) {
			if( storage.data.degrad == "deg" ) {
				$(".toggle-button").addClass('switch').attr('value','deg');
				degRadVal = "deg";
			} else {
				degRadVal = "rad";
			}
		} else {
			degRadVal = "rad";
		}
	});
	initStorage();
	
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
	
	try {
		renderMathInElement($("#keyboard")[0]);
	} catch(err){
		console.log(err);
	}
	$("#input").focus(function(){
		$("#caret").addClass('hidden')
	}).keydown(function(){
		$("#caret").addClass('hidden');
	});
	updateInputCaret = function() {
		var ppos = getCaretCoordinates($("#input")[0], $("#input")[0].selectionStart);
		var offs = { top: $("#input").offset().top, left: $("#input").offset().left };
		$("#caret").css('top', offs.top + ppos.top).css('left', offs.left + ppos.left);
		$("#caret").addClass('na').removeClass('na').removeClass('hidden');
	}
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
		console.log(dy);
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
	
	$("#input").on('touchend', function(e){
		e.preventDefault();
		$("#keyboard").removeClass('hidden');
		$("#calculator").addClass('keyboard');
		$("#input").blur();
		updateInputCaret();
	});
	
	$(".toggle-button").click(function(){
		$(this).toggleClass("switch");
		var value = $(this).find('.toggle-item:first-child').attr('value');
		if( $(this).hasClass('switch')) {
			value = $(this).find('.toggle-item:last-child').attr('value');
		}
		storage.data.degrad = value;
		$(this).attr('value', value );
	});
	
	$("#ctrl-degrad").click(function(){
		var that = this;
		reqFrame(function(){
			degRadVal = $(that).attr('value');
			inputHandle();
		});
	});
	
	function updateCanvasSizes() {
		$("canvas").each(function(){
			var pxr = window.devicePixelRatio || 1;
			$(this).attr('width', $(this).width() * pxr);
			$(this).attr('height', $(this).height() * pxr);
		});
	}
	updateCanvasSizes();
	$(window).resize(updateCanvasSizes);
	
	/*(function(){
		var touchStartY = 0, touchStartX = 0, touchY = 0, touchX = 0, touching = false;
		var ctrlHeight = 150;
		$("#controls").on('touchstart', function(e){
			if( $("#controls").attr('style') ) {
				return;
			}
			touchStartX = e.originalEvent.touches[0].pageX;
			touchStartY = e.originalEvent.touches[0].pageY;
			touching = true;
			$("#controls").css({
				'-webkit-transition': 'all 0s',
				'-o-transition': 'all 0s',
				'transition': 'all 0s'
			}).addClass('touching');
		});
		$(document).on('touchmove', function(e){
			if( touching ) {
				var ex = e.originalEvent.touches[0].pageX;
				var ey = e.originalEvent.touches[0].pageY;
				if( $(window).width() < 500 ) {
					var touchY = ( ey - $(window).height() - (touchStartY-($(window).height()-30)) ) / 150;
					console.log(touchY.toFixed(2));
					$("#controls").css({
						'-webkit-transform': 'translateY(' + (120 - (-120 * touchY)) + 'px)',
						'-o-transform': 'translateY(' + (120 - (-120 * touchY)) + 'px)',
						'transform': 'translateY(' + (120 - (-120 * touchY)) + 'px)'
					});
				}
			}
		}).on('touchend touchcancel touchstop', function(e){
			if( touching ) {
				touching = false;
				$("#controls").removeClass('touching').css({
					'-webkit-transition': '',
					'-o-transition': '',
					'transition': ''
				});
				reqFrame(function(){
					if( touchY < -1 || true ) {
						$("#controls").css({
							'-webkit-transform': '',
							'-o-transform': '',
							'transform': ''
						});
						$("#controls").css({
							'-webkit-transform': 'translateY(0)',
							'-o-transform': 'translateY(0)',
							'transform': 'translateY(0)'
						});
					} else {
					}
				});
			}
		})
	})();*/
	
	$("#ctrl-disp").click(function(){
		var that = this;
		reqFrame(function(){
			if( $(that).attr("value") == 'calc' ) {
				$("#outputs").addClass('calc').removeClass('graph');
			} else {
				$("#outputs").addClass('graph').removeClass('calc');
			}
		});
	});
	
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
	
	var eventVariableRemoveClick = function(e) {
		var variable = $(this).parent();
		variable.css({
			'-webkit-transform-origin': '50% 0',
			'-moz-transform-origin': '50% 0',
			'-ms-transform-origin': '50% 0',
			'-o-transform-origin': '50% 0',
			'transform-origin': '50% 0',
			'-webkit-transition': '-webkit-transform .3s cubic-bezier(.2,.3,0,1)',
			'-o-transition': '-o-transform .3s cubic-bezier(.2,.3,0,1)',
			'transition': 'transform .3s cubic-bezier(.2,.3,0,1)'
		});
		reqFrame(function(){
			variable.css({
				'-webkit-transform': 'scaleY(0)',
				'-ms-transform': 'scaleY(0)',
				'-o-transform': 'scaleY(0)',
				'transform': 'scaleY(0)'
			}).on('transitionend webkitTransitionEnd oTransitionEnd', function(){
				var key = variable.data('key');
				variable.remove();
				callRemoveVariable(key);
			});
		});
	}
	
	addedVariable = function(obj) {
		if( typeof obj != 'object' ) {
			throw new Error("Argument 0 must be an object");
		}
		$("#variables").addClass('bounce');
		setTimeout(function(){
			$("#variables").removeClass('bounce');
		},500);
		var variable = $(obj);
		variable.find(".variable-remove").on('click', eventVariableRemoveClick);
		
		var touching = false;
		var touchStartX = 0;
		var touchX = 0;
		variable.on('touchstart', function(e){
			touchStartX = e.originalEvent.touches[0].pageX - variable.offset().left;
			touchX = 0;
			touching = true;
		});
		$(document).on('touchmove', function(e){
			if( touching ) {
				if( variable.scrollLeft() <= 0 ) {
					e.preventDefault();
					var px = e.originalEvent.touches[0].pageX;
					touchX = px - $("#variables").offset().left - touchStartX;
					if( touchX < 0 ) {
						touchX = -Math.pow(Math.abs(touchX), 1/1.2);
					}
					variable.css('-webkit-transform','translateX(' + touchX + 'px)');
					variable.css('-o-transform','translateX(' + touchX + 'px)');
					variable.css('transform','translateX(' + touchX + 'px)');
					if( touchX > $("#variables").width() / 2 ) {
						variable.addClass('removePotential');
					} else {
						variable.removeClass('removePotential');
					}
				}
			}
		}).on('touchend', function(e){
			if( touching ) {
				touching = false;
				variable.css({
					'-webkit-transition': '-webkit-transform .3s cubic-bezier(.2,.3,0,1)',
					'-o-transition': '-o-transform .3s cubic-bezier(.2,.3,0,1)',
					'transition': 'transform .3s cubic-bezier(.2,.3,0,1)'
				});
				reqFrame(function(){
					function tEnd() {
						variable.off('transitionend webkitTransitionEnd oTransitionEnd', tEnd);
						if( touchX < 0 || touchX < $("#variables").width() / 2 ) {
							variable.css({
								'-webkit-transition': '',
								'-o-transition': '',
								'transition': ''
							});
						} else {
							callRemoveVariable(variable.data('key'));
							variable.remove();
						}
					}
					if( touchX < 0 || touchX < $("#variables").width() / 2 ) {
						variable.css({
							'-webkit-transform': '',
							'-o-transform': '',
							'transform': ''
						});
					} else {
						variable.css({
							'-webkit-transform': 'translateX(100%)',
							'-o-transform': 'translateX(100%)',
							'transform': 'translateX(100%)'
						});
					}
					variable.on('transitionend webkitTransitionEnd oTransitionEnd', tEnd);
				});
			}
		});
	}
});