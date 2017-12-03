var test = require("blue-tape");
var assertRejected = require("assert-rejected");
var assert = require("assert");
var make = require("./");

test("Should be able to queue multiple reads", function(t) {
	var chan = make();
	chan();
	chan();
	t.end();
});

test("Should be able to queue multiple writes", function(t) {
	var chan = make();
	chan("Test");
	chan("Test");
	t.end();
});

test("Read should resolve after a write", function(t) {
	var chan = make();
	var read = chan();
	chan("Test");
	return read;
});

test("Reads should resolve to the value in the write", function(t) {
	var chan = make();
	var read = chan();
	chan("Test");
	return read.then(function(value) {
		assert.equal(value, "Test", "Result of read didn't match");
	});
});

test("Read should resolve if write was already queued", function(t) {
	var chan = make();
	chan("Test");
	var read = chan();
	return read.then(function(value) {
		assert.equal(value, "Test", "Result of read didn't match");
	});
});


test("Write should resolve after a read", function(t) {
	var chan = make();
	var write = chan("Test");
	var read = chan();
	return write;
});

test("Channel should be marked as open before close", function(t) {
	var chan = make();
	assert(chan.open, "Channel looks not open");
	t.end();
});

test("Should be able to close a channel", function(t) {
	var chan = make();
	chan.close();
	t.end();
});

test("Channel should be marked as not open after close", function(t) {
	var chan = make();
	chan.close();
	assert(!chan.open, "Channel looks open");
	t.end();
});

test("Pending reads should reject after close", function(t) {
	var chan = make();
	var read = chan();
	chan.close();
	return assertRejected(read);
});

test("Pending writes should reject after close", function(t) {
	var chan = make();
	var write = chan("Test");
	chan.close();
	return assertRejected(write);
});

test("Subsequent reads should reject after close", function(t) {
	var chan = make();
	chan.close();
	var read = chan();
	return assertRejected(read);
});

test("Subsequent writes should reject after close", function(t) {
	var chan = make();
	chan.close();
	var write = chan("Test");
	return assertRejected(write);
});

test("Closing channel should resolve onClose", function(t) {
	var chan = make();
	chan.close();
	return chan.onClose();
});