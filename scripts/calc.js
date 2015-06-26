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

mod.add('calc', {
	version: '0.1',
	author: 'EvalCalc',
	description: 'Input-to-Output calculator'
}, function() {
	window.calc = {
		degRad: 'rad'
	};
	window.scope = {};
	window.oldScope = {};
	window.stringScope = {};
	window.graphFunctions = {};

	calc.tryAssignVariable = function(value) {
		var output, qeval;
		var valid = true;

		try {
			output = math.parse(value);
			qeval = output.compile(math).eval(scope);
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
	};

	calc.handle = function(value) {
		var valid = true;

		value = value.replace(/infty/g, 'Infinity');
		value = value.replace(/infinity/g, 'Infinity');

		$('#output-math').removeClass('error');	
		if (value === '') {
			$('#calc-math, #calc-result > div').html('');
		} else {
			var output;
			var qeval;
			try {
				output = math.parse(value);
				qeval = output.compile(math).eval(scope);
			} catch (err) {
				valid = false;
			}
			if (!valid) {
				$('#output-math').addClass('error');
			} else {
				// We "fix" floating point errors by rounding
				var answer = math.format(qeval, {precision: 14});

				var base = Math.floor(answer).toString();
				var baseLength = base.length;
				var baseLengthLiteral = baseLength;
				var decimalLength = answer.substr(baseLengthLiteral + 1).length;

				if (base === '0')
					baseLength = 0;
				
				if (answer !== undefined) {
					var tex = generateTeX(output, null);

					var infinite = answer.match(/^(\d*)\.(?:([1-4])\2+$|(5)5+6|(6)6+7|(7)7+8|(8)8+9)$/);
					var fractionInfinite = answer.match(/^\d*\.(?:(\d)\1*(?!\1+)\d+|[0-4]+)$/);

					var exact, approx, fraction, fractionArr, fractionLookForward, fractionInput;

					if (decimalLength >= 3 && fractionInfinite) {
						if (infinite) {
							fractionInput = parseFloat(answer.substr(0, answer.toString().length - 1));
							fractionLookForward = decimalLength - 2;
						} else {
							fractionInput = answer;
							fractionLookForward = decimalLength + 1;
						}
						fractionArr = dec2frac(fractionInput, fractionLookForward);

						if (fractionArr[0] < 50 && fractionArr[1] < 50)
							fraction = '= \\frac{' + fractionArr[1] + '}{' + fractionArr[2] + '}';
					}

					var isAssignment = false;
					output.traverse(function(node) {
						if(node.type === 'FunctionAssignmentNode' || node.type === 'AssignmentNode') {
							isAssignment = true;
							return false;
						}
					});

					if (!isAssignment) {
						if (!infinite)
							exact = "= " + answer;
						else {
							exact = "= " + answer.substr(0, baseLengthLiteral + 1) + '\\bar{' +
								answer.substr(baseLengthLiteral + 1, 1) + '}';
						}
					}

					var rounded = math.format(qeval, {precision: Math.min(3 + baseLength, 13)});
					if (rounded !== answer && !infinite)
						approx = ' \\approx ' + rounded;

					katex.render(tex, $('#calc-math')[0], {displayMode: true});
					if (fraction !== undefined)
						katex.render(fraction, $('#calc-fraction')[0], {displayMode: true});
					else
						$('#calc-fraction').empty();
					if (exact !== undefined) {
						exact = exact.replace(/Infinity/g, '\\infty');
						katex.render(exact, $('#calc-exact')[0], {displayMode: true});
					} else
						$('#calc-exact').empty();
					if (approx !== undefined)
						katex.render(approx, $('#calc-approx')[0], {displayMode: true});
					else
						$('#calc-approx').empty();

					// reset variables to how it was before
					scope = $.extend({}, oldScope); // clone, JavaScript is silly
				}
			}
		}
	};
});