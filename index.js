var Deferred = require("promise-defer");

/*
 * Write queue will contain
 * {
 * 	value: The value that's waiting to be written
 * 	deferred: The deferred that should be resolved once the value has been read
 * }
 *
 * Read queue will contain
 *
 * deferred: The deffered to resolve once a write is made
 */

var CLOSE_MESSAGE = "Channel is closed";

module.exports = make;
make.Channel = Channel;

function make() {
	var channel = new Channel();
	Object.defineProperty(invoke, "open", {
		get: getOpen
	});

	invoke.close = close;

	return invoke;

	function getOpen() {
		return channel.open;
	}

	function close() {
		return channel.close();
	}

	function invoke(value) {
		if (value === undefined)
			return channel.read();
		return channel.write(value);
	}
}

function Channel() {
	this.readQueue = [];
	this.writeQueue = [];
	this.open = true;
}

Channel.prototype = {
	open: true,

	close: close,
	read: read,
	write: write
};

function close() {
	var closeError = new Error(CLOSE_MESSAGE);
	this.open = false;
	this.readQueue.forEach(function(item) {
		item.reject(closeError);
	});
	this.writeQueue.forEach(function(item) {
		item.deferred.reject(closeError);
	});
}

function read() {
	if (!this.open)
		return Promise.reject(new Error(CLOSE_MESSAGE));

	if (this.writeQueue.length) {
		var write = this.writeQueue.shift();
		var value = write.value;
		var deferWrite = write.deferred;

		deferWrite.resolve();

		return Promise.resolve(value);
	}

	var deferRead = new Deferred();

	this.readQueue.push(deferRead);

	return deferRead.promise;
}

function write(value) {
	if (!this.open)
		return Promise.reject(new Error(CLOSE_MESSAGE));

	if (this.readQueue.length) {
		var deferRead = this.readQueue.shift();

		deferRead.resolve(value);

		return Promise.resolve();
	}

	var deferWrite = new Deferred();

	this.writeQueue.push({
		value: value,
		deferred: deferWrite
	});

	return deferWrite.promise;
}
