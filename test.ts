var test = require("blue-tape");
var assertRejected = require("assert-rejected");
var assert = require("assert");
var make = require("./");

test("Should be able to queue multiple reads", function (t) {
	
});

test("Should be able to queue multiple writes", function (t) {
	
});

test("Read should resolve after a write", function (t) {
	
});

test("Reads should resolve to the value in the write", function (t) {
	
});

test("Read should resolve if write was already queued", function (t) {
	
});


test("Write should resolve after a read", function (t) {
	
});

test("Channel should be marked as open before close", function (t) {
	
});

test("Should be able to close a channel", function (t) {
	
});

test("Channel should be marked as not open after close", function (t) {
	
});

test("Pending reads should reject after close", function (t) {
	
});

test("Pending writes should reject after close", function (t) {
	
});

test("Subsequent reads should reject after close", function (t) {
	
});

test("Subsequent writes should reject after close", function (t) {
	
});

test("Closing channel should resolve onClose", function (t) {
	
});