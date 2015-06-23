var proto = include('dmail/proto');

var Event = proto.extend({
	type: null,
	target: undefined,
	currentTarget: null,
	bubble: false,
	stopped: false,
	defaultPrevented: false,
	args: null,

	constructor: function(type, options){
		this.type = type;
		if( options ){
			for(var key in options){
				this[key] = options[key];
			}
		}
	},

	stopPropagation: function(){
		this.stopped = true;
	},

	preventDefault: function(){
		this.defaultPrevented = true;
	},

	emit: function(target){
		this.currentTarget = target;

		target.emitter.emit(this.type, this);

		return !this.stopped;
	}
});

return Event;