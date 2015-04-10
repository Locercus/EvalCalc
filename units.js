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
['acos', 'acosh', 'acot', 'acoth', 'acsc', 'acsh', 'asec', 'asech', 'asin', 'asinh', 'atan', 'atan2', 'atanh'].forEach(function(name) {
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