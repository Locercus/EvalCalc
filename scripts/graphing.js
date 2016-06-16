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

mod.add('graphing', {
	author: 'Locercus',
	version: '0.1',
	description: 'Interface for drawing graphs on a canvas',
	dependencies: [],
	styles: []
}, function(){
	var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
	if (CP && CP.lineTo){
		CP.dashedLine = function(x,y,x2,y2,dashArray){
			if (!dashArray) dashArray=[10,5];
			if (dashLength==0) dashLength = 0.001; // Hack for Safari
			var dashCount = dashArray.length;
			this.moveTo(x, y);
			var dx = (x2-x), dy = (y2-y);
			var slope = dx ? dy/dx : 1e15;
			var distRemaining = Math.sqrt( dx*dx + dy*dy );
			var dashIndex=0, draw=true;
			while (distRemaining>=0.1){
				var dashLength = dashArray[dashIndex++%dashCount];
				if (dashLength > distRemaining) dashLength = distRemaining;
				var xStep = Math.sqrt( dashLength*dashLength / (1 + slope*slope) );
				if (dx<0) xStep = -xStep;
				x += xStep;
				y += slope*xStep;
				this[draw ? 'lineTo' : 'moveTo'](x,y);
				distRemaining -= dashLength;
				draw = !draw;
			}
		};
	}

	var graphing = {};

	graphing.dpr = function(i) {
		return i * (window.devicePixelRatio || 1);
	};
	// The value of 1 pixel on a retina display
	graphing.pxdpr = 1 / (window.devicePixelRatio || 1);


	graphing.Graph = function(options, f, canvas) {
		if(!(options instanceof Object && !(options instanceof Array)))
			throw "options must be an object";

		if(!(f instanceof  Array))
			throw "f must be an array";

		if(canvas instanceof HTMLElement)
			canvas = $(canvas);
		if(canvas instanceof jQuery) {
			if(!(canvas.is('div') && canvas.children('canvas').length))
				throw "canvas must be a div containing a canvas";
		}
		else
			throw "canvas must be a DOM or jQuery object";

		this.options = options;
		this.f = f;
		this.canvas = canvas;

		this.updateGraph();
	};
	graphing.Graph.prototype.setOptions = function(options) {
		if(!(options instanceof Object && !(options instanceof Array)))
			throw "options must be an object";

		for(var key in options)
			this.options = options[key];

		this.updateGraph();
	};
	graphing.Graph.prototype.removeOptions = function(options) {
		if(!(options instanceof Array))
			throw "options must be an array";

		for(var key in options)
			delete options[key];

		this.updateGraph();
	};
	graphing.Graph.prototype.updateGraph = function() {
		var o           = this.options;
		var functions   = this.f;
		var c           = this.canvas.children('canvas');
		var div         = this.canvas;
		var cx          = c[0].getContext('2d');
		var dpr         = graphing.dpr;
		var w           = c.width();
		var h           = c.height();

		cx.clearRect(0, 0, dpr(w), dpr(h));
		div.children(':not(canvas)').remove();

		// Set default values
		o.xAxis          = (o.xAxis != null ? o.xAxis : true);
		o.xmin           = (o.xmin || -2);
		o.xmax           = (o.xmax || 10);
		o.xlabelType     = (o.xlabelType || 'plaintext');
		o.xlabel         = (o.xlabel || '');
		o.xAxisArrow     = (o.xAxisArrow || 'both');
		o.xAxisThickness = (o.xAxisThickness || 1);
		o.xAxisColor     = (o.xAxisColor || 'gray');

		o.yAxis          = (o.yAxis != null ? o.yAxis : true);
		o.ymin           = (o.ymin || -2);
		o.ymax           = (o.ymax || 10);
		o.ylabelType     = (o.ylabelType || 'plaintext');
		o.ylabel         = (o.ylabel || '');
		o.yAxisArrow     = (o.yAxisArrow || 'both');
		o.yAxisThickness = (o.yAxisThickness || 1);
		o.yAxisColor     = (o.yAxisColor || 'gray');

		o.grid           = (o.grid || 'both');
		o.gridThickness  = (o.gridThickness || .5);
		o.gridColor      = (o.gridColor || '#d4d4d4');
		o.gridHalf       = (o.gridHalf != null ? o.gridHalf : true);
		o.gridHalfColor  = (o.gridHalfColor || '#d4d4d4');

		o.legend         = (o.legend != null ? o.legend : true);
		o.legendCoords   = (o.legendCoords || [32, 32]);

		// Calculate pixels/unit
		var pixelsPerX = (w / (Math.abs(o.xmax) + Math.abs(o.xmin)));
		var pixelsPerY = (h / (Math.abs(o.ymax) + Math.abs(o.ymin)));

		// Calculate the y-coordinate of the x-axis
		var xAxisY = pixelsPerY * Math.abs(o.ymax);

		// Calculate the x-coordinate of the y-axis
		var yAxisX = pixelsPerX * Math.abs(o.xmin);

		// Create convenience functions for converting axis units to pixels
		function px2x(px) {
			return (px - yAxisX) / pixelsPerX;
		}
		function px2y(px) {
			return (px + xAxisY) / pixelsPerY;
		}
		function x2px(x) {
			return x * pixelsPerX + yAxisX;
		}
		function y2px(y) {
			return h - (y * pixelsPerY) - (h - xAxisY);
		}

		// Draw the grid
		if(o.grid !== 'none') {
			cx.beginPath();
			// Draw the vertical grid
			if(o.grid === 'vertical' || o.grid === 'both') {
				for(var x = o.xmin; x < o.xmax; x++) {
					var pxX = dpr(x2px(x));
					cx.moveTo(pxX, 0);
					cx.lineTo(pxX, dpr(h));
				}
			}

			// Draw the horizontal grid
			if(o.grid === 'horizontal' || o.grid === 'both') {
				for(var y = o.ymin; y < o.ymax; y++) {
					var pxY = dpr(y2px(y));
					cx.moveTo(0, pxY);
					cx.lineTo(dpr(w), pxY);
				}
			}

			cx.lineWidth = dpr(o.gridThickness);
			cx.strokeStyle = o.gridColor;
			cx.stroke();
		}

		// Draw the half grid
		if(o.gridHalf) {
			// Draw the vertical half grid
			if(o.grid === 'vertical' || o.grid === 'both') {
				for(var x = o.xmin + .5; x < o.xmax; x++) {
					var pxX = dpr(x2px(x));
					cx.dashedLine(pxX, 0, pxX, dpr(h));
				}
			}

			// Draw the horizontal half grid
			if(o.grid === 'horizontal' || o.grid === 'both') {
				for(var y = o.ymin + .5; y < o.ymax; y++) {
					var pxY = dpr(y2px(y));
					cx.dashedLine(0, pxY, dpr(w), pxY);
				}
			}

			cx.lineWidth = dpr(Math.max(o.gridThickness / 2,.5));
			cx.strokeStyle = o.gridHalfColor;
			cx.stroke();
		}

		// Draw the x-axis
		if(o.xAxis) {
			cx.beginPath();

			// Calculate the x-axis arrow offset
			var xAxisArrowLeftOffset, xAxisArrowRightOffset;
			xAxisArrowLeftOffset = xAxisArrowRightOffset = 0;
			if(o.xAxisArrow === 'both')
				xAxisArrowLeftOffset = xAxisArrowRightOffset = 15;
			else if(o.xAxisArrow === 'left')
				xAxisArrowLeftOffset = 15;
			else if(o.xAxisArrow === 'right')
				xAxisArrowRightOffset = 15;

			// Draw the x-axis line
			cx.moveTo(dpr(xAxisArrowLeftOffset), dpr(xAxisY));
			cx.lineTo(dpr(w - xAxisArrowRightOffset), dpr(xAxisY));

			// Draw the x-axis arrow heads
			if(o.xAxisArrow === 'both' || o.xAxisArrow === 'left')
				canvasArrow(cx, dpr(xAxisArrowLeftOffset), dpr(xAxisY), dpr(xAxisArrowLeftOffset - 1), dpr(xAxisY), dpr(10));
			if(o.xAxisArrow === 'both' || o.xAxisArrow === 'right')
				canvasArrow(cx, dpr(w - xAxisArrowRightOffset), dpr(xAxisY), dpr(w - xAxisArrowRightOffset + 1), dpr(xAxisY), dpr(10));


			cx.lineWidth = dpr(o.xAxisThickness);
			cx.strokeStyle = o.xAxisColor;
			cx.stroke();
		}

		// Draw the y-axis
		if(o.yAxis) {
			cx.beginPath();

			// Calculate the y-axis arrow offset
			var yAxisArrowTopOffset, yAxisArrowBottomOffset;
			yAxisArrowTopOffset = yAxisArrowBottomOffset = 0;
			if(o.yAxisArrow === 'both')
				yAxisArrowTopOffset = yAxisArrowBottomOffset = 15;
			else if(o.yAxisArrow === 'top')
				yAxisArrowTopOffset = 15;
			else if(o.yAxisArrow === 'bottom')
				yAxisArrowBottomOffset = 15;

			// Draw the y-axis line
			cx.moveTo(dpr(yAxisX), dpr(yAxisArrowTopOffset));
			cx.lineTo(dpr(yAxisX), dpr(h - yAxisArrowBottomOffset));

			// Draw the y-axis arrow heads
			if(o.yAxisArrow === 'both' || o.yAxisArrow === 'top')
				canvasArrow(cx, dpr(yAxisX), dpr(yAxisArrowTopOffset), dpr(yAxisX), dpr(yAxisArrowTopOffset - 1), dpr(10));
			if(o.yAxisArrow === 'both' || o.yAxisArrow === 'bottom')
				canvasArrow(cx, dpr(yAxisX), dpr(h - yAxisArrowBottomOffset), dpr(yAxisX), dpr(h - yAxisArrowBottomOffset + 1), dpr(10));

			cx.lineWidth = dpr(o.yAxisThickness);
			cx.strokeStyle = o.yAxisColor;
			cx.stroke();
		}

		// Draw the functions
		for(var id in functions) {
			var fOpt = functions[id];
			var f = fOpt.f;

			cx.beginPath();
			cx.moveTo(dpr(x2px(o.xmin)), dpr(y2px(f(o.xmin))));

			for(var x = o.xmin; x < o.xmax; x += 1 / pixelsPerX / dpr(1)) {
				var y = f(x);
				cx.lineTo(
					dpr(x2px(x)),
					dpr(y2px(y))
				);
			}

			cx.lineWidth = dpr(fOpt.lineThickness || 2);
			cx.strokeStyle = (fOpt.lineColor || 'blue');
			cx.stroke();
		}

		// Draw the legend
		if(o.legend) {
			var el = $('<div id="graphLegend"></div>');

			for(id in functions) {
				fOpt = functions[id];

				var legendLabelText = function() {
					switch(fOpt.legendType || 'function') {
						case 'function':
							return generateTeX(math.parse(fOpt.fName + ' = ' + fOpt.fMath), null);
						case 'variable':
							return fOpt.fName;
						case 'plaintext':
							return '\\text{' + escapeTeX(fOpt.legendValue) + '}';
						case 'tex':
							return '\\text{' + fOpt.legendValue + '}';
						case 'mathtex':
							return fOpt.legendValue;
					}
				}();

				var legendLabelEl = $('<div></div>');
				katex.render(legendLabelText, legendLabelEl[0]);
				var legendLabel = legendLabelEl.html();

				var innerEl = $('<div class="legendItem"></div>');
				innerEl.html(
					'<div style="background-color: ' + (fOpt.lineColor || 'blue') + ';" class="legendItemColor"></div>' +
					'<div class="legendItemLabel">' + legendLabel + '</div>'
				);


				el.append(innerEl);
			}

			div.prepend(el);
			$('#graphLegend').css({
				right: o.legendCoords[0] + "px",
				top: o.legendCoords[1] + "px"
			});
		}

		// Draw the axis labels
		// x
		var xlabelText;
		if(o.xlabelType === 'tex')
			xlabelText = generateTeX(math.parse(o.xlabel));
		else if(o.xlabelType === 'plaintext')
			xlabelText = '\\text{' + escapeTeX(o.xlabel) + '}';
		else
			xlabelText = o.xlabel;

		var xlabelElement = $('<div id="xlabel"></div>')[0];
		katex.render(xlabelText, xlabelElement, {displayMode: true});

		var xlabelCSS = {
			top: xAxisY + "px",
			right: (xAxisArrowRightOffset + 15) + "px"
		};
		$(xlabelElement).css(xlabelCSS);

		div.prepend(xlabelElement);

		// y
		var ylabelText;
		if(o.ylabelType === 'tex')
			ylabelText = generateTeX(math.parse(o.ylabel));
		else if(o.ylabelType === 'plaintext')
			ylabelText = '\\text{' + escapeTeX(o.ylabel) + '}';
		else
			ylabelText = o.ylabel;

		var ylabelElement = $('<div id="ylabel"></div>')[0];
		katex.render(ylabelText, ylabelElement, {displayMode: true});

		// We position the element after prepending it to the DOM, as .height() doesn't work beforehand

		div.prepend(ylabelElement);

		var ylabelCSS = {
			left: (yAxisX - $(ylabelElement).height()) + "px",
			top: (yAxisArrowTopOffset + 30) + "px"
		};
		$(ylabelElement).css(ylabelCSS).addClass('y-rotate');
	};
	
	window.graphing = graphing;

	/**
	 * From: http://stackoverflow.com/a/6333775/1248084
	 * Modified slightly
	 * */
	function canvasArrow(context, fromx, fromy, tox, toy, headlen){
		var angle = Math.atan2(toy - fromy, tox - fromx);
		context.moveTo(tox, toy);
		context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
		context.moveTo(tox, toy);
		context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen*  Math.sin(angle + Math.PI / 6));
	}
});