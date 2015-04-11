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

var inputLastPress;
var scope = {}; // Stored variables
var oldScope = {}; // We reset the scope unless the user clicks enter
var stringScope = {}; // Sometimes the data types math.js provides just aren't good enough. This is the case for functions for example.

$(document).ready(function(){
	$('#input').on('input', function() {
		clearTimeout(inputLastPress);
		inputLastPress = setTimeout(inputHandle, 300); // 300ms delay between keystrokes before calculations. Increase if this causes lag
	});

	$('#input').keydown(function(e) {
		if(e.which === 13) {
			var value = $('#input').val();
			var output, eval;
			var valid = true;

			try {
				output = math.parse(value);
				eval = output.compile(math).eval(scope);
			} catch(e) {
				valid = false;
			}

			if(valid) {
				// Only allow latin letters to be assigned a value. Excluding e and i.
				$.each(scope, function(key) {
					if(!key.match(/^[a-z]$/i)) {
						delete scope[key];
						delete stringScope[key];
					}
				});

				updateVariables(scope, oldScope, stringScope, output);

				oldScope = $.extend({}, scope);
			}
		}
	});

	$('#tidy-btn').click(function() {
		var input = $('#input');
		var value = input.val();

		var output, eval;
		var valid = true;

		try {
			output = math.parse(value).toString();
		} catch(e) {
			valid = false;
		}

		if(valid) {
			if(output === 'undefined')
				output = '';

			input.val(output);
		}
	});
});
var onInputHandle = function(){};
var callInputHandle = function(){};
(function(){
	var inputHandleListeners = [];
	onInputHandle = function(f) {
		if( typeof f != 'function' ) {
			throw new Error("Argument 0 must be a function");
		}
		inputHandleListeners.push(f);
	}
	callInputHandle = function(){
		for( var i in inputHandleListeners ) {
			try {
				inputHandleListeners[i]();
			} catch(err) {
				throw err;
			}
		}
	}
})();

function inputHandle() {
	var value = $('#input').val();
	var output, eval;
	var valid = true;

	if(value === '') {
		$('#outputMath,#outputResult>div').html('');
	}
	else {
		try {
			output = math.parse(value);
			eval = output.compile(math).eval(scope);
		} catch(e) {
			valid = false;
		}
		callInputHandle();

		if(valid) {
			$('#output-calc').removeClass('error');

			// We "fix" floating point errors by using rounding
			var answer = math.format(eval, {precision: 14});

			var base = Math.floor(answer).toString();
			var baseLength = base.length;
			var baseLengthLiteral = baseLength;
			var decimalLength = answer.substr(baseLengthLiteral + 1).length;

			if(base === "0")
				baseLength = 0;


			if(answer != "undefined") {
				var tex = generateTeX(output, null);

				var infinite = answer.match(/^(\d*)\.(?:([1-4])\2+$|(5)5+6|(6)6+7)|(7)7+8|(8)8+9$/);
				var fractionInfinite = answer.match(/^\d*\.(?:(\d)\1*(?!\1+)\d+|[0-4]+)$/);

				var exact, approx, fraction, fractionArr, fractionLookForward, fractionInput;

				if(decimalLength >= 3 && fractionInfinite) {
					if(infinite)
						fractionInput = parseFloat(answer.substr(0, answer.toString().length - 1));
					else
						fractionInput = answer;

					if(infinite)
						fractionLookForward = decimalLength - 2;
					else
						fractionLookForward = decimalLength + 1;

					fractionArr = dec2frac(fractionInput, fractionLookForward);

					if(fractionArr[0] < 50 && fractionArr[1] < 50)
						fraction = "= \\frac{" + fractionArr[1] + "}{" + fractionArr[2] + "}";
				}

				var isAssignments = false;
				output.traverse(function(node) {
					if(node.type === 'FunctionAssignmentNode' || node.type === 'AssignmentNode') {
						isAssignments = true;
						return false;
					}
				});

				if(!isAssignments) {
					if(!infinite)
						exact = "= " + answer;
					else
						exact = "= " + answer.substr(0, baseLengthLiteral + 1) + "\\bar{" + answer.substr(baseLengthLiteral + 1, 1) + "}";
				}


				var rounded = math.format(eval, {precision: Math.min(3 + baseLength, 13)});
				if(rounded !== answer && !infinite) {
					approx = " \\approx " + rounded;
				}


				katex.render(tex, $('#outputMath')[0], {displayMode: true});

				if(fraction !== undefined)
					katex.render(fraction, $('#outputFraction')[0], {displayMode: true});
				else
					$('#outputFraction').html('');

				if(exact !== undefined)
					katex.render(exact, $('#outputExact')[0], {displayMode: true});
				else
					$('#outputExact').html('');

				if(approx !== undefined)
					katex.render(approx, $('#outputApprox')[0], {displayMode: true});
				else
					$('#outputApprox').html('');



				// Reset variables to how it was before
				scope = $.extend({}, oldScope); // Clone, JavaScript is silly
			}
		}
		else {
			$('#output-calc').addClass('error');
		}

		var isEmpty = false;

		if($('#outputMath').is(':empty'))
			if($('#outputResult>div').is(':empty'))
				isEmpty = true;

		$('#output-calc').toggleClass('empty', isEmpty);
	}
}

