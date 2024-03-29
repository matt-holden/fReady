/*
 * Iterative merge sort implementation in JavaScript
 * Copyright (c) 2011 Matthew Holden
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;
fReady = (function(){
	
//Basic Deferred callback queue taken graciously from http://www.dustindiaz.com/async-method-queues
function Queue(optFns) {

  // store your callbacks
  this._methods = (optFns && optFns[0]) || [];
  // keep a reference to your response
  this._response = null;
  // all queues start off unflushed
  this._flushed = false;
}

Queue.prototype = {
  // adds callbacks to your queue
  add: function(fn) {
    // if the queue had been flushed, return immediately
    if (this._flushed) {
      fn(this._response);
    // otherwise push it on the queue
    } else {
      this._methods.push(fn);
    }
  },
  flush: function(resp) {
    // note: flush only ever happens once
    if (this._flushed) {
      return;
    }
    // store your response for subsequent calls after flush()
    this._response = resp;
    // mark that it's been flushed
    this._flushed = true;
    // shift 'em out and call 'em back
    while (this._methods[0]) {
      this._methods.shift()(resp);
    }
  }
};
	
// fReady FTW... :)	
	
/* DATA LAYER */
var _DAL = {
	 	requeryMe : function(callback){
			FB.api('/me', function(response){
				_props.me = response;
				callback && callback(response);
			});
		},
 		requeryAuthdScope : function(callback){
			var query = FB.Data.query('select ' + _props.scope + ' from permissions where uid = me()');
			 query.wait(function(results) {
				results = results[0];
				//reset list of authdScope
				//alias to local variable for slight speed bost
				var props = _props.authdScope = {};
				for(p in results)
				if (results[p] == 1) props[p] = true;
				//now call anything that was waiting for this to finish...
				callback && callback(_props.authdScope);
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
		
/* PRIVATE PROPERTY OBJECT */
	_props = {
		onReadyQueue: new Queue()/*queue object*/,
		onGetStatus:null,
		onStatusChange:null,
		
		me:null,
		lastLoginResponse:null,
		
		//permissions requested in init() method
		scope:null,
		authdScope:null,
	
		refreshFrequency: 5000 //default to 5 seconds
	},
	
/* PUBLIC METHODS */
	init = function(opts){
		//This should normally be called just once.  If it gets called a second time, kick em out!
		if (init.hasBeenCalled) return;
		init.hasBeenCalled = true;

		//add <div id="fb-root"></div> if it doesn't exist
		var fbRoot = document.getElementById("fb-root");
		if (!fbRoot){
			fbRoot = document.createElement('div');
			fbRoot.setAttribute('id','fb-root');
			document.getElementsByTagName('body')[0].appendChild(fbRoot);
		}
		//local method called 'init' this will initialize the SDK,
		//we will call this regarless of whether they're using the async load or not
		var _init = function() {
			
			if (!opts.appId)
				throw "Must pass an appId";
			FB.init({
				  appId  : opts.appId,
				  channelURL : opts.channelURL || '', // Channel File
				  status : opts.status || true, // check login status
				  cookie : opts.cookie || true, // enable cookies to allow the server to access the session
				  oauth  : opts.oauth || true, // enable OAuth 2.0
				  xfbml  : opts.xfbml || true,  // parse XFBML
			});

			//keep track of the permissions we're going to want
			_props.scope = opts.scope || '';

			/// TODO: GET RID OF THE VERY NOT DRY CODE BELOW
			FB.getLoginStatus(function(response){
				_props.lastLoginResponse = response;

				function callOnGetStatusMethod(name){
					
					var onGetStatus = _props.onGetStatus;
					onGetStatus && onGetStatus[name] && onGetStatus[name](response);
				}

				if (response.status == "connected") {	
					//queue up a call to 'getMe' and loginStatus calback
					var q = new Queue();
					q.add(function(){
						if (!fReady.getMe())
							_DAL.requeryMe(function(){
								callOnGetStatusMethod("CONNECTED");						
							});
						else
							callOnGetStatusMethod("CONNECTED");
					});
					
					//do we need to check scope first?
					if (opts.queryScopeFirst && opts.scope){
						_DAL.requeryAuthdScope(function(){
							q.flush();
						});
					} else {
						q.flush();
					}					
				}
				else if (response.status == "not_authorized")
					callOnGetStatusMethod("NOT_AUTHORIZED");
				else if (response.status == "unknown")
					callOnGetStatusMethod("UNKNOWN");
				else
					throw "something CRAZY happened and the interwebs are crumbling";
				
				//if there were any ready() callbacks, flush 'em
				//and pass the login response from teh facebooks
				if (!fReady.getMe())
					_DAL.requeryMe(function(){
						_props.onReadyQueue.flush(response);
					});
				else
				_props.onReadyQueue.flush(response);
				
			});
			
			// keep pinging facebook to make sure we have the latest authResponse...
			// authResponseChange doesn't seem to get fired when user logs out.
			setInterval(function(){
				FB.getLoginStatus();
			}, _props.refreshFrequency);
			
			//subscribe to the authResponseChange event when authresponse changes, we'll 
			//fire of any onStatusChange callbacks that have been registered
			FB.Event.subscribe('auth.authResponseChange', function(response){
				_props.lastLoginResponse = response;
				
				function callMethod(name){
					var onStatusChange = _props.onStatusChange;
					onStatusChange && onStatusChange[name] && onStatusChange[name](response);
				}
				
				if (response.status == "connected")
					//get "me" object first!
					_DAL.requeryMe(function(){
						_DAL.requeryAuthdScope(function(){
							//then call the 'status change' callback
							callMethod("CONNECTED");
						});
					});
				else if (response.status == "not_authorized")
					callMethod("NOT_AUTHORIZED");
				else if (response.status == "unknown")
					callMethod("UNKNOWN");
				else
					throw "something CRAZY happened and the interwebs are crumbling";				
			});
		}

		if (!window.FB){
			//since we don't have a definition of "FB" yet, they're trying to load the SDK via the async method
			//So, we'll wait for fbAsyncInit to get called by Facebook
			window.fbAsyncInit = function(){
				_init();
			};

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

//public data access and api methods
	getMe = function (requeryCallback /*optional*/) {
		//If they didn't pass a callback, return the last known user
		if (!requeryCallback) return _props.me;
		// Othwerwise, re-fetch the call to /me
		_DAL.requeryMe(requeryCallback);
	},
	
	getAuthdScope = function(requeryCallback){
		if (!requeryCallback) return _props.authdScope;
		//re-fetch list of authd permissions, then execute callback
		_DAL.requeryAuthdScope(requeryCallback);
	},
	
	isConnected = function(){
		return _props.lastLoginResponse.status == "connected";
	},

	//must be called from within a click handler otherwise the browser will block the popup
	login = function(auth, scope, noAuth){
		//sort out what exactly they passed
		noAuth = typeof scope == "function" ? scope : noAuth;
		scope = typeof scope == "string" ? scope : "";

		FB.login(function(response){
			if (response.status == "connected")
				auth && auth();
			else
				noAuth && noAuth();
		}, {scope: (typeof scope == "string" && scope || "")});
	},
	//this method just exists as a nice companion to fReady.login(); no real reason to have it
	logout = function(){
		FB.logout();
	},
	
	//this will be the core function for fReady, similar to jQuery's jQuery() function.
	ready = function(opts, func2execute) {
		
		/* if readyfuncs is an object */
		if (typeof opts === "object"){
			_props.onGetStatus = opts.onGetStatus || {};
			_props.onStatusChange = opts.onStatusChange || {};
			_props.refreshFrequency = opts.refreshFrequency || _props.refreshFrequency; 
			
			if (func2execute && typeof func2execute !== undefined) {
				_addToReadyQueue(func2execute);
			}	
		}

		/* handle cases where onReady function is passed in */
		if (typeof opts === "function"){
			_addToReadyQueue(opts);
		} 
		
	};
	
	// return definition of fReady
	ready.init = init;
	ready.getMe = getMe;
	ready.getAuthdScope = getAuthdScope;
	ready.isConnected = isConnected;
//	ready.getAuthResponse = getAuthResponse;
//	ready.getLoginStatus = getLoginStatus;
//	ready.getLoginResponse = getLoginResponse;
	ready.login = login;

//	the ready() function will be assigned to the fReady variable as this function returns executes
//  addiitonal methods are stored as properties on top of this function
	return ready;
}());