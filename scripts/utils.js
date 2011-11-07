//Deferred callback queue taken graciously from http://www.dustindiaz.com/async-method-queues
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