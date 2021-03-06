/*

name: Emitter

description: Emitter provide methods to emit and listen for events

*/

var proto = include('dmail/proto');
var Notifier = include('dmail/notifier');

var Emitter = proto.extend({
	Notifier: Notifier,
	notifiers: null,
	bind: null,
	method: 'handleEvent',
	active: true,
	size: 0, // number of events
	count: 0, // total number of listeners
	eventRegExp: /\s+/,

	/*
	onAdd: EventNotifier.new(),
	onRemove: EventNotifier.new(),
	onNotify: EventNotifier.new(),
	*/

	constructor: function(bind){
		this.bind = bind || this;
		this.notifiers = {};
	},

	createNotifier: function(name){
		return this.Notifier.create(name);
	},

	encode: function(name){
		return String(name);
	},

	getNotifier: function(name){
		var notifier;

		name = this.encode(name);

		if( name in this.notifiers ){
			notifier = this.notifiers[name];
		}
		else{
			notifier = this.createNotifier(name);
			this.notifiers[name] = notifier;
			this.size++;
		}

		return notifier;
	},

	isListened: function(name){
		if( this.active === false ) return false;
		name = this.encode(name);
		if( name in this.notifiers === false ) return false;
		if( this.notifiers[name].active === false ) return false;
		if( this.notifiers[name].size === 0 ) return false;
		return true;
	},

	enable: function(name){
		return this.getNotifier(name).enable();
	},

	disable: function(name){
		return this.getNotifier(name).disable();
	},

	clear: function(){
		for(var name in this.notifiers){
			this.removeListener(name);
			this.notifiers[name].clear();
		}
		this.notifiers = null;
	},

	addListener: function(name, listener, bind, once){
		if( typeof name != 'string' && typeof name != 'number' ){
			throw new TypeError('name expect string or number, ' + name + ' given');
		}

		var notifier = this.getNotifier(name);

		if( notifier.add(listener, bind, once) ){
			this.count++;
		}

		//this.onAdd.notifyArgs(arguments);

		return this;
	},

	removeListener: function(name, listener, bind){
		var notifiers = this.notifiers, notifier;

		if( arguments.length === 0 ){
			for(name in notifiers) this.removeListener(name);
		}
		else{
			name = this.encode(name);

			if( arguments.length === 1 ){
				if( name in notifiers ){
					notifiers[name].forEach(function(watcher){
						this.removeListener(name, watcher.fn, watcher.bind);
					}, this);
				}
			}
			else if( name in notifiers ){
				notifier = notifiers[name];

				if( notifier.remove(listener, bind) ){
					this.count--;
					if( notifier.size === 0 ){
						// on supprime pas, on peut en avoir besoin ne serais-ce que pour conserver
						// le fait que ce notifier est disabled
						//this.size--;
						//delete notifiers[name];
					}
				}

				//this.onRemove.notifyArgs(arguments);
			}
		}

		return this;
	},

	addVolatileListener: function(name, listener, bind){
		return this.addListener(name, listener, bind, true);
	},

	applyListeners: function(name, args){
		//this.onNotify.notifyArgs(arguments);
		name = this.encode(name);

		if( name in this.notifiers ){
			var notifier = this.notifiers[name];
			notifier.bind = this.bind;
			notifier.objectMethod = this.objectMethod;
			notifier.notifyArgs(args);
		}

		return this;
	},

	callListeners: function(name){
		return this.applyListeners(name, Array.prototype.slice.call(arguments, 1));
	},

	/*
	implement multiple event writing style:
	on({focus: function(){}, blur: function(){}});
	off('focus blur');
	emit('focus blur', true);
	*/
	eachEvent: function(method, bind, args){
		var name, key;

		if( args.length === 0 ){
			method.call(bind);
		}
		else{
			name = args[0];

			if( typeof name == 'string' ){
				if( this.eventRegExp.test(name) ){
					args[0] = name.split(this.eventRegExp);
					return this.eachEvent(method, bind, args);
				}
				else{
					method.apply(bind, args);
				}
			}
			else if( typeof name == 'number' ){
				method.apply(bind, args);
			}
			else if( name instanceof Array ){
				var i = 0, j = name.length;
				for(;i<j;i++){
					args[0] = name[i];
					method.apply(bind, args);
				}
			}
			else if( typeof name == 'object' ){
				args = Array.prototype.slice.call(args, 1);
				for(key in name){
					method.apply(bind, [key, name[key]].concat(args));
				}
			}
		}

		return this;
	},

	on: function(){
		return this.eachEvent(this.addListener, this, arguments);
	},

	off: function(){
		return this.eachEvent(this.removeListener, this, arguments);
	},

	once: function(){
		return this.eachEvent(this.addVolatileListener, this, arguments);
	},

	emit: function(){
		return this.eachEvent(this.callListeners, this, arguments);
	}
});

return Emitter;