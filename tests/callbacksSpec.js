/*global describe, it, expect*/
var _ = require('underscore');
var Callbacks = require('../callbacks');

describe('Callbacks', function() {
    it('should provide fluent interface', function(done) {
        var callbacks = new Callbacks();

        var basicMethods = ['add', 'fire', 'remove', 'empty'];
        var methodAliases = ['on', 'off', 'removeAll', 'trigger'];
        var additionalMethods = ['one', 'once'];

        var methods = _.flatten([basicMethods, methodAliases, additionalMethods]);

        _.each(methods, function(methodName) {
            expect(_.isFunction(callbacks[methodName])).toBeTruthy();

            var result = callbacks[methodName](function() {
            });
            expect(result).toBe(callbacks);
        });
        done();
    });
});

describe('add', function() {
    it('should preserve scope', function(done) {
        expect(2);

        var object = {
            callback: function(data) {
                expect(data).toEqual('data');
                expect(this).toBe(object);
            }
        };

        new Callbacks()
            .add(object.callback, object)
            .fire('data');

        done();
    });

    it('should preserve scope (2)', function(done) {
        var object = {},
            callback = function(data) {
                expect(data).toEqual('data');
                expect(this).toBe(object);
            };

        new Callbacks()
            .add(callback, object)
            .fire('data');

        done();
    });
});

describe('once', function() {
    it('should call callback once', function(done) {
        var count = 0,
            callback = function() {
                count++;
            };

        new Callbacks()
            .once(callback)
            .fire()
            .fire()
            .fire();

        expect(count).toEqual(1);
        done();
    });
});

describe('fire', function() {
    it('callback is called with proper sequence of events', function(done) {
        var events = [],
            callback = function(data) {
                events.push(data);
            };

        new Callbacks().fire('1').add(callback).fire('2').fire('3');

        expect(events.join(' ')).toEqual('2 3');

        done();
    });

    it('fire with accumulated arguments', function(done) {
        var args = [];

        var callback = function() {
            args.push(_.toArray(arguments));
        };

        new Callbacks()
            .add(callback)
            .fire()
            .fire(1)
            .fire(21, 22)
            .fire(31, 32, 33);

        expect(args).toEqual([
            [],
            [1],
            [21, 22],
            [31, 32, 33]
        ]);

        done();
    });
});

describe('remove', function() {
    it('should not fire callbacks after it removal', function(done) {
        var callbackWithScopeCalled = 0,
            callbackWithoutScopeCalled = 0,
            object = {
                callbackWithScope: function() {
                    callbackWithScopeCalled++;
                }
            },
            callbackWithoutScope = function() {
                callbackWithoutScopeCalled++;
            };

        new Callbacks()
            .add(object.callbackWithScope, object)
            .add(callbackWithoutScope)
            .fire()
            .remove(object.callbackWithScope, object)
            .remove(callbackWithoutScope)
            .fire();

        expect(callbackWithScopeCalled).toBe(1);
        expect(callbackWithoutScopeCalled).toBe(1);

        done();
    });

    it('should keep second scope when first was removed', function(done) {
        var scope1 = {
                called: 0
            },
            scope2 = {
                called: 0
            },
            callback = function() {
                this.called++;
            };

        new Callbacks()
            .add(callback, scope1)
            .add(callback, scope2)
            .fire()
            .remove(scope1)
            .fire();

        expect(scope1.called).toBe(1);
        expect(scope2.called).toBe(2);
        done();
    });
});

describe('buffer', function() {
    function spyFire(callbacks) {
        var passedArgs = [];
        callbacks.add(function() {
            passedArgs.push(_.toArray(arguments));
        });
        return passedArgs;
    }

    it('should call only last event', function(done) {
        var callbacks = new Callbacks();
        var passedArgs = spyFire(callbacks);

        callbacks.buffer(function() {
            callbacks.fire(1, 2);
            callbacks.fire(10, 20);
            callbacks.fire(100, 200);
        });

        expect(passedArgs).toEqual([[100, 200]]);
        done();
    });

    it('should fire events normally after exiting', function(done) {
        var callbacks = new Callbacks();
        var passedArgs = spyFire(callbacks);

        callbacks.buffer(function() {
            callbacks.fire(100, 200);
        });

        callbacks.fire(1000, 2000);
        expect(passedArgs).toEqual([[100, 200], [1000, 2000]]);
        done();
    });

    it('should fire last event before exception', function(done) {
        var callbacks = new Callbacks();
        var passedArgs = spyFire(callbacks);

        try {
            callbacks.buffer(function() {
                callbacks.fire(1, 2);
                callbacks.fire(10, 20);
                throw new Error('Test error');
            });
        } catch (ignored) {

        }

        expect(passedArgs).toEqual([[10, 20]]);
        done();
    });

    it('should fire events outside buffer ended with exception', function(done) {
        var callbacks = new Callbacks();
        var passedArgs = spyFire(callbacks);

        try {
            callbacks.buffer(function() {
                callbacks.fire(10, 20);
                throw new Error('Test error');
            });
        } catch (ignored) {

        }

        callbacks.fire(100, 200);

        expect(passedArgs).toEqual([[10, 20], [100, 200]]);
        done();
    });

    it('should not fire events when buffered function did not fire', function(done) {
        var callbacks = new Callbacks();
        var passedArgs = spyFire(callbacks);

        callbacks.buffer(_.noop);

        expect(passedArgs).toEqual([]);
        done();
    });
});
