$(document).ready(function(){
	initStorage();
	
	$(".toggle-button").click(function(){
		$(this).toggleClass("switch");
		var value = $(this).find('.toggle-item:first-child').attr('value');
		if( $(this).hasClass('switch')) {
			value = $(this).find('.toggle-item:last-child').attr('value');
		}
		$(this).attr('value', value );
	});
});