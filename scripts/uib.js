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

mod.add('ui-base', {
	version: '0.1',
	author: 'EvalCalc',
	description: 'Base UI for EvalCalc'
}, function() {
	window.ui = {};

	if (!('jQuery' in window)) {
		alert('ui-base:\njQuery not found.');
		return;
	}

	$(document).ready(function(){
		console.log('UI initialising');
		$('body').append(ui.app = $('<div id="app"></div>'));
		ui.app.append(ui.calculator = $('<div id="calculator"></div>'));
		ui.calculator.append(ui.calculator.outputs = $('<div id="outputs"></div>'));
		ui.calculator.outputs.append(ui.calculator.outputs.math = $('<div class="output" id="output-math"></div>'));
		ui.calculator.outputs.math.append(ui.calculator.outputs.math.calc = $('<div class="output-field" id="calc-math"></div>'));
		ui.calculator.outputs.math.append(ui.calculator.outputs.math.results = $('<div class="output-field" id="calc-result"></div>'));
		ui.calculator.outputs.math.results.append(ui.calculator.outputs.math.results.fraction = $('<div class="output-result" id="calc-fraction"></div>'));
		ui.calculator.outputs.math.results.append(ui.calculator.outputs.math.results.exact = $('<div class="output-result" id="calc-exact"></div>'));
		ui.calculator.outputs.math.results.append(ui.calculator.outputs.math.results.approx = $('<div class="output-result" id="calc-approx"></div>'));
		ui.calculator.append(ui.calculator.input = $('<div id="input"></div>'));
		ui.calculator.input.append(ui.calculator.input.input = $('<input id="input-n" type="text" spellcheck="false" autocomplete="off">'));
		ui.calculator.input.append(ui.calculator.input.buttons = $('<div id="input-buttons">'));
		ui.calculator.input.buttons.append(ui.calculator.input.buttons.keyboard = $('<button id="input-keyboard">KBD</button>'));
		ui.calculator.input.buttons.append(ui.calculator.input.buttons.tidy = $('<button id="input-tidy">TIDY</button>'));
		ui.app.append(ui.variables = $('<div id="variables" class="hidden"></div>'));
		ui.variables.append(ui.variables.header = $('<header id="variables-header"></header>'));
		ui.variables.header.append(ui.variables.header.toggle = $('<button id="variables-toggle">V</button>'));
		ui.variables.header.append(ui.variables.header.search = $('<div id="variables-search"></div>'));
		ui.variables.header.search.append(ui.variables.header.search.input = $('<input type="search" id="vsearch-input" placeholder="Search">'));
		ui.variables.header.append(ui.variables.header.clear = $('<button id="variables-clear">CLR</button>'));

		ui.calculator.outputs.math.calc.addClass('tjax');
		ui.calculator.outputs.math.results.fraction.addClass('tjax');
		ui.calculator.outputs.math.results.exact.addClass('tjax');
		ui.calculator.outputs.math.results.approx.addClass('tjax');

		ui.calculator.input.input.on('input', function() {
			calc.handle($(this).val());
		}).keydown(function(e) {
			if (e.which == 13) {
				calc.tryAssignVariable($(this).val());
			}
		});
		ui.calculator.input.buttons.tidy.click(function() {
			var value = ui.calculator.input.input.val();
			var output;
			var valid = true;
			try {
				output = math.parse(value).toString();
			} catch(e) {
				valid = false;
			}
			if(valid) {
				if(output === 'undefined')
					output = '';
			}
		});

		ui.variables.header.toggle.click(function() {
			ui.variables.setOpen(!ui.variables.getOpen());
			updateMenu();
		});

		ui.variables.setOpen = function(open) {
			ui.variables.toggleClass('hidden', !open);
			ui.calculator.toggleClass('variablesOpen', open);
		};
		ui.variables.getOpen = function() {
			return !ui.variables.hasClass('hidden');
		}

		var lastWindowWidth = 0;
		$(window).resize(function() {
			if (lastWindowWidth < 1600 && $(window).width() >= 1600) {
				updateMenu();
				ui.variables.addClass('hidden');
				ui.calculator.removeClass('variablesOpen');
			} else if (lastWindowWidth >= 1600 && $(window).width() < 1600) {
				updateMenu();
				ui.variables.addClass('hidden');
				ui.calculator.removeClass('variablesOpen');
			}
			lastWindowWidth = $(window).width();
		});
	});
});
