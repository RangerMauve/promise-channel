import * as Deferred from "promise-defer";

class Channel<T> {
	private _readQueue: Array<PendingRead<T>>
	private _writeQueue: Array<PendingWrite<T>>
	private _open: boolean
	private _onClose: Deferred

	constructor(){
		this._open = true;
		this._onClose = new Deferred();
		this._readQueue = [];
		this._writeQueue = [];
	}

	get open() : boolean {
		return this._open;
	}

	get onClose() : Promise<any> {
		return this._onClose;
	}

	close(reason?) : Promise<void> {
		this._open = false;

		this._onClose.resolve(reason);

		let e = new CloseError(reason);

		for(let pending of this._readQueue)
			pending.reject(e);
		
		for(let pending of this._writeQueue)
			pending.reject(e);

		return this._onClose.promise;
	}

	read() : Promise<T> {
		if(!this._open)
			return Promise.reject(new CloseError("Read while closed"));

		if(this._writeQueue.length) {
			let write = this._writeQueue.shift();
			let value = write.value;
			write.resolve();

			return Promise.resolve(value);
		}

		let read = new PendingRead<T>();

		this._readQueue.push(read);

		return read.promise;
	}

	write(value: T) : Promise<void> {
		if(!this.open)
			return Promise.reject(new CloseError("Write while closed"));
		
		if(this._readQueue.length) {
			let read = this._readQueue.shift();
			read.resolve(value);

			return Promise.resolve();
		}

		var write = new PendingWrite<T>(value);

		this._writeQueue.push(write);

		return write.promise;
	}

	async* [Symbol.asyncIterator]() : AsyncIterableIterator<T> {
		var channel = this;
		try {
			while(channel.open) {
				var result = await channel.read();
				yield result;
			}
		} catch(e){
			if(e instanceof CloseError) {
				return e.reason;
			} else {
				throw e;
			}
		}
	}
}

class CloseError extends Error {
	reason: any
	closed: true
	constructor(reason) {
		super("Channel closed");
		this.closed = true;
		this.reason = reason;
	}
}

class PendingWrite<T> {
	value: T

	constructor(value: T) {
		this.value = value;
		this.deferred = new Deferred();
	}
	
	private deferred: Deferred

	get promise(): Promise<void>{
		return this.deferred.promise;
	}

	resolve() {
		this.deferred.resolve();
	}

	reject(e) {
		this.deferred.reject(e);
	}
}

class PendingRead<T> {
	private deferred: Deferred

	constructor() {
		this.deferred = new Deferred();
	}

	get promise() : Promise<T> {
		return this.deferred.promise;
	}

	resolve(value: T) {
		this.deferred.resolve(value);
	}

	reject(e) {
		this.deferred.reject(e);
	}
}

export default Channel;