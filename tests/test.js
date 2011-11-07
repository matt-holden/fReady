$(document).ready(function(){
	//div for text logging
	/* var $output = $("#output");
	function setOutput(string){
		$output.text(string);
	}; */
	module("Load Facebook SDK");
	asyncTest("Loads Facebook SDK, checks user's status", function(){
		expect(1);
		minifb.ready({
			UNKNOWN : function(){},
			NOT_CONNECTED : function(){},
			CONNECTED : function(){
				ok(true, "User Logged In");
				start();
			}
		});
		loadFacebookSDK();
	}); 
});