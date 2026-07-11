---
title: Storage Module
description: Persistent and asynchronous key/value storage for Jodit. Saves data to localStorage, sessionStorage or IndexedDB and transparently falls back to an in-memory provider when persistent storage is not permitted.
keywords: jodit, storage, persistent storage, local storage, session storage, indexeddb, memory storage, data persistence, async storage
---

# Storage

The storage module is a small key/value abstraction used across the editor to persist
things like the current editing mode, the file browser view, panel sizes, and any state
saved through the [[persistent]] decorator.

It ships with two facades and three underlying providers (engines):

| Facade | API | Providers it can pick |
| --- | --- | --- |
| [[Storage]] | **synchronous** | [[LocalStorageProvider]] (local/session), [[MemoryStorageProvider]] |
| [[AsyncStorage]] | **Promise-based** | [[IndexedDBProvider]], [[LocalStorageProvider]], [[MemoryStorageProvider]] |

At construction time each facade probes whether the requested persistent engine is actually
usable (e.g. the browser may block `localStorage` in private mode, or `IndexedDB` may be
disabled). If it is not, the facade silently falls back to [[MemoryStorageProvider]], so
`set`/`get` never throw — they just stop surviving reloads.

## Using it from a Jodit instance

Every `Jodit`/`View` instance exposes three ready-made storages (see `core/view/view.ts`):

```js
const jodit = Jodit.make('#editor');

// Persistent, synchronous, scoped to this editor instance (suffix = jodit.id)
jodit.storage.set('height', 300);
jodit.storage.get('height'); // 300 (survives page reload)

// Persistent, asynchronous (IndexedDB when available), same scope
await jodit.asyncStorage.set('draft', { html: '<p>hi</p>' });
await jodit.asyncStorage.get('draft'); // { html: '<p>hi</p>' }

// Non-persistent scratch space, shared process-wide (always memory-backed)
jodit.buffer.set('copyFormat', style);
jodit.buffer.get('copyFormat');
```

- `jodit.storage` — `Storage.makeStorage(true, jodit.id)`, **deprecated** in favour of `asyncStorage`.
- `jodit.asyncStorage` — `AsyncStorage.makeStorage(true, jodit.id, jodit.o.asyncStorage)`; prefer this for new code.
- `jodit.buffer` — `Storage.makeStorage()` (no persistence), for transient data.

### Choosing the provider via editor config

The provider that backs `jodit.asyncStorage` can be configured with the `asyncStorage`
editor option. By default it is persistent `IndexedDB` (with a memory fallback); set
`defaultProvider` to override it:

```js
// Persist in localStorage instead of IndexedDB
Jodit.make('#editor', { asyncStorage: { defaultProvider: 'local' } });

// Keep everything in memory (nothing survives a reload)
Jodit.make('#editor', { asyncStorage: { defaultProvider: 'memory' } });

// Plug in your own backend (any object implementing IAsyncStorage)
Jodit.make('#editor', { asyncStorage: { defaultProvider: myAsyncStorage } });
```

## Using it directly (without a Jodit instance)

Both facades and all providers are exported on `Jodit.modules`, so you can build a standalone
storage without creating an editor. This is exactly how the unit tests exercise the module.

### Synchronous — `Jodit.modules.Storage`

```js
const { Storage } = Jodit.modules;

// makeStorage(persistentOrStrategy = false, suffix?)
const storage = Storage.makeStorage('localStorage', 'myApp');

storage.set('theme', 'dark'); // chainable — returns `this`
storage.get('theme'); // 'dark'
storage.get('missing'); // undefined
storage.exists('theme'); // true
storage.delete('theme');
storage.clear();
```

`persistentOrStrategy` accepts:

| Value | Engine chosen |
| --- | --- |
| `false` *(default)* | [[MemoryStorageProvider]] |
| `true` | [[LocalStorageProvider]] with `localStorage` (memory fallback) |
| `'localStorage'` | [[LocalStorageProvider]] with `localStorage` (memory fallback) |
| `'sessionStorage'` | [[LocalStorageProvider]] with `sessionStorage` (memory fallback) |

### Asynchronous — `Jodit.modules.AsyncStorage`

Same shape, but every method returns a `Promise`. It adds `IndexedDB` support and a `close()`
method (only meaningful for IndexedDB — it releases the DB connection).

```js
const { AsyncStorage } = Jodit.modules;

// makeStorage(persistentOrStrategy = false, suffix?, options?)
const storage = AsyncStorage.makeStorage('indexedDB', 'myApp');

await storage.set('user', { id: 1, name: 'Ann' });
await storage.get('user'); // { id: 1, name: 'Ann' }
await storage.exists('user'); // true
await storage.delete('user');
await storage.clear();
await storage.close(); // release the IndexedDB connection when done
```

#### Overriding the provider — `options.defaultProvider`

The optional third argument lets you force which provider backs the storage, regardless of
the first argument. When omitted the storage behaves exactly as before.

```js
// localStorage instead of the default IndexedDB
AsyncStorage.makeStorage(true, 'myApp', { defaultProvider: 'local' });

// in-memory only
AsyncStorage.makeStorage(true, 'myApp', { defaultProvider: 'memory' });

// your own IAsyncStorage implementation (set/delete/get/exists/clear/close)
AsyncStorage.makeStorage(true, 'myApp', { defaultProvider: myAsyncStorage });
```

| `defaultProvider` | Engine used |
| --- | --- |
| *(omitted)* | Falls back to the first-argument strategy (default: IndexedDB) |
| `'local'` | [[LocalStorageProvider]] with `localStorage` (memory fallback) |
| `'memory'` | [[MemoryStorageProvider]] |
| an `IAsyncStorage` object | Your implementation, used as-is |

A custom provider is still wrapped by the facade, so keys passed to it are namespaced
(`Jodit_` + suffix, camelCased) just like the built-in providers.

`persistentOrStrategy` for `AsyncStorage`:

| Value | Engine chosen |
| --- | --- |
| `false` *(default)* | [[MemoryStorageProvider]] |
| `true` | [[IndexedDBProvider]] (memory fallback if IndexedDB is unavailable) |
| `'indexedDB'` | [[IndexedDBProvider]] (memory fallback) |
| `'localStorage'` | [[LocalStorageProvider]] with `localStorage` |
| `'sessionStorage'` | [[LocalStorageProvider]] with `sessionStorage` |

Because provider selection for IndexedDB is itself asynchronous, the facade wraps a
`Promise<provider>` internally and each call awaits it. You never see that promise — just
`await` the storage methods.

### Using a provider directly

The engines implement `IStorage` / `IAsyncStorage` and can be instantiated on their own when
you want full control over the root key and no `Jodit_`/camelCase key mangling (see caveats
below):

```js
const { LocalStorageProvider, MemoryStorageProvider, IndexedDBProvider } = Jodit.modules;

const local = new LocalStorageProvider('rootKey', 'sessionStorage');
local.set('a', 1);

const mem = new MemoryStorageProvider();

const idb = new IndexedDBProvider('myDb', 'keyValueStore');
await idb.set('a', 1);
// IndexedDBProvider also has extras not on the IStorage interface:
await idb.keys(); // ['a']
await idb.values(); // [1]
await idb.entries(); // [['a', 1]]
await idb.close();
```

## Feature detection

Two helpers are exported so you can check availability before choosing a strategy:

```js
// Synchronous — probes localStorage / sessionStorage by writing a temp key.
Jodit.modules.canUsePersistentStorage('localStorage'); // boolean
Jodit.modules.canUsePersistentStorage('sessionStorage'); // boolean

// Asynchronous — opens a throwaway IndexedDB database. Result is cached.
await Jodit.modules.canUseIndexedDB(); // Promise<boolean>
Jodit.modules.clearUseIndexedDBCache(); // reset the cached result (used in tests)
```

## Namespacing: prefix, suffix and key mangling

- Every facade prefixes stored keys with `Jodit_` (exported as `StorageKey`).
- The optional `suffix` passed to `makeStorage` is appended to that prefix, letting several
  independent storages coexist (`Jodit.make` uses the editor's `id` as the suffix so two
  editors on the same page don't clobber each other's data).
- Keys are run through `camelCase`, so `storage.set('my-key')` and `storage.set('myKey')`
  address **the same** entry. Prefer plain identifiers for keys.

```js
Storage.makeStorage(true, 'app1').set('key', 'a');
Storage.makeStorage(true, 'app2').set('key', 'b');
// 'app1' and 'app2' are isolated: each 'key' keeps its own value.
```

## Supported value types

Anything JSON-serialisable: `string`, `number`, `boolean`, `null`, plain objects and arrays
(`StorageValueType`). `LocalStorageProvider` and `IndexedDBProvider` round-trip values through
serialisation, so don't store class instances, functions, `Date`, `undefined`, etc. and expect
them back intact. `MemoryStorageProvider` keeps the original reference in a `Map`.

## Caveats

- **One scope is one JSON blob.** All keys of a `LocalStorageProvider` instance live inside a
  single JSON object under one `rootKey`. `delete(key)` removes just that key (the rest of the
  scope is preserved); `clear()` drops the whole blob.
- **Failures are swallowed.** Providers wrap storage access in `try/catch` and fall back
  silently. A blocked `localStorage`, quota error, or private-mode restriction turns into a
  no-op / memory fallback rather than an exception.
- **`asyncStorage.close()`** should be called when you're finished with an IndexedDB-backed
  storage to release the connection; the editor does this automatically on `beforeDestruct`.

## API surface

`IStorage<T>` (sync):

```ts
set(key: string, value: T): this;
delete(key: string): this;
get<R = T>(key: string): R | void;
exists(key: string): boolean;
clear(): this;
```

`IAsyncStorage<T>` (async) — same methods returning `Promise`, plus `close(): Promise<void>`.
