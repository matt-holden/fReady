minifb = (function(){
	
/* constants*/
var UNKNOWN = 1,
	NOT_CONNECTED = 2,
	CONNECTED = 3,
/* PRIVATE METHODS */
 	_requeryUser = function(callback){
		FB.api('/me', function(response){
			_props.user = response;
			callback && callback(user);
		});
	},
/* PRIVATE PROPERTIES */
	_props = {
		initialStatusFns:{},
		statusChangeFns:{},
		user:{}
	},
/* PUBLIC METHODS */
	ready = function(readyFuncs) {
		if (typeof readyFuncs === "object"){
			var inits = _props.initialStatusFns;
			inits.UNKNOWN = readyFuncs.UNKNOWN || null;
			inits.NOT_CONNECTED = readyFuncs.NOT_CONNECTED || null;
			inits.CONNECTED = readyFuncs.CONNECTED || null;
		} else {
			//if called without a passed-in func, call whatever callbacks need to be called
			FB.getLoginStatus(function(response){
				console.log("yes");
				console.log(response);
			});
			FB.getAuthResponse(function(response){
				console.log("response");
			});
			FB.api("/me",function(response){
				console.log(response);
			});
			FB.login();
		}
	},
	
	getUser = function (forceRequery, requeryCallback) {
		//return if we just want the currently loaded user var
		if (!forceRecheck) return _props.user;
		// get a new user, and pass along the callback
		_requeryUser(recheckCallback);
	}
/* PUBLIC PROPERTIES */	
	;
	// return definition of minifb
	return {
		ready: ready,
		getUser : getUser,
		APP_ID: window.FB_APP_ID
	};
}());

function loadFacebookSDK(){
	/* facebook's code for initializing their JS library */
	window.fbAsyncInit = function() {
		FB.init({
			appId      : window.FB_APP_ID, // App ID
			channelURL : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			oauth      : true, // enable OAuth 2.0
			xfbml      : true  // parse XFBML
		});
		window.minifb.ready();
	};

	// Load the SDK Asynchronously
	(function(d){
	var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	d.getElementsByTagName('head')[0].appendChild(js);
	}(document));
}