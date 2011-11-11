fmini = (function(){
	
/* constants*/
var UNKNOWN = 1,
	NOT_CONNECTED = 2,
	CONNECTED = 3,
	
/* DATA LAYER */
	_DAL = {
	 	requeryMe : function(callback){
			FB.api('/me', function(response){
				_props.me = response;
				callback && callback(response);
			});
		}		
	},
/* PRIVATE METHODS */
	
	//add a method to the "onReady" queue
	//if the queue has already been flushed, it
	//will execute automatically.
	_addToReadyQueue = function(func){
		_props.onReadyQueue.add(func);
	},
	
/* PRIVATE PROPERTIES */
	_props = {
		onReadyQueue: new Queue()/*queue object*/,
		onGetStatus:{/* object */},
		onStatusChange:{/*array of funcs*/},
		me:{},
		authResponse:{},
		
		refreshFrequency: 5000 //default to 5 seconds
	},
	
/* PUBLIC METHODS */
	init = function(opts){
		//This should normally be called just once.  If it gets called a second time,
		//let's delete the FB namespace, and start over.  On re-load, we'll have to re-fetch the SDK
		//via the async technique.   This will be useful for unit testing,
		//where we can initiailze minifb more than once in a test.
		
		//storing one variables on top of this function: hasBeenCalled
		if (init.hasBeenCalled){
			if (window.FB) delete window.FB;
		}
		init.hasBeenCalled = true;
		
		//local method called 'init' this will initialize the SDK,
		//we will call this regarless of whether they're using the async load or not
		var _init = function() {
			//TODO!!! Inspect 'opts' variable and extract into FB.init()
			FB.init({
				appId      : window.FB_APP_ID, // App ID
				channelURL : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
				status     : true, // check login status
				cookie     : true, // enable cookies to allow the server to access the session
				oauth      : true, // enable OAuth 2.0
				xfbml      : true  // parse XFBML
			});

			FB.getLoginStatus(function(response){
				_props.
				function callMethod(name){
					_props.onGetStatus[name] && _props.onGetStatus[name](response);
				}

				if (response.status == "connected")
					callMethod("CONNECTED");
				else if (response.status == "not connected")
					callMethod("NOT_CONNECTED");
				else if (response.status == "unknown")
					callMethod("UNKNOWN");
				else
					throw "something CRAZY happened and the interwebs are crumbling";

				//if there were any ready() callbacks, flush 'em
				//and pass the login response from teh facebooks
				_props.onReadyQueue.flush(response);
			});
		}
		
		if (!window.FB){
			//since we don't have a definition of "FB" yet, they're trying to load the SDK via the async method
			//So, we'll wait for fbAsyncInit to get called by Facebook
			window.fbAsyncInit = function(){
				_init();
			}
			//Get sdk from facebook
			(function(d){
			var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			d.getElementsByTagName('head')[0].appendChild(js);
			}(document));	
		} else {
			//we're using the synchronous loader... just call init right away
			_init();
		}
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
	
	getMe = function (requeryCallback /*optional*/) {
		//If they didn't pass a callback, return the last known user
		if (!requeryCallback) return _props.me;
		// Othwerwise, re-fetch the call to /me
		_DAL.requeryMe(requeryCallback);
	}
/* PUBLIC PROPERTIES */	
	;
	// return definition of minifb
	return {
		init: init,
		ready: ready,
		getMe : getMe,
		APP_ID: window.FB_APP_ID
	};
}());