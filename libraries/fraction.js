/**
 * Copyright 2015 Mia Nordentoft, Creeper32605
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

/*
* Source: http://codereview.stackexchange.com/questions/20969/convert-repeating-decimal-to-fraction
* */
function dec2frac(decimal, decimalBeforeRepeatLength) {
	// Improve the code quality with strict mode.
	"use strict";

	// Figure out decimal length automatically.
	var indexOfDot = decimal.toString().indexOf('.');
	var decimalLength = decimal.toString().length - indexOfDot - 1;

	var power1 = Math.pow(10, decimalLength);
	var power2 = Math.pow(10, decimalBeforeRepeatLength);
	var finalPower = power1 - power2;
	var decimal1 = decimal * power1;
	// Explicitly set a radix of '10' to avoid unpredicatable results.
	var decimal2 = parseInt(decimal * power2, 10);
	// Preferred option.
	decimal2 = Math.floor(decimal * power2);
	var finalDecimal = decimal1 - decimal2;
	var i = 0;

	var greatestCommonDivisor = function(a, b) {
		if (b === 0) {
			return a;
		}

		return greatestCommonDivisor(b, (a % b));
	};

	var gcd = greatestCommonDivisor(finalDecimal, finalPower);

	return [i, finalDecimal / gcd, finalPower / gcd];
}