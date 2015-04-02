var _ = require('underscore');

module.exports = (function() {
    'use strict';
    /**
     * @class Callbacks
     * @constructor
     */
    var Callbacks = function() {
        this._subscriptions = [];
        this._bufferEntries = 0;
        this._bufferArguments = null;
    };

    Callbacks.prototype = {
        /** @type Array */
        _subscriptions: null,

        /**
         * Add callback.
         *
         * @param {Function} handler
         * @param {Object} [scope]
         * @returns {Callbacks}
         */
        add: function(handler, scope) {
            var index = this._findHandlerIndex(handler, scope);
            if (index < 0) {
                this._subscriptions.push({
                    handler: handler,
                    scope: scope
                });
            }
            return this;
        },

        once: function(handler, scope) {
            var index = this._findHandlerIndex(handler, scope);
            if (index < 0) {
                this._subscriptions.push({
                    handler: function(handler, scope, data) {
                        handler.call(scope, data);
                        this._removeHandler(handler, scope);
                    }.bind(this, handler, scope),
                    originalHandler: handler,
                    scope: scope
                });
            }
            return this;
        },

        /**
         * Fire (trigger) event.
         *
         * @param {Object} [args...]
         * @returns {Callbacks}
         */
        fire: function(args) {
            if (this._subscriptions.length) {
                args = _.toArray(arguments);

                if (this._bufferEntries > 0) {
                    this._bufferArguments = args;
                    return this;
                }

                // clone subscriptions because `once` handlers may modify this._subscriptions during the loop
                var subscriptions = this._subscriptions.slice();
                for (var i = 0, len = subscriptions.length; i < len; i++) {
                    var subscription = subscriptions[i];
                    subscription.handler.apply(subscription.scope, args);
                }
            }
            return this;
        },

        /**
         * Unsubscribe. Remove handler or entire scope.
         *
         * @param {Function} [handler]
         * @param {Object} [scope]
         * @returns {Callbacks}
         */
        remove: function(handler, scope) {
            if (_.isFunction(handler)) {
                this._removeHandler(handler, scope);
            } else {
                scope = handler;
                this._removeScope(scope);
            }
            return this;
        },

        removeAll: function() {
            this._subscriptions = [];
            return this;
        },

        buffer: function(f, scope) {
            this._bufferEntries++;
            try {
                return f.call(scope);
            } finally {
                this._bufferEntries--;
                if (this._bufferEntries === 0) {
                    this.fire.apply(this, this._bufferArguments);
                    this._bufferArguments = null;
                }
            }
        },

        _findHandlerIndex: function(handler, scope) {
            return _.findIndex(this._subscriptions, function(subscription) {
                return subscription.scope === scope &&
                    (subscription.handler === handler || subscription.originalHandler === handler);
            });
        },

        _removeHandler: function(handler, scope) {
            var index = this._findHandlerIndex(handler, scope);
            if (index >= 0) {
                this._subscriptions.splice(index, 1);
            }
        },

        _removeScope: function(scope) {
            this._subscriptions = _.reject(this._subscriptions, function(subscription) {
                return subscription.scope === scope;
            });
        }
    };

    Callbacks.prototype.empty = Callbacks.prototype.removeAll;
    Callbacks.prototype.on = Callbacks.prototype.add;
    Callbacks.prototype.one = Callbacks.prototype.once;
    Callbacks.prototype.off = Callbacks.prototype.remove;
    Callbacks.prototype.trigger = Callbacks.prototype.fire;

    return Callbacks;
})();
