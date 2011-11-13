$(document).ready(function(){
	
	var prompt2login = function(callback){
		$("#message").text("Please log in");
		FB.subscribe("auth.authResponseChange", responseHandler)
		
		function responseHandler(response){
			FB.unsubscribe("auth.authResponseChange", responseHandler);
			callback(response);
		}
	};
	
	module("Load Facebook SDK / Work with user status");
	asyncTest("Checks user's status", function(){
		//define the number of tests we're expecting
		//inform QUnit of this number
		expect(1);	

		//our own, internal version of QUnit's "start"
		fReady.ready({
			onGetStatus: {
				CONNECTED : function(response){
					ok(true, "User is logged in and connected");
					start();
				}
			}
		})
		fReady.init();
	});
	

	asyncTest("Able to re-initialize fReady / check that user is logged in", function(){
		//inform QUnit of this number
		expect(1);
		fReady.ready(function(response){
			equals(response.status, "connected", "User is logged in");
			start();
		});
		
	});
	
	asyncTest("Can run two .ready() functions", function(){
		var numTests = 2;
		expect(numTests);
		fReady.ready(function(response){
			ok(true, "Got a response");
			--numTests || start();
		});
		
		fReady.ready(function(response){
			ok(true, "Got a response2");
			--numTests || start();
		})
		
		var bigStr = "", count = 1000;
		while (count--){
			bigStr += "more string";
		}
		
		
		function rev1(str){
			var news = "", len = str.length;
			while(len-- && (news += str[len]))
			{}
			return news;
		}
		
		function rev3(str){
			
		}
	});
	
	/*asyncTest("Log them out, prompt to log back in", function(){
		window.FB.logout();
		var prompt = prompt2login(function(response){
			if (response.status != "connected") prompt();
		});
		prompt();
		fReady.init();
	 });*/

});