function updateVariables(scope, oldScope, stringScope, parse) {
	scope = sortObjectByKey(scope);


	// Find all FunctionAssignmentNodes in parse
	parse.traverse(function(node) {
		if(node.type === 'FunctionAssignmentNode') {
			stringScope[node.name] = [
				node.params.join(', '),
				node.expr.toString()
			];
		}
	});


	$.each(scope, function(variable, value) {
		var type = typeof value;
		var fullString = variable + " = " + value.toString();

		if(type === 'function') {
			fullString = variable + "(" + stringScope[variable][0] + ") = " + stringScope[variable][1];
			value = stringScope[variable][1];
		}

		if(oldScope[variable] === undefined) { // Adding new variable
			var el = $('<div></div>');

			el.addClass('variable');
			el.attr('data-key', variable);
			el.attr('data-value', value);
			el.attr('data-type', type);

			el.html(
				'<div class="variable-remove"></div>' +
				'<div class="variable-render"></div>'
			);

			// Insert the div into #variables, sorted by data-key
			var otherVars = $("#variables>div");

			if(otherVars.length) {
				otherVars = otherVars.get().reverse();
				var inserted = false;

				$.each(otherVars, function() {
					if($(this).attr('data-key').charCodeAt(0) < variable.charCodeAt(0)) {
						el.insertAfter(this);
						inserted = true;

						return false;
					}
				});

				if(!inserted)
					$('#variables').append(el);
			}
			else {
				$('#variables').prepend(el);
			}

			var el = $('#variables>div[data-key=' + variable + ']');

			var tex = generateTeX(math.parse(fullString), null);

			katex.render(tex, el.children('.variable-render')[0], {displayMode: true});

			// Call the UI equivalent of this function, that updates event listeners
			addedVariable(el)
		}
		else { // Updating old variable
			var el = $('#variables>div[data-key=' + variable + ']');

			el.attr('data-value', value);

			var tex = generateTeX(math.parse(fullString), null);

			katex.render(tex, el.children('.variable-render')[0], {displayMode: true});
		}
	});
}

onVariableRemove(function(key){
	delete scope[key];
	delete oldScope[key];
	delete stringScope[key];
});

/**
 * Return an Object sorted by it's Key
 *
 * From: http://stackoverflow.com/a/12834464/1248084
 */
function sortObjectByKey(obj){
	var keys = [];
	var sorted_obj = {};

	for(var key in obj) {
		if(obj.hasOwnProperty(key)) {
			keys.push(key);
		}
	}

	// Sort keys
	keys.sort();

	// Create new array based on sorted keys
	jQuery.each(keys, function(i, key) {
		sorted_obj[key] = obj[key];
	});

	return sorted_obj;
}