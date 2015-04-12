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

/**
 * Based on http://mathjs.org/examples/browser/angle_configuration.html.html
 * */
var replacements = {};

// SET ANGLES
['cos', 'cosh', 'cot', 'coth', 'csc', 'csch', 'sec', 'sech', 'sin', 'sinh', 'tan', 'tanh'].forEach(function(name) {
	var fn = math[name]; // The original function

	replacements[name] = function replacement(x) {
		if(x instanceof math.type.BigNumber) {
			x = x.toNumber();
		}
		if(typeof x === 'boolean') {
			x = +x;
		}
		if(typeof x === 'number') {
			if(degRadVal === 'deg') {
				return fn(x / 360 * 2 * Math.PI);
			}
			else if(degRadVal === 'rad') {
				return fn(x);
			}
		}

		if(math.collection.isCollection(x)) {
			return math.collection.deepMap(x, replacement);
		}

		return fn(x);
	};
});
['acos', 'acosh', 'acot', 'acoth', 'acsc', 'acsh', 'asec', 'asech', 'asin', 'asinh', 'atan', 'atanh'].forEach(function(name) {
	var fn = math[name]; // The original function

	replacements[name] = function replacement(x) {
		var result = fn(x);

		if(typeof result === 'number') {
			if(degRadVal === 'deg') {
				return result / 2 / Math.PI * 360;
			}
			else if(degRadVal === 'rad') {
				return result;
			}
		}

		if(math.collection.isCollection(x)) {
			return math.collection.deepMap(x, replacement);
		}

		return result;
	};
});

// Import all replacements into math.js, overriding existing trigonometric functions
math.import(replacements, {override: true});