$(document).ready(function(){
	$("#settings-list .setting").click(function(){
		var dsec = $(this).data('value');
		var fn = $("#settings-content section[data-content=" + dsec + "]");
		if( fn.length ) {
			$("#settings-list .setting").removeClass('selected');
			$("#settings-content section").removeClass('active');
			$(this).addClass('selected');
			fn.addClass('active');
		}
	});
	$("#settings .retl").click(function(e){
		if( e.target == this && $(e.target).parent()[0] != this ) {
			$(this).toggleClass('open');
		}
	});
	$("#settings-close").click(function(){
		$("#settings").addClass('hidden');
	});
});