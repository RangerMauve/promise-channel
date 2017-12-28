// Polyfill for older node.js versions
if(!Symbol.asyncIterator)
	// @ts-ignore
	Symbol.asyncIterator = Symbol.for("asyncIterator");

import Channel from "./";

run()
	.then(() => console.log("Done"))
	.catch((e) => console.log("Error", e));

async function run() {
	let channel = new Channel<number>();

	await Promise.all([
		readFrom(channel),
		writeTo(channel)
	]);
}

async function readFrom(channel: Channel<number>){
	console.log("Reading from channel");
	for await(let number of channel) {
		console.log("Got", number);
	}
	console.log("Done reading");
}

async function writeTo(channel : Channel<number>) {
	console.log("Writing to channel");
	let n = 11;
	while(n--){
		console.log("writing", n);
		await channel.write(n);
		console.log("waiting...");
		await delay(100);
	}
	console.log("Done writing");
}

function delay(ms){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, ms);
	});
}