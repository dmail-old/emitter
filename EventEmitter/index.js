var Emitter = require('../index.js');
var proto = require('dmail/proto');

var EventEmitter = proto.extend.call(Emitter, {
	handleEvent: function(e){
		this.emit(e.type, e);
	}
});

return EventEmitter;