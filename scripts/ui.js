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
var reqFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	function(f){setTimeout(f,17)};

var reloadGraphOptions = function(){};

var degRadVal = "nul";

$(document).ready(function(){
	
	//initialise anything here reliant on storage data
	onStorageReady(function(){
		$("#controls").removeClass("pending");
		
		if( storage.data.degrad ) {
			if( storage.data.degrad == "deg" ) {
				$(".toggle-button").addClass('switch').attr('value','deg');
				degRadVal = "deg";
			} else {
				degRadVal = "rad";
			}
		} else {
			degRadVal = "rad";
		}
		if( storage.data.outputState ) {
			if( storage.data.outputState == "graph" ) {
				$("#outputs").removeClass('calc').addClass('graph');
				$("#ctrl-disp").addClass('switch').attr('value', 'graph');
				$("#variables").addClass('chkb');
			}
		}
	});
	initStorage();
	
	/* general UI */
	$(".toggle-button").click(function(){
		$(this).toggleClass("switch");
		var value = $(this).find('.toggle-item:first-child').attr('value');
		if( $(this).hasClass('switch')) {
			value = $(this).find('.toggle-item:last-child').attr('value');
		}
		$(this).attr('value', value );
	});
	
	/* controls */
	//make them slide out on hover
	(function(){
		$("#controls, #variables").mouseenter(function(){
			$(this).addClass('hover');
		}).mouseleave(function(){
			$(this).removeClass('hover');
		});
	})();
	
	$("#ctrl-disp").click(function(){
		var that = this;
		reqFrame(function(){
			if( $(that).attr("value") == 'calc' ) {
				$("#outputs").addClass('calc').removeClass('graph');
				$("#variables").removeClass('chkb');
				storage.data.outputState = "calc";
				$("#controls .exc-graph").addClass('hidden');
			} else {
				$("#outputs").addClass('graph').removeClass('calc');
				$("#variables").addClass('chkb');
				storage.data.outputState = "graph";
				$("#controls .exc-graph").removeClass('hidden');
			}
		});
	});
	
	
	$("#ctrl-degrad").click(function(){
		var that = this;
		reqFrame(function(){
			degRadVal = $(that).attr('value');
			inputHandle();
			updateGraphFunctions();
		});
	});
	
	$("#cs-controls-btn").click(function(){
		$("#cs-controls").toggleClass('hidden');
	});
	$("#cs-controls-close").click(function(){
		$("#cs-controls").addClass('hidden');
	});
	$("#cs-table-btn").click(function(){
		$("#output-graph").toggleClass('tbd');
		if( $("#output-graph").hasClass('tbd') ) {
			reqFrame(updateTable);
		}
	});
	$("#settings-btn").click(function(){
		$("#settings").toggleClass('hidden');
	});
	
	
	/* grapher */
	function updateCanvasSizes() {
		$("canvas").each(function(){
			var pxr = window.devicePixelRatio || 1;
			$(this).css('width', $(this).width());
			$(this).css('height', $(this).height());
			$(this).attr('width', $(this).width() * pxr);
			$(this).attr('height', $(this).height() * pxr);
		});
		if( mainGraph ) {
			mainGraph.updateGraph();
		}
	}
	updateCanvasSizes();
	$(window).resize(updateCanvasSizes);
	
	/* grapher controls */
	try {
		renderMathInElement($("#cs-controls")[0],{display: false});
	} catch(err){
		console.log(err);
	}
	
	function parseLabelType(i) {
		if( i == 'p' ) {
			return 'plaintext';
		} else if( i == 't' ) {
			return 'tex';
		} else if( i == 'm' ) {
			return 'mathtex';
		} else {
			return '';
		}
	}
	
	reloadGraphOptions = function() {
		var o = {};
		o.xAxis = $("#cs-controls-graph #ct-xaxis").is(":checked");
		o.xmin = parseFloat($("#cs-controls-graph #ct-xmin").val()) || -2;
		o.xmax = parseFloat($("#cs-controls-graph #ct-xmax").val()) || 10;
		o.xlabelType = parseLabelType($("#cs-controls-graph input[name=xlabeltype]:checked").val());
		o.xlabel = $("#cs-controls-graph #ct-xlabel").val();
		o.xAxisArrow = $("#cs-controls-graph #ct-xaxis-arrow").val();
		o.xAxisThickness = parseFloat($("#cs-controls-graph #ct-xaxis-thickness").val()) || 1;
		//o.xAxisColor = null;
		o.yAxis = $("#cs-controls-graph #ct-yaxis").is(":checked");
		o.ymin = parseFloat($("#cs-controls-graph #ct-ymin").val()) || -2;
		o.ymax = parseFloat($("#cs-controls-graph #ct-ymax").val()) || 10;
		o.ylabelType = parseLabelType($("#cs-controls-graph input[name=ylabeltype]:checked").val());
		o.ylabel = $("#cs-controls-graph #ct-ylabel").val();
		o.yAxisArrow = $("#cs-controls-graph #ct-yaxis-arrow").val();
		o.yAxisThickness = parseFloat($("#cs-controls-graph #ct-yaxis-thickness").val()) || 1;
		//o.yAxisColor = null;
		o.grid = $("#cs-controls-graph #ct-grid").val();
		o.gridThickness = parseFloat($("#cs-controls-graph #ct-grid-thickness").val()) || .5;
		//o.gridColor = null;
		o.gridHalf = $("#cs-controls-graph #ct-grid-half").is(":checked");
		//o.gridHalfColor = null;
		return o;
	}
	
	$("#cs-controls-graph > *").on('change keydown keypress keyup mouseup mousedown', function(){
		updateGraphOptions();
	});
});