const DEFAULT_DB_NAME = 'lru_cache';
const DB_VERSION = 1;
const DEFAULT_STORE_NAME = 'default_storeName';
const KEY = 'key';
const ACCESS = 'ACCESS';
const EXPIRY = 'EXPIRY';
const RW = 'readwrite';

class Cache {
	constructor(store) {
		this._store = store;
	}

	async set(_key, _value, _options) {}

	get(key) {
		return new Promise((resolve, reject) => {
			const keys = this._store.index(KEY);
			const request = keys.get(key);
			request.addEventListener('error', (event) => {
				reject(event);
			});
			request.onsuccess = (event) => {
				// TODO update lastAccessDate
				// TODO check expiry
				resolve(event.target.result);
			};
		});
	}

	async has(_key) {}

	async delete(_key) {}

	async clear() {}

	gc() {
		return new Promise((resolve, reject) => {
			const now = new Date();
			const range = IDBKeyRange.upperBound(now, true);
			const index = this._store.index(ACCESS);
			const request = index.openCursor(range);
			request.addEventListener('error', (event) => {
				reject(event);
			});
			request.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					// TODO delete entry
					// see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#using_an_index
					cursor.continue();
				}
			};
		});
	}
}

// TODO Use idb instead.
const cache = ({dbName, dbVersion, storeName}) =>
	new Promise((resolve, reject) => {
		dbName = dbName ?? DEFAULT_DB_NAME;
		dbVersion = dbVersion ?? DB_VERSION;
		storeName = storeName ?? DEFAULT_STORE_NAME;

		const request = window.indexedDB.open(dbName, dbVersion);

		request.addEventListener('error', (event) => {
			reject(event);
		});

		request.onupgradeneeded = function (event) {
			const db = event.target.result;

			const store = db.createObjectStore(storeName, {keyPath: KEY});
			store.createIndex(EXPIRY, EXPIRY, {unique: false});
			store.createIndex(ACCESS, ACCESS, {unique: false});
		};

		request.onsuccess = function (event) {
			const db = event.target.result;
			const store = db.transaction([storeName], RW).objectStore(storeName);
			resolve(new Cache(store));
		};
	});

export default cache;
