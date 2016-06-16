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

mod.add('menubar', {
	version: '0.1',
	author: 'EvalCalc',
	description: 'Menubar module'
}, function() {
	if ('process' in window && 'versions' in process && 'electron' in process.versions) {
		var remote = require('remote');
		var Menu = remote.require('menu');
		window.updateMenu = function() {
			var template = [
				{
					label: 'EvalCalc',
					submenu: [
						{
							label: 'About EvalCalc',
							selector: 'orderFrontStandardAboutPanel:'
						},
						{
							type: 'separator'
						},
						{
							label: 'Services',
							submenu: []
						},
						{
							type: 'separator'
						},
						{
							label: 'Hide EvalCalc',
							accelerator: 'Command+H',
							selector: 'hide:'
						},
						{
							label: 'Hide Others',
							accelerator: 'Command+Shift+H',
							selector: 'hideOtherApplications:'
						},
						{
							label: 'Show All',
							selector: 'unhideAllApplications:'
						},
						{
							type: 'separator'
						},
						{
							label: 'Quit',
							accelerator: 'Command+Q',
							selector: 'terminate:'
						}
					]
				},
				{
					label: 'Edit',
					submenu: [
						{
							label: 'Undo',
							accelerator: 'Command+Z',
							selector: 'undo:'
						},
						{
							label: 'Redo',
							accelerator: 'Shift+Command+Z',
							selector: 'redo:'
						},
						{
							type: 'separator'
						},
						{
							label: 'Cut',
							accelerator: 'Command+X',
							selector: 'cut:'
						},
						{
							label: 'Copy',
							accelerator: 'Command+C',
							selector: 'copy:'
						},
						{
							label: 'Paste',
							accelerator: 'Command+V',
							selector: 'paste:'
						},
						{
							label: 'Select All',
							accelerator: 'Command+A',
							selector: 'selectAll:'
						}
					]
				},
				{
					label: 'View',
					submenu: [
						{
							label: 'Reload',
							accelerator: 'Command+R',
							click: function() { remote.getCurrentWindow().reload(); }
						},
						{
							label: 'Toggle DevTools',
							accelerator: 'Alt+Command+I',
							click: function() { remote.getCurrentWindow().toggleDevTools(); }
						},
						{
							type: 'separator'
						},
						{
							label: 'Variables',
							type: 'checkbox',
							enabled: ($(window).width() < 1600),
							accelerator: 'Command+B',
							checked: (('ui' in window)?ui.variables.getOpen():false),
							click: function(e) { ui.variables.setOpen(e.checked); }
						}
					]
				},
				{
					label: 'Window',
					submenu: [
						{
							label: 'Minimize',
							accelerator: 'Command+M',
							selector: 'performMiniaturize:'
						},
						{
							label: 'Close',
							accelerator: 'Command+W',
							selector: 'performClose:'
						},
						{
							type: 'separator'
						},
						{
							label: 'Bring All to Front',
							selector: 'arrangeInFront:'
						}
					]
				},
				{
					label: 'Help',
					submenu: [
						{
							label: 'Math Functions',
							click: function() { alert('Not Implemented yet'); }
						}
					]
				}
			];
			menu = Menu.buildFromTemplate(template);
			Menu.setApplicationMenu(menu);
		};
		updateMenu();
	} else {
		window.updateMenu = function(){};
	}
});
