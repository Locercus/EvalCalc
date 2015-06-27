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

if (!('requestAnimationFrame' in window)) {
	window.requestAnimationFrame = window.webkitRequestAnimationFrame || function(s){setTimeout(s,17);};
}
var mod = {
	add: function(name, metadata, module) {
		//check if input data is valid. If it's not throw an Error
		if (typeof name != 'string') {
			var xn;
			try {
				xn = name.toString();
			} catch(e) {}
			throw new Error("Failed to add module: Name " +
				( ( xn !== null ) ? ( "(" + name + ")" ) : "" ) +
				" is not a string");
		} else if (name.length >= 64) {
			throw new Error("Failed to add module " + name.substr(0,60) + "...: Name length exceeds limit of 63");
		}
		if (typeof metadata != 'object') {
			throw new Error("Failed to add module " + name + ": Metadata is not an object");
		} else if (metadata instanceof Array) {
			throw new Error("Failed to add module " + name + ": Metadata is an array");
		} else if (!( 'version' in metadata )) {
			throw new Error("Failed to add module " + name + ": no version in Metadata");
		} else if (typeof metadata.version != 'string' && typeof metadata.version != 'number') {
			throw new Error("Failed to add module " + name + ": metadata.version is not a string or number");
		} else if (metadata.version.toString().length >= 64) {
			throw new Error("Failed to add module " + name + ": metadata.version length exceeds limit of 63");
		}
		var displayName = name;
		var version = metadata.version.toString();
		var author = "No author";
		var description = "No description";
		var dependencies = [];
		var styles = [];
		if ('displayname' in metadata && metadata.displayname == 'string') {
			if (metadata.displayname.length >= 64) {
				throw new Error("Failed to add module " + name + ": metadata.displayname length exceeds limit of 63");
			}
			displayName = metadata.displayname;
		}
		if ('author' in metadata && typeof metadata.author == 'string') {
			author = metadata.author;
		}
		if ('description' in metadata && typeof metadata.description == 'string') {
			description = metadata.description;
		}
		if ('dependencies' in metadata && typeof metadata.dependencies == 'object') {
			if(!(metadata.dependencies instanceof Array)) {
				throw new Error("Failed to add module " + name + ": metadata.dependencies is not an array");
			}
			dependencies = metadata.dependencies;
		}
		if ('styles' in metadata && typeof metadata.styles == 'object') {
			if(!(metadata.dependencies instanceof Array)) {
				throw new Error("Failed to add module " + name + ": metadata.styles is not an array");
			}
			styles = metadata.styles;
		}
		if (typeof module != 'function') {
			throw new Error("Failed to add module " + name + ": module is not a function");
		}

		//check if module identifier is already registered
		if (name in mod.mod) {
			throw new Error("Failed to add module " + name + ": module is a duplicate");
		}
		//try to create an instance of the module
		var instance;
		try {
			instance = new module();
		} catch (err) {
			console.log(err);
		}
		//add it to the active modules
		mod.ac[name] = instance;
		//add it to the metadata
		mod.meta[name] = {
			version: version,
			author: author,
			display: displayName,
			description: description,
			dependencies: dependencies,
			styles: styles
		};
	},
	mod: {},
	meta: {},
	ac: {}
};
document.onready = function(){
	requestAnimationFrame(function() {
		for ( var i in mod.ac) {
			if (mod.ac[i] !== undefined) {
				if ('init' in mod.ac[i]) {
					try {
						mod.ac[i].init();
					} catch(err) {
						console.log(err);
					}
				}
			}
		}
	});
	/*
	var modulesLoaded = 0;
	var modulesToLoad = 0;
	var tryLoadModules = function(){
		if (modulesLoaded == modulesToLoad) {
			requestAnimationFrame(function() {
				console.log(mod.ac);
			});
		}
	};
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'modules.json');
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var d;
			try {
				d = JSON.parse(xhr.responseText);
			} catch(e){}
			modulesToLoad = d.length;
			for ( var i in d) {
				var file = d[i];
				var qhr = new XMLHttpRequest();
				qhr.open('GET', 'scripts/' + file + '.js');
				qhr.onreadystatechange = function() {
					if(qhr.readyState == 4 && qhr.status == 200) {
						try {
							(new Function(qhr.responseText))();
						} catch(err) {
							console.log(err.stack);
						}
					} else if (qhr.readyState == 4) {
						console.log("Failed to load " + file + ".js");
					}
					modulesLoaded++;
					tryLoadModules();
				};
				qhr.send();
			}
		} else if (xhr.readyState == 4) {
			console.log('failed to load modules.json');
		}
	};
	xhr.send();*/
};
