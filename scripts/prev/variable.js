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
					if( touchX < -40 && variable.data('type') == 'function' && $("#variables").hasClass('chkb') ) {
						variable.addClass('checkPotential');
					} else {
						variable.removeClass('checkPotential');
					}
				}
			}
		}).on('touchend', function(e){
			if( touching ) {
				touching = false;
				var wasChecked = variable.hasClass('checkPotential');
				variable.css({
					'-webkit-transition': '-webkit-transform .3s cubic-bezier(.2,.3,0,1)',
					'-o-transition': '-o-transform .3s cubic-bezier(.2,.3,0,1)',
					'transition': 'transform .3s cubic-bezier(.2,.3,0,1)'
				}).removeClass('checkPotential');
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
					if( touchX < -40 || touchX < $("#variables").width() / 2 ) {
						variable.css({
							'-webkit-transform': '',
							'-o-transform': '',
							'transform': ''
						});
						if( touchX < -40 && wasChecked && $("#variables").hasClass('chkb') ) {
							variable.find('.variable-check').prop('checked', !variable.find('.variable-check').prop('checked'));
							updateGraphFunctions();
						}
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
		variable.find('.variable-check').change(function(){
			if( variable.data('type') == 'function' ) {
				updateGraphFunctions();
			}
		});
	}
});