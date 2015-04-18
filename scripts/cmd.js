$(document).ready(function(){
	$(document).keydown(function(e){
		// 91: left cmd key
		// 93: right cmd key
		if( e.which == 91 || e.which == 93 ) {
			$("#cmd-line").toggleClass('hidden');
			if( $("#cmd-line").hasClass('hidden') ) {
				$("#input").focus();
			} else {
				$("#cmd-input").focus();
			}
		}
	});
});