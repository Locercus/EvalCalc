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
$(document).ready(function(){
	$(document).keydown(function(e){
		// 190 = period key (on osx, don't know about windows)
		if( e.which == 190 && ( e.metaKey || e.ctrlKey ) ) {
			e.preventDefault();
			$("#cmd-line").toggleClass('hidden');
			if( $("#cmd-line").hasClass('hidden') ) {
				$("#input").focus();
			} else {
				$("#cmd-input").focus();
			}
		}
	});
	$("#cmd-input").on('input', function(){
		var r = "";
		try {
			r = math.eval($("#cmd-input").val());
		} catch(err){}
		if( r ) {
			$("#cmd-results").text(r);
		}
	});
});