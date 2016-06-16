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

//"configuration"
var tablecfg = {
	lo: -50, //lowest value in the table (assigned automatically if loadonscroll == true)
	hi: 50, //highest value in the table (assigned automatically if loadonscroll == true)
	loadonscroll: true,
	scrollindex: 0 //topmost x value, not the pixel scroll position
};
//data stored for the functions
var tabled = {};
var tabletex = "";

onStorageReady(function(){
	if( storage.data.stUseVerticalTables == "true" ) {
		$("#stUseVerticalTables").prop('checked', true);
		$("#table-disp").addClass('vertical');
	} else {
		storage.data.stUseVerticalTables = "false";
	}
});
$(document).ready(function(){
	$("#stUseVerticalTables").change(function(){
		storage.data.stUseVerticalTables = (storage.data.stUseVerticalTables == "true") ? "false" : "true";
		if( storage.data.stUseVerticalTables == "true" ) {
			$("#table-disp").addClass('vertical');
		} else {
			$("#table-disp").removeClass('vertical');
		}
	})
});
var updateTable = function(){
	var startTime0 = Date.now();
	console.log("Updating graph functions and table values... (" + startTime0 + ")");
	try {
		updateGraphFunctions();
	} catch(err){}
	var t = $("#output-graph #table-disp");
	tabled = {};
	for( var i in graphFunctions ) {
		var f = scope[i];
		var k = stringScope[i][0];
		tabled[k] = tabled[k] || {};
		tabled[k][i] = {};
		for( var j = tablecfg.lo; j < tablecfg.hi; j++ ) {
			var val;
			try {
				val = f(j);
			} catch(err){}
			tabled[k][i][j] = val;
		}
	}
	console.log("Done (Task 0)! (" + (Date.now() - startTime0) + "ms)");
	var startTime1 = Date.now();
	console.log("Generating markup... (" + startTime1 + ")");
	t.empty();
	var table = $("<div class='tbl'></div>");
	function createHeader(variable) {
		var header = $("<div class='row header' v='" + variable + "'></div>");
		header.append("<div class='cell head'>$$" + variable + "$$</div>");
		for( var i = tablecfg.lo; i < tablecfg.hi; i++ ) {
			header.append("<div class='cell index'>$$" + i + "$$</div>");
		}
		return header;
	}
	for( var k in tabled ) {
		var n = tabled[k];
		var obj = $("<div class='section'></div>");
		obj.append(createHeader(k));
		for( var j in n ) {
			var row = $("<div class='row data'></div>");
			row.attr("data-fn", j);
			row.append("<div class='cell head'>$$" + j + "$$</div>");
			for( var i = tablecfg.lo; i < tablecfg.hi; i++ ) {
				var v = parseFloat(n[j][i]);
				if( Math.round(v) != v ) {
					v = parseFloat(v.toFixed(2));
				}
				if( v == NaN ) {
					v = '\\bigotimes';
				} else if( v == Infinity ) {
					v = '\\infty';
				}
				row.append("<div class='cell data' index='" + i + "'>$$" + v + "$$<div class='cb'>$$" + v + "$$</div></div>");
			}
			obj.append(row);
		}
		table.append(obj);
	}
	console.log("Done (Task 1)! (" + (Date.now() - startTime1) + "ms)");
	var startTime2 = Date.now();
	console.log("Appending markup... (" + startTime2 + ")");
	t.append(table);
	console.log("Done (Task 2)! (" + (Date.now() - startTime2) + "ms)");
	var startTime3 = Date.now();
	console.log("Fixing width on .cb for each data cell after one frame... (" + startTime3 + ")");
	reqFrame(function(){
		var frameTime0 = Date.now();
		// t.scrollLeft(t.find("td[index=" + tablecfg.scrollindex + "]").offset().left - t.offset().left);
		t.find(".cell.data").each(function(){
			$(this).find('.cb').css("width", $(this).find(".katex").outerWidth() );
		});
		console.log("Done (Task 3)! (Task time: " + (Date.now() - frameTime0) + "ms; Frame time: " + (frameTime0 - startTime3)+ "ms)");
		var startTime4 = Date.now();
		reqFrame(function(){
			try {
				renderMathInElement(t[0]);
			} catch(err){}
		});
	});
	console.log("Done updating table!");
	
	tabletex = "\\begin{tabular}{r|";
	for( var i = tablecfg.lo; i < tablecfg.hi; i++ ) {
		"c";
	}
	for( var j in tabled ) {
		tabletex += "x & 1 & 2 & 3 & 4 & 5 \\ \hline \\[-1em]";
	}
	tabletex += "}";
}