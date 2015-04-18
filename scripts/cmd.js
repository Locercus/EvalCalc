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