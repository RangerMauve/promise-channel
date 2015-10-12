var makeChannel = require("./");

var channel = makeChannel();

Promise.all([
	alice(channel),
	bob(channel)
]).then(function() {
	channel.close();
	console.log("Done!");
}).catch(function(e) {
	console.log(e.stack);
});

async function alice(channel) {
	var name = await channel();

	await channel("Hello, " + name);

	console.log("Alice is done");
}

async function bob(channel) {
	// Tell alice your name
	await channel("World");

	// Get the full greeting from alice
	var greeting = await channel();

	// Say hello
	console.log(greeting);

	console.log("Bob is done");
}
