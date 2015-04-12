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

var graphing = {};

graphing.dpr = function(i) {
	return i * (window.devicePixelRatio || 1);
};

/**
 * @usage new graphing.Graph(options)
 * */
graphing.Graph = function(options) {
	if(typeof options !== 'object')
		options = {};

	this.options = options;
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
		throw "options must be an array"

	for(var key in options)
		delete options[key];

	this.updateGraph();
};
graphing.Graph.prototype.updateGraph = function() {
	// TODO
};