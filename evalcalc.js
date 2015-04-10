var inputLastPress;
var scope = {}; // Stored variables
var oldScope = {}; // We reset the scope unless the user clicks enter

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
			oldScope = $.extend({}, scope);

			updateVariables(scope);
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
		input.val(output);
	}
});

function inputHandle() {
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
		$('#output').removeClass('error');

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

			if(value.indexOf("=") === -1 || !value.match(/^(?:[a-z] *= *[0-9.]+|[0-9.]+ *= *[a-z])$/i)) { // If there's no equals sign, or there's no math involved in a variable (definition)
				// TODO: Change this to a recursive loop that checks output to see if everything's AssignmentNodes or the like
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
		$('#output').addClass('error');
	}
}

function updateVariables(scope) {
	// TODO: Update #variables
}