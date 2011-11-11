$(document).ready(function(){
	//div for text logging
	/* var $output = $("#output");
	function setOutput(string){
		$output.text(string);
	}; */
	module("Unit tests should start with a logged in, and connected FB user!");
	
	module("Load Facebook SDK / Work with user status");
	asyncTest("Checks user's status, runs an additional onInit method", function(){
		//define the number of tests we're expecting
		var expectCount = 3;
		//inform QUnit of this number
		expect(expectCount);
		
		//our own, internal version of QUnit's "start"
		var _start = function(){
			_start.numCalls = ++(_start.numCalls || 0);
			if (_start.numCalls == expectCount) start();
		}
		
		minifb.ready({
			onGetStatus: {
				CONNECTED : function(response){
					ok(true, "User is logged in and connected");
					_start();
				}
			}/*,

			onStatusChange: {
				CONNECTED : function(response){
					ok(true, "User is now logged in and connected");
					start();
				}
			}*/
		}, 
		function(){
			ok(true, "Ran an extra ready() function");
			_start();
		});
		
		minifb.ready(function(){
			ok(true, "Ran a ready() function with the minimalist method ;)");
			_start();
		});

		minifb.init();
	});
	
	asyncTest("Re-initialize minifb, now as a logged-out user", function(){
		start();
		/*
		FB.logout(function(){
			//user logged out
			
		});
		*/
	});

});
