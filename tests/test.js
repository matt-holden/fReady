$(document).ready(function(){
	//div for text logging
	/* var $output = $("#output");
	function setOutput(string){
		$output.text(string);
	}; */
	module("Load Facebook SDK");
	asyncTest("Loads Facebook SDK, checks user's status, runs an additional onInit method", function(){
		expect(2);
		
		minifb.ready({
			onGetStatus: {
				UNKNOWN : function(response){
					ok(true, "User is not logged in");
					start();
				},
				NOT_CONNECTED : function(response){
					ok(true, "User is logged in but not connected");
					start();
				},
				CONNECTED : function(response){
					ok(true, "User is logged in and connected");
					start();
				}
			},

			onStatusChange: {
				UNKNOWN : function(response){
					ok(true, "User must have logged out of Facebook");
					start();
				},
				NOT_CONNECTED : function(response){
					ok(true, "Use is no longer connected");
					start();
				},
				CONNECTED : function(response){
					ok(true, "User is now logged in and connected");
					start();
				}
			}
		}, 
		function(){
			ok(true, "Just ran an additional ready() function");
		}); 


		minifb.init();
	});

});
