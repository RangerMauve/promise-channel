import * as test from "blue-tape";
import * as assertRejected from "assert-rejected";
import * as assert from "assert";
import Channel from "./";

test("Should be able to queue multiple reads", function (t) {
	const chan = new Channel<number>();
	chan.read()
	chan.read();
	t.end();
});

test("Should be able to queue multiple writes", function (t) {
	const chan = new Channel<number>();
	chan.write(420)
	chan.write(420);
	t.end();
});

test("Read should resolve after a write", async function (t) {
	const chan = new Channel<number>();
	
	await Promise.all([
		chan.read(),
		chan.write(420)
	]);
});

test("Reads should resolve to the value in the write", async function (t) {
	const chan = new Channel<number>();
	const willRead = chan.read();

	await chan.write(420);

	const result = await willRead;

	t.equal(result, 420, "Got correct result from read");
});

test("Read should resolve if write was already queued", async function (t) {
	const chan = new Channel<number>();

	chan.write(420);

	await chan.read();
});


test("Write should resolve after a read", async function (t) {
	const chan = new Channel<number>();

	await Promise.all([
		chan.write(420),
		chan.read()
	]);
});

test("Channel should be marked as open before close", function (t) {
	const chan = new Channel<number>();

	t.equal(chan.open, true, "Channel is open");

	t.end();
});

test("Should be able to close a channel", async function (t) {
	const chan = new Channel<number>();

	await chan.close();
});

test("Channel should not be open after close", function (t) {
	const chan = new Channel<number>();

	chan.close();

	t.equal(chan.open, false, "Channel is not open");

	t.end();
});

test("Pending reads should reject after close", async function (t) {
	const chan = new Channel<number>();

	var pendingRead = chan.read();

	chan.close();

	await assertRejected(pendingRead);
});

test("Pending writes should reject after close", async function (t) {
	const chan = new Channel<number>();

	var pendingWrite = chan.read();

	chan.close();

	await assertRejected(pendingWrite);
});

test("Subsequent reads should reject after close", async function (t) {
	const chan = new Channel<number>();
	
	chan.close();

	await assertRejected(chan.read());
});

test("Subsequent writes should reject after close", async function (t) {
	const chan = new Channel<number>();

	chan.close();

	await assertRejected(chan.write(420));
});

test("Closing channel should resolve onClose", async function (t) {
	const chan = new Channel<number>();

	chan.close();

	await chan.onClose;
});