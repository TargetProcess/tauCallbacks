# tauCallbacks [![Build Status](https://travis-ci.org/TargetProcess/tauCallbacks.svg?branch=master)](https://travis-ci.org/TargetProcess/tauCallbacks)

A multi-purpose callbacks list object that provides a powerful way to manage callback lists. API is very close to [jQuery's `$.Callbacks`](http://api.jquery.com/category/callbacks-object/) to allow easy migration and adoption.

## Quick API reference

- `callbacks.add(handler, [scope])`, `callbacks.on(handler, [scope])`

  Add a callback to a callback list, and optionally set its execution context to `scope`. The same callback function could be added multiple times with different `scope`s to allow adding the same class method with different class instances.

- `callbacks.one(handler, [scope])`, `callbacks.once(handler, [scope])`

  Add an one-time callback to a callback list. Callback will be removed from list after first `fire()`.

- `callbacks.fire(args)`, `callbacks.trigger(args)`

  Call all of the callbacks with the given arguments.

- `callbacks.remove(handler, [scope])`, `callbacks.off(handler, [scope])`

  Remove specified callback with the given `scope` from a list.

- `callbacks.remove(scope)`, `callbacks.off(scope)`

  Remove all of the callbacks with the given `scope` from a list.

- `callbacks.removeAll()`, `callbacks.empty()`

  Remove all of the callbacks from a list.

- `callbacks.buffer(f, scope)`

  Perform operation `f` which calls `fire()` multiple times, and then call `fire()` only once. Sort of `debounce`.

## Differences from [jQuery's Callbacks](http://api.jquery.com/category/callbacks-object/)

| Method | Diff | jQuery Callbacks | tauCallbacks |
| ------------- | --- | --- | --- |
| `add`         | !== | Add a callback or a collection of callbacks to a callback list | Add only one callback, optionally with the given context |
| `disable`     | !== | Disable a callback list from doing anything more | - |
| `disabled`    | !== | Determine if the callbacks list has been disabled | - |
| `empty`       | === | Remove all of the callbacks | Remove all of the callbacks |
| `fire`        | === | Call all of the callbacks with the given arguments | Call all of the callbacks with the given arguments |
| `fired`       | !== | Determine if the callbacks have already been called at least once | - |
| `fireWith`    | !== | Call all callbacks in a list with the given context and arguments | - |
| `has`         | !== | Determine whether or not the list has any callbacks attached | - |
| `lock`        | !== | Lock a callback list in its current state | - |
| `locked`      | !== | Determine if the callbacks list has been locked | - |
| `remove`      | !== | Remove a callback or a collection of callbacks from a callback list | Remove a callback or a collection of callbacks with the same scope from a callback list |
| `on`          | !== | - | Synonym to `add` |
| `one`, `once` | !== | - | Add an one-time callback to a callback list |
| `off`         | !== | - | Synonym to `remove` |
| `trigger`     | !== | - | Synonym to `fire` |
| `removeAll`   | !== | - | Synonym to `empty` |
| `buffer`      | !== | - | Debounce `fire` while performing some operation |
