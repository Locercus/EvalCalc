// I'm not using .toTex() function, as it oftentimes generates invalid LaTeX.

// s = (3 * 4) / (sqrt(2) * sin(30deg)) + 5
// 4 / 5 + 3
function generateTeX(node, parent) {
	switch(node.type) {
		case 'ArrayNode': {
			var args = [];

			$.each(node.nodes, function() {
				args.push(generateTeX(this, node));
			});

			return "[" + args.join(", ") + "]";
		}
		case 'AssignmentNode': {
			return node.name + " = " + generateTeX(node.expr);
		}
		case 'BlockNode': {
			var args = [];

			$.each(node.blocks, function() {
				args.push(generateTeX(this.node, node));
			});

			return args.join('; ');
		}
		case 'ConstantNode': {
			var value = node.value;
			switch(node.valueType) {
				case 'number': {
					return value;
				}
				default: {
					throw node.type + " " + node.valueType + " has not been implemented";
				}
			}
		}
		case 'FunctionAssignmentNode': {
			var value = generateTeX(node.expr, node);
			return node.name + "(" + node.params.join(", ") + ") = " + value;
		}
		case 'FunctionNode': {
			var args = [];

			$.each(node.args, function() {
				args.push(generateTeX(this, node));
			});

			switch(node.name) {
				case 'abs': {
					return '|' + args[0] + '|';
				}
				case 'acos': {
					return '\\cos^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'acosh': {
					return '\\cosh^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'acot': {
					return '\\cot^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'acoth': {
					return '\\coth^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'acsc': {
					return '\\csc^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'acsch': {
					return '\\text{csch}^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'add': {
					return args[0] + ' + ' + args[1];
				}
				case 'and': {
					return args[0] + ' \\land ' + args[1];
				}
				case 'arg': {
					return '\\arg\\left(' + args[0] + '\\right)';
				}
				case 'asec': {
					return '\\sec^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'asech': {
					return '\\text{sech}^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'asin': {
					return '\\sin^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'asinh': {
					return '\\sinh^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'atan': {
					return '\\tan^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'atan2': {
					return '\\text{atan2}\\left(' + args[0] + ", " + args[1] + '\\right)';
				}
				case 'atanh': {
					return '\\tanh^{-1}\\left(' + args[0] + '\\right)';
				}
				case 'bignumber': {
					return '\\text{bignumber}\\left(' + args[0] + '\\right)';
				}
				case 'bitAnd': {
					return args[0] + "\\ \\&\\ " + args[1];
				}
				case 'bitNot': {
					return '\\neg\\left(' + args[0] + '\\right)';
				}
				case 'bitOr': {
					return args[0] + '\\ \\vee\\ ' + args[1];
				}
				case 'bitXor': {
					return args[0] + "\\ \\oplus\\ " + args[1];
				}
				case 'boolean': {
					return '\\text{boolean}\\left(' + args[0] + '\\right)';
				}
				case 'ceil': {
					return '\\lceil' + args[0] + '\\rceil';
				}
				case 'chain': {
					return '\\text{chain}(' + args[0] + ')';
				}
				case 'clone': {
					return '\\text{clone}(' + args[0] + ')';
				}
				case 'combinations': {
					return '\\frac{' + args[0] + '!}{' + args[1] + '!( ' + args[0] + ' - ' + args[1] + ' )!' + '}';
				}
				case 'compare': {
					return '\\text{compare}(' + args[0] + ', ' + args[1] + ')'
				}
				case 'compile': {
					return '\\text{compile}(' + args[0] + ')';
				}
				case 'complex': {
					return '\\text{complex}(' + args[0] + ', ' + args[1] + ')'
				}
				case 'conj': {
					return '\\text{conj}\\left(' + args[0] + '\\right)';
				} // This is where I left off
				case 'sin': {
					return '\\sin\\left(' + args[0] + '\\right)';
				}
				case 'sqrt': {
					return '\\sqrt{' + args[0] + '}';
				}
				default: {
					throw node.type + " " + node.name + " has not been implemented";
				}
			}
		}
		case 'OperatorNode': {
			var args = [];

			$.each(node.args, function() {
				args.push(generateTeX(this, node));
			});

			switch(node.fn) {
				case 'add': {
					if(parent !== null && parent.type === 'OperatorNode' && parent.fn === 'multiply')
						return '\\left(' + args[0] + " + " + args[1] + "\\right)";
					else
						return args[0] + " + " + args[1];
				}
				case 'divide': {
					return '\\frac{' + args[0] + '}{' + args[1] + '}';
				}
				case 'multiply': {
					// Hotfix for degrees
					var secondArgument = node.args[1];
					if(secondArgument.type === 'SymbolNode' && secondArgument.name === 'deg')
						return args[0] + args[1];

					return args[0] + ' \\cdot ' + args[1];
				}
				case 'subtract': {
					if(parent !== null && parent.type === 'OperatorNode' && parent.fn === 'multiply')
						return '\\left(' + args[0] + " - " + args[1] + "\\right)";
					else
						return args[0] + " - " + args[1];
				}
				default: {
					throw node.type + " " + node.fn + " has not been implemented";
				}
			}
		}
		case 'SymbolNode': {
			if(node.name.match(/^[a-z]$/i))
				return node.name;

			switch(node.name) {
				case 'deg': {
					return '^{\\circ}';
				}
				default: {
					throw node.type + " " + node.name + " has not been implemented";
				}
			}
		}
		default: {
			throw node.type + " has not been implemented";
		}
	}
}