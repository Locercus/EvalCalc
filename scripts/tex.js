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


function escapeTeX(tex) {
	return tex.
		replace('#', '\\#').
		replace('$', '\\$').
		replace('%', '\\%').
		replace('^', '\\^{}').
		replace('&', '\\&').
		replace('_', '\\_').
		replace('{', '\\{').
		replace('}', '\\}').
		replace('~', '\\~{}').
		replace('\\', '\\textbackslash{}');
}

// I'm not using .toTex() function, as it oftentimes generates invalid LaTeX.

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
			var args = ['','','','','','','','','',''];

			for (var i in node.args) {
				args[i] = (generateTeX(node.args[i], node));
			}

			if(node.name.match(/^[a-z]$/i))
				return node.name + "\\left(" + args.join(', ') + '\\right)';

			switch(node.name) {
				// Arithmetic
				case 'abs': {
					return '|' + args[0] + '|';
				}
				case 'add': {
					return '\\left(' + args[0] + ' + ' + args[1] + '\\right)';
				}
				case 'ceil': {
					return '\\lceil' + args[0] + '\\rceil';
				}
				case 'cube': {
					return args[0] + '^3';
				}
				case 'divide': {
					return '\\frac{' + args[0] + '}{' + args[1] + '}';
				}
				case 'exp': {
					return '\\exp\\left(' + args[0] + '\\right)';
				}
				case 'fix': {
					return '\\text{fix}\\left(' + args[0] + '\\right)';
				}
				case 'floor': {
					return '\\lfloor' + args[0] + '\\rfloor';
				}
				case 'gcd': {
					return '\\gcd\\left(' + args.join(', ') + '\\right)';
				}
				case 'lcm': {
					return '\\text{lcm}\\left(' + args.join(', ') + '\\right)';
				}
				case 'log': {
					if(args.length === 1)
						return '\\log\\left(' + args[0] + '\\right)';
					else
						return '\\log_{' +args[1] + '}\\left(' + args[0] + '\\right)';
				}
				case 'log10': {
					return '\\log_{10}\\left(' + args[0] + '\\right)';
				}
				case 'mod': {
					return args[0] + '\\ \\%\\ ' + args[1];
				}
				case 'multiply': {
					return args[0] + ' \\cdot ' + args[1];
				}
				case 'norm': {
					return '\\text{norm}\\left(' + args.join(', ') + '\\right)';
				}
				case 'nthRoot': {
					return '\\sqrt[' + args[1] + ']{' + args[0] + '}';
				}
				case 'pow': {
					return args[0] + '^{' + args[1] + '}';
				}
				case 'round': {
					return '\\text{round}\\left(' + args.join(', ') + '\\right)';
				}
				case 'sign': {
					return '\\text{sign}\\left(' + args.join(', ') + '\\right)';
				}
				case 'sqrt': {
					return '\\sqrt{' + args[0] + '}';
				}
				case 'square': {
					return args[0] + '^2';
				}
				case 'subtract': {
					return '\\left(' + args[0] + ' - ' + args[1] + '\\right)';
				}
				case 'unaryMinus': {
					return '\\left(-' + args[0] + '\\right)';
				}
				case 'unaryPlus': {
					return args[0];
				}
				case 'xgcd': {
					return '\\text{xgcd}\\left(' + args.join(', ') + '\\right)';
				}


				// Complex
				case 'arg': {
					return '\\arg\\left(' + args[0] + '\\right)';
				}
				case 'conj': {
					return '\\text{conj}\\left(' + args[0] + '\\right)';
				}
				case 'im': {
					return '\\text{im}\\left(' + args.join(', ') + '\\right)';
				}
				case 're': {
					return '\\text{re}\\left(' + args.join(', ') + '\\right)';
				}


				// Trigonometry
				case 'acos':
				case 'acosh':
				case 'acot':
				case 'acoth':
				case 'acsc':
				case 'acsch':
				case 'asec':
				case 'asech':
				case 'asin':
				case 'asinh':
				case 'atan':
				case 'atanh':
				case 'cos':
				case 'cosh':
				case 'cot':
				case 'coth':
				case 'csc':
				case 'csch':
				case 'sec':
				case 'sech':
				case 'sin':
				case 'sinh':
				case 'tan':
				case 'tanh': {
					if(calc.degRad === 'deg')
						return '\\text{' + node.name + '}_{_{_{_{_{\\llap{\\,360^{\\circ}}}}}}}\\!\\!\\left(' + args.join(',') + '\\right)';
					else
						return '\\text{' + node.name + '}_{_{_{_{_{\\llap{2\\pi\\enspace}}}}}}\\!\\!\\left(' + args.join(',') + '\\right)';
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
					if(parent != null && parent.type === 'OperatorNode' && (
						parent.fn === 'multiply' || parent.fn === 'pow'
						))
						return '\\left(' + args[0] + " + " + args[1] + "\\right)";
					else
						return args[0] + " + " + args[1];
				}
				case 'divide': {
					if(parent != null && parent.type === 'OperatorNode' && parent.fn === 'pow')
						return '\\left(\\frac{' + args[0] + '}{' + args[1] + '}\\right)';
					else
						return '\\frac{' + args[0] + '}{' + args[1] + '}';
				}
				case 'multiply': {
					// Hotfix for degrees
					var secondArgument = node.args[1];
					if(secondArgument.type === 'SymbolNode' && secondArgument.name === 'deg')
						return args[0] + args[1];

					if(parent != null && parent.type === 'OperatorNode' && parent.fn === 'pow')
						return '\\left(' +  args[0] + ' \\cdot ' + args[1] + '\\right)';
					else
						return args[0] + ' \\cdot ' + args[1];
				}
				case 'subtract': {
					if(parent != null && parent.type === 'OperatorNode' && (
						parent.fn === 'multiply' || parent.fn === 'pow'
						))
						return '\\left(' + args[0] + " - " + args[1] + "\\right)";
					else
						return args[0] + " - " + args[1];
				}
				case 'unaryPlus': {
					return '+' + args[0];
				}
				case 'unaryMinus': {
					return '\\left(-' + args[0] + '\\right)';
				}
				case 'dotMultiply': {
					if(parent != null && parent.type === 'OperatorNode' && parent.fn === 'pow')
						return '\\left(' + args[0] + ' \\circ ' + args[1] + '\\right)';
					else
						return args[0] + ' \\circ ' + args[1];
				}
				case 'dotDivide': {
					if(parent != null && parent.type === 'OperatorNode' && parent.fn === 'pow')
						return '\\left(' + args[0] + ' \\oslash ' + args[1] + '\\right)';
					else
						return args[0] + ' \\oslash ' + args[1];
				}
				case 'factorial': {
					return args[0] + "!";
				}
				case 'pow': {
					return '{' + args[0] + '}^{' + args[1] + '}';
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
				case 'Infinity': {
					return '\\infty';
				}
				case 'pi':
				case 'PI': {
					return '\\pi';
				}
				case 'LN2': {
					return '\\ln(2)';
				}
				case 'LN10': {
					return '\\ln(10)';
				}
				case 'LOG2E': {
					return '\\log(E, 10)';
				}
				case 'LOG10E': {
					return '\\ln(E)';
				}
				case 'phi': {
					return '\\phi';
				}
				case 'SQRT1_2': {
					return '\\sqrt{\\frac{1}{2}}';
				}
				case 'SQRT2': {
					return '\\sqrt{2}';
				}
				case 'tau': {
					return '\\tau';
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
