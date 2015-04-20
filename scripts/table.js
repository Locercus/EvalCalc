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

//"configuration"
var tablecfg = {
	lo: -50, //lowest value in the table (assigned automatically if loadonscroll == true)
	hi: 50, //highest value in the table (assigned automatically if loadonscroll == true)
	loadonscroll: true,
	scrollindex: 0 //topmost x value, not the pixel scroll position
};
//data stored for the functions
var tabled = {};
var updateTable = function(){
	var t = $("#output-graph #table-disp");
	var functionKeys = {};
	for( var i in graphFunctions ) {
		tabled[i] = {};
		functionKeys[i] = i;
		var f = scope[i];
		for( var j = tablecfg.lo; j < tablecfg.hi; j++ ) {
			var val;
			try {
				val = f(j);
			} catch(err){}
			tabled[i][j] = val;
		}
	}
	t.empty();
	var table = $("<table></table>");
	var header = $("<tr></tr>");
	header.append("<th>$$x$$</th>");
	for( var i in functionKeys ) {
		header.append("<th>$$" + functionKeys[i] + "$$</th>");
	}
	table.append(header);
	for( var i = tablecfg.lo; i < tablecfg.hi; i++ ) {
		var row = $("<tr></tr>");
		row.attr("index", i);
		row.append("<td>$$" + i + "$$</td>");
		for( var j in tabled ) {
			var v = tabled[j][i];
			if( typeof v == 'undefined' ) {
				v = '?';
			}
			row.append("<td>$$" + v + "$$</td>");
		}
		table.append(row);
	}
	t.append(table);
	try {
		renderMathInElement(t[0]);
	} catch(err){}
	t.scrollTop(t.find("tr[index=" + tablecfg.scrollindex + "]").offset().top - t.offset().top);
}