/* Copyright (C) 2015 Creeper32605 | MIT License */
mod.add('storage', {
	version: '0.1 alpha',
	author: 'Creeper32605',
	description: 'Interface for localStorage or chrome storage'
}, function(){
	window.storage = {
		type: 0,
		data: {},
		ready: false
	};
	storage.init = function() {
		if ('chrome' in window) {
			if (typeof chrome.storage != 'undefined') {
				console.log("Chrome storage found");
				storage.type = 1;
				chrome.storage.sync.get(null, function(data){
					storage.data = data;
					storage.ready = true;
					console.log("Storage is ready");
					for( var i in storageReadyListeners ) {
						try {
							storageReadyListeners[i]();
						} catch( err ) {
							console.log(err);
						}
					}
				});
			}
		}
		if (storage.type === 0) {
			if( 'localStorage' in window ) {
				console.log("localStorage found");
				storage.type = 2;
				storage.data = localStorage;
				storage.ready = true;
				console.log("Storage is ready");
				for( var i in storageReadyListeners ) {
					try {
						storageReadyListeners[i]();
					} catch( err ) {
						console.log(err);
					}
				}
			}
		}
		if (storage.type === 0) {
			toast("Error: Could not initialise data storage");
		}
	};

	var storageReadyListeners = [];
	storage.onReady = function(callback) {
		if( typeof callback == 'function' ) {
			storageReadyListeners.push(callback);
		}
	};
	storage.onReady(function(){
		Object.observe(storage.data, function(){
			storage.save();
		});
	});

	storage.save = function() {
		if( storage.ready ) {
			if( storage.type == 1 ) {
				chrome.storage.sync.clear(function(y){
					chrome.storage.sync.set(storage.data, function(s){
						console.log("Saved data to chrome storage (might've errored)");
					});
				});
			} else {
				localStorage = storage.data;
			}
		} else {
			throw "Storage not ready";
		}
	};
	
	this.init = function() {
		requestAnimationFrame(storage.init);
	};
});