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
	
	//add a method to the "onReady" queue
	//if the queue has already been flushed, it
	//will execute automatically.
	_addToReadyQueue = function(func){
		_props.onReadyQueue.add(func);
	}
/* PRIVATE PROPERTIES */
	_props = {
		onReadyQueue: new Queue()/*queue object*/,
		onGetStatus:{/* object */},
		onStatusChange:{/*array of funcs*/},
		user:{},
		authResponse:{},
		
		refreshFrequency: 5000 //default to 5 seconds
	},
/* PUBLIC METHODS */
	init = function(opts){
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

			FB.getLoginStatus(function(response){
				function callMethod(name){
					_props.onGetStatus[name] && _props.onGetStatus[name](response);
				}
console.log(response.status);
				if (response.status == "connected")
					callMethod("CONNECTED");
				else if (response.status == "not connected")
					callMethod("NOT_CONNECTED");
				else if (response.status == "unknown")
					callMethod("UNKNOWN");
				else
					throw "something CRAZY happened";

				//if there were any ready() callbacks, flush 'em
				_props.onReadyQueue.flush(response);
			});
		};

		// Load the SDK Asynchronously
		(function(d){
		var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
		js = d.createElement('script'); js.id = id; js.async = true;
		js.src = "//connect.facebook.net/en_US/all.js";
		d.getElementsByTagName('head')[0].appendChild(js);
		}(document));
	},
	
	ready = function(opts, func2execute) {
		/*	{
				onGetStatus:{UNKNOWN:FUNC(), NOT_CONNECTED:FUNC(), CONNECTED:FUNC()=}
				onStatusChange:{UNKNOWN:FUNC(), NOT_CONNECTED:FUNC(), CONNECTED:FUNC()=}
				refreshFrequency:
		} */
		
		/* if readyfuncs is an object */
		if (typeof opts === "object"){
			_props.onGetStatus = opts.onGetStatus;
			_props.onStatusChange = opts.onStatusChange;
			_props.refreshFrequency = opts.refreshFrequency; 
			
			if (func2execute && typeof func2execute !== undefined) {
				_addToReadyQueue(func2execute);
			}	
		}

		/* handle cases where onReady function is passed in */
		if (typeof opts === "function"){
			_addToReadyQueue(opts);
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
		init: init,
		ready: ready,
		getUser : getUser,
		APP_ID: window.FB_APP_ID
	};
}());