/*
it may be usefull to know if a specific event is being listened

en gros l'idée c'est découter un groupe d'event 
mais ça on peut déjà le faire avec Emitter

suffit de rajouter quelque fonctionnalité mais c'est bon quoi
la différence c'est que je peux désactiver des groupe de listener (voir listener avec active = true)


var events = {
	click: function(){
	
	},
	mousemove: function(){
	
	}
};

*/

var EventListener = {
	emitter: null,
	handlers: null,
	listener: null,
	listening: false,

	constructor: function(emitter, handlers, listener){
		this.emitter = emitter;
		if( handlers ) this.handlers = handlers;
		this.listener = listener || this;
	},

	handleEvent: function(e){
		var listener = this.listener, handlers = this.handlers, handler;

		if( handlers ){
			handler = this.handlers[e.type];
			if( typeof handler == 'string' ){
				handler = listener[handler];
			}
			if( typeof handler == 'object' ){
				listener = handler;
				handler = handler.handleEvent;
			}
			if( typeof handler == 'function' ){
				return handler.call(listener, e, this);
			}
		}
	},

	toggle: function(value, name, listener){
		if( this.emitter ) this.emitter[value ? 'on' : 'off'](name, this);
	},

	enable: function(name){
		return this.toggle(name, true);
	},

	disable: function(name){
		return this.toggle(name, false);
	},

	isListening: function(name){

	},

	add: function(name, listener){
		var exists = false;

		if( this.handlers ){
			exists = name in this.handlers;
		}
		else{
			this.handlers = {};
		}

		this.handlers[name] = listener;

		// dont listen twice
		if( !exists && this.listening ) this.enable(name);
	},

	remove: function(name){
		if( this.handlers ){
			if( this.listening ) this.disable(name);
			delete this.handlers[name];
		}
	},

	forEach: function(fn, bind){
		if( this.handlers ){
			for(var name in this.handlers){
				fn.call(bind, name, this.handlers[name]);
			}
		}
	},

	listen: function(){
		this.forEach(this.enable, this);
		this.listening = true;
		return this;
	},

	stopListening: function(){
		this.forEach(this.disable, this);
		this.listening = false;
		return this;
	}
};

module.exports = EventListener;