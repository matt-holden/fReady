$(document).ready(function(){
	
	var scope = "manage_pages,publish_actions,offline_access,user_videos";

	fReady.init({
		appId		: 314049385288127, // App ID
		channelURL	: '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
		status		: true, // check login status
		cookie		: true, // enable cookies to allow the server to access the session
		oauth		: true, // enable OAuth 2.0
		xfbml		: true,  // parse XFBML
		queryScopeFirst : true,
		scope		: scope
	});
		
	module("Load Facebook SDK / Work with user status");

	asyncTest("Test of fReady.isLoggedIn(). User should be logged in already.", function(){
		fReady(function(){
			ok(fReady.isLoggedIn(), "User is logged in");
			start();
		});
	});
	
	asyncTest("Checks user's status", function(){
		//define the number of tests we're expecting
		//inform QUnit of this number
		expect(1);	

		//our own, internal version of QUnit's "start"
		fReady({
			onGetStatus: {
				CONNECTED : function(response){
					ok(true, "User is logged in and connected");
					start();
				}
			}
		});
	});
	
	asyncTest("Can run two .ready() functions", function(){
		var numTests = 2;
		expect(numTests);
		fReady(function(response){
			ok(true, "Got a response");
			--numTests || start();
		});
		
		fReady(function(response){
			ok(true, "Got a response2");
			--numTests || start();
		})
	});
	
	module("Play around with the fReady.getMe() method")
	test("Get current, cached user object", function(){
		var me = fReady.getMe();
		console.log(me);
		ok(me.username, "We have a user object!");
	});
	
	asyncTest("Re-query the current user from Facebook.", function(){
		fReady.getMe(function(me){
			ok(me.username, "We have a refreshed user object!");
			start();
		});
	});
	
	module("Permissions checks...");
	asyncTest("Get authorized permissions list", function(){
		var scope = fReady.getAuthdScope();
		ok(scope, "Got back a list of authorizations");
		start();
	});
	
	asyncTest("Refresh authorized permissions list", function(){
		fReady.getAuthdScope(function(authd){
			start();
		});
	});

});
