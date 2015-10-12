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

module.exports = Channel;

function Channel() {
	var writeQueue = [];
	var readQueue = [];

	return chan;

	function read() {
		if (writeQueue.length) {
			var write = writeQueue.shift();
			var value = write.value;
			var deferWrite = write.deferred;
			deferWrite.resolve();
			return Promise.resolve(value);
		}

		var deferRead = new Deferred();
		readQueue.push(deferRead);
		return deferRead.promise;
	}

	function write(value) {
		if (readQueue.length) {
			var deferRead = readQueue.shift();
			deferRead.resolve(value);
			return Promise.resolve();
		}

		var deferWrite = new Deferred();
		writeQueue.push({
			value: value,
			deferred: deferWrite
		});
		return deferWrite.promise;
	}

	function chan(value) {
		if (value === undefined)
			return read();
		return write(value);
	}
}
