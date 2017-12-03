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
	invoke.onClose = onClose;

	return invoke;

	function getOpen() {
		return channel.open;
	}

	function close(reason) {
		return channel.close(reason);
	}

	function onClose() {
		return channel.onClose();
	}

	function invoke(value) {
		if (value === undefined)
			return channel.read();
		return channel.write(value);
	}
}

function Channel() {
	this._readQueue = [];
	this._writeQueue = [];
	this._onClosed = new Deferred();
	this.open = true;
}

Channel.prototype = {
	open: true,
	_readQueue: null,
	_writeQueue: null,
	_onClosed: null,

	close: close,
	onClose: onClose,
	read: read,
	write: write
};

function close(reason) {
	var closeError = new Error(CLOSE_MESSAGE);
	this.open = false;
	this._readQueue.forEach(function(item) {
		item.reject(closeError);
	});
	this._writeQueue.forEach(function(item) {
		item.deferred.reject(closeError);
	});
	this._onClosed.resolve(reason);
	return this._onClosed.promise;
}

function onClose() {
	return this._onClosed.promise;
}

function read() {
	if (!this.open)
		return Promise.reject(new Error(CLOSE_MESSAGE));

	if (this._writeQueue.length) {
		var write = this._writeQueue.shift();
		var value = write.value;
		var deferWrite = write.deferred;

		deferWrite.resolve();

		return Promise.resolve(value);
	}

	var deferRead = new Deferred();

	this._readQueue.push(deferRead);

	return deferRead.promise;
}

function write(value) {
	if (!this.open)
		return Promise.reject(new Error(CLOSE_MESSAGE));

	if (this._readQueue.length) {
		var deferRead = this._readQueue.shift();

		deferRead.resolve(value);

		return Promise.resolve();
	}

	var deferWrite = new Deferred();

	this._writeQueue.push({
		value: value,
		deferred: deferWrite
	});

	return deferWrite.promise;
}
