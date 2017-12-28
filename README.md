# promise-channel
Like Go Channels, but using JavaScript Promises.

Supports [async-await](https://github.com/tc39/ecmascript-asyncawait) and [async-iteration](https://github.com/tc39/proposal-async-iteration).
```
npm install --save promise-channel
```

## Example
This should look pretty familiar if you've used [goroutines](https://gobyexample.com/goroutines) with [go channels](https://tour.golang.org/concurrency/2);

```JavaScript
import Channel from "promise-channel";

var channel = new Channel();

channel.onClose.then(function(){
    console.log("Closed");
});

Promise.all([
    alice(channel),
    bob(channel),
]).then(function() {
    channel.close();
}).catch(function (e) {
    console.error(e.stack);
});

async function alice(channel) {
    var name = await channel.read();
    await channel.write("Hello, " + name);
}

async function bob(channel) {
    await channel.write("World");
    var greeting = await channel.read();

    console.log(greeting);
}
```

## API
### `Channel`
The module exports the Channel class which should be intstantiated with `new`

### `channel.read()`
Attempts to read from the channel. Will throw if the channel is closed.

#### return
A promise which resolves to whatever value is written to the channel next.

### `channel.write(value)`
Writes data to the channel. Will throw if the channel is closed.

#### arguments
- `value` : The value to write to the channel

#### return
A promise which resolves once something has read from the channel.

### `channel.close(reason)`
Closes the channel so that all pending and subsequent reads/writes will be rejected.

### arguments
- `reason` : An optional reason for closing the channel, will be passed to the onClose promise

### `channel.open`
Boolean property which tells you whether the channel is currently open

### `channel.onClose`
Read-only promise that resolves once the channel is closed
