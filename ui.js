var addedVariable = function(){};
var onVariableRemove = function(){};
var callRemoveVariable = function(){};

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
			} else {
				if( val == 'enter' ) {
					$("#input").input({which:13});
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
				} else if( val == 'close' ) {
					$("#keyboard").addClass('hidden');
					$("#calculator").removeClass('keyboard');
				}
			}
		});
	});
	
	$("#input").on('touchend', function(e){
		e.preventDefault();
		$("#keyboard").removeClass('hidden');
		$("#calculator").addClass('keyboard');
	});
	
	$(".toggle-button").click(function(){
		$(this).toggleClass("switch");
		var value = $(this).find('.toggle-item:first-child').attr('value');
		if( $(this).hasClass('switch')) {
			value = $(this).find('.toggle-item:last-child').attr('value');
		}
		degRadVal = value;
		inputHandle();
		storage.data.degrad = value;
		$(this).attr('value', value );
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
	
	$("#ctrl-calc").click(function(){
		$("#outputs").addClass('calc').removeClass('graph');
	});
	$("#ctrl-graph").click(function(){
		$("#outputs").addClass('graph').removeClass('calc');
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
				text = text.substr(0,cursorPos) + bracketOpen + bracketClose + text.substring(cursorPos, text.length);
				$(this).val(text);
				$(this)[0].selectionStart = cursorPos + 1;
				$(this)[0].selectionEnd = cursorPos + 1;
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