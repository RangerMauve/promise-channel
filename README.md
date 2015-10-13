# promise-channel
Like Go Channels, but using JavaScript Promises.

```
npm install --save promise-channel
```

## Example
This example assumes a [babel](https://babeljs.io/) environment and uses [async functions](https://github.com/tc39/ecmascript-asyncawait). If you aren't using babel, this works well with generators wrapped by [co](https://www.npmjs.com/package/co). Reads and writes return promises, so you could use whatever flow control you want around that.

This should look pretty familiar if you've used [goroutines](https://gobyexample.com/goroutines) with [go channels](https://tour.golang.org/concurrency/2);

```JavaScript
var makeChannel = require("promise-channel");

var channel = makeChannel();

Promise.all([
    alice(channel),
    bob(channel)
]).then(function() {
    channel.close();
}).catch(function (e) {
    console.error(e.stack);
});

async function alice(channel) {
    var name = await channel();
    await channel("Hello, " + name);
}

async function bob(channel) {
    await channel("World");
    var greeting = await channel();

    console.log(greeting);
}
```

## API
### `make()`
This is the default export from the module.

#### return
A new channel

### `channel()`
When you invoke the channel without any arguments (or with undefined), this is considered a read.

#### return
A promise which resolves to whatever value is written to the channel next.

### `channel(value)`
When you invoke the channel with an argument, the value is then passed to whatever reads from the channel next.

#### arguments
- `value` : The value to write to the channel

#### return
A promise which resolves once something has read from the channel.

### `channel.close()`
Closes the channel so that all pending and subsequent reads/writes will be rejected.

### `channel.open`
Property which tells you whether the channel is currently open
