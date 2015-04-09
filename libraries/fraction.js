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