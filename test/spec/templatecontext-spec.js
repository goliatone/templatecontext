/*global define:true, describe:true , it:true , expect:true,
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['templatecontext'], function(TemplateContext) {

    var DEFAULTS = TemplateContext.DEFAULTS;
    describe('just checking', function() {
        var context;
        beforeEach(function() {
            context = new TemplateContext();
        });

        it('templatecontext should be loaded', function() {
            expect(TemplateContext).toBeTruthy();
        });

        it('should not initialize twice', function() {
            expect(context.initialized).toBeTruthy();
        });

        it('on create it should be extended with DEFAULT object', function() {
            expect(TemplateContext.DEFAULTS).toBeTruthy();
            var properties = Object.keys(TemplateContext.DEFAULTS);
            properties.forEach(function(property) {
                expect(context).toHaveProperties(property);
            });
        });

        it('config options should override DEFAULTS', function() {

            var properties = Object.keys(TemplateContext.DEFAULTS);
            var config = {};
            properties.forEach(function(property) {
                config[property] = property + '_TST_';
            });
            context = new TemplateContext(config);

            properties.forEach(function(property) {
                expect(context[property]).toBe(property + '_TST_');
            });
        });

        //TODO: defaults.

        it('update should extend the context object with the passed in data', function() {
            var data = {
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };
            var out = context.update(data);
            expect(out).toMatchObject(data);
        });

        it('update should reset src object if state is TRUE', function() {

            var data1 = {
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };

            var data2 = {
                firstname: 'firstName2',
                address: {
                    street: 'Street 2'
                }
            };

            context.update(data1);

            var out = context.update(data2, true);

            expect(out).toMatchObject(data2);
        });

        it('update should override previous data object', function() {
            var data1 = {
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };

            var data2 = {
                firstname: 'firstName2',
                address: {
                    street: 'Street 2'
                }
            };

            var expected = {
                firstname: 'firstName2',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 2',
                    zip: '00000'
                }
            };

            context.update(data1);

            var out = context.update(data2);

            expect(out).toMatchObject(expected);
        });

        it('an inexistent state ID should not have consequences', function() {
            var data = {
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };
            var out = context.update(data, 'NON_STATE');
            expect(out).toMatchObject(data);
        });

        it('update with state ID should include state object', function() {

            context = new TemplateContext({
                states: {
                    'state1': {
                        'active': true,
                        'state': 'state1'
                    }
                }
            });

            var data = {
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };

            var expected = {
                active: true,
                state: 'state1',
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };

            var out = context.update(data, 'state1');

            expect(out).toMatchObject(expected);
        });

        it('applyTransforms should apply specified transforms', function() {
            context = new TemplateContext({
                transforms: {
                    removeId: function(data) {
                        delete data['id'];
                    },
                    addUID: function(data) {
                        data.UID = 'x1';
                    }
                }
            });

            var data = {
                id: 1
            };

            var expected = {
                UID: 'x1'
            };

            var out = context.update(data);
            context.applyTransforms('addUID');
            context.applyTransforms('removeId');

            expect(out).toMatchObject(expected);
        });

        it('applyTransforms should handle undefined transforms', function() {
            var data = {
                id: 1
            };

            var out = context.update(data);
            context.applyTransforms('removeId');

            expect(out).toMatchObject(data);
        });

        it('registerFormatter should add registered formatters', function() {
            var spy = sinon.spy();
            context.registerFormatter('capitalize', spy);
            context.update({});
            expect(context.data).toHaveProperties('capitalize');
        });

        it('registerFormatter should not add undefined formatters', function() {
            var spy = sinon.spy();
            context.registerFormatter('capitalize', null);
            context.update({});
            expect(context.data.hasOwnProperty('capitalize')).toBeFalsy();
        });

        it('we can add default values', function() {
            var expected = {
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };
            context = new TemplateContext({
                defaults: expected
            });

            var out = context.update({});
            expect(out).toMatchObject(expected);
        });

        it('we can use defaults to reset before each update or mergeState', function() {
            var data0 = {
                firstname: 'firstName0'
            };

            var data1 = {
                firstname: 'firstName1'
            };

            var data2 = {
                lastname: 'lastName2'
            };

            var expected = {
                firstname: 'firstName0',
                lastname: 'lastName2'

            }

            context = new TemplateContext({
                defaults: data0
            });

            var out = context.update({});
            expect(out).toMatchObject(data0);
            context.update(data1);
            context.update(data2);
            expect(out).toMatchObject(expected);
        });

        it('mergeState should handle merging states by state ID', function() {
            var state0 = {
                'active': true,
                'state': 'state0'
            };

            context = new TemplateContext({
                states: {
                    'state0': state0
                }
            });

            var expected = state0;

            context.mergeState('state0');
            var out = context.data;
            expect(out).toMatchObject(expected);
        });

        it('mergeState should merge multiple states', function() {
            var state0 = {
                'active': true,
                'state': 'state0'
            };

            var state1 = {
                'state': 'state1'
            };

            var expected = {
                'active': true,
                'state': 'state1'
            };

            context = new TemplateContext({
                states: {
                    'state0': state0,
                    'state1': state1
                }
            });

            context.mergeState('state0');
            context.mergeState('state1');
            var out = context.data;

            expect(out).toMatchObject(expected);
        });

        it('mergeState should reset source object if second argument is TRUE', function() {
            var state0 = {
                'active': true,
                'state': 'state0'
            };

            var state1 = {
                'state': 'state1'
            };

            context = new TemplateContext({
                states: {
                    'state0': state0,
                    'state1': state1
                }
            });

            var expected = state1;

            context.mergeState('state0');
            context.mergeState('state1', true);
            var out = context.data;
            expect(out).toMatchObject(expected);
        });

        it('provided an emit method, it should notify of changes', function() {
            var spy = sinon.spy();
            context = new TemplateContext({
                emit: spy
            });
            var data = {
                firstname: 'firstName1'
            };

            var out = context.update(data);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledOnce();
            expect(spy).toHaveBeenCalledWith(context.updateEventType);
        });

        it('eventType should construct event types', function() {
            expect(context.eventType('type')).toEqual('type');
        });

        it('eventType should construct event types with attached paths', function() {
            var glue = context.changeEventGlue,
                expected = ['type', 'path'].join(glue);

            expect(context.eventType('type', 'path')).toEqual(expected);
        });

        it('merge should be a shortcut for mergeState', function() {
            var state1 = {
                'state': 'state1'
            };

            var context1 = new TemplateContext({
                states: {
                    'state1': state1
                }
            });

            var context2 = new TemplateContext({
                states: {
                    'state1': state1
                }
            });

            var expected = state1;

            context1.merge('state1');
            context2.mergeState('state1');

            expect(context1).toMatchObject(context2);
        });

        it('should have an emit stub method', function() {
            expect(context.emit).toBeTruthy();
        });

        it('should have an logger stub method', function() {
            expect(context.logger).toBeTruthy();
        });

        it('should handle setting properties', function() {
            context.set('path', 'value');
            expect(context.data.hasOwnProperty('path')).toBeTruthy();
            expect(context.data.path).toEqual('value');
        });

        it('should handle setting properties using keypaths', function() {
            context.set('path.to.prop', 'value');
            expect(context.data.path.to.prop).toEqual('value');
        });

        it('should notify on set changes', function() {
            var spy = sinon.spy();
            context = new TemplateContext({
                emit: spy
            });
            context.set('path', 'value');
            expect(spy).toHaveBeenCalled();
        });

        it('should notify on set path changes', function() {
            var spy = sinon.spy();
            context = new TemplateContext({
                emit: spy
            });
            context.set('path.to.prop', 'value');
            expect(spy).toHaveBeenCalled();
        });

        it('notify on set path changes should send event object', function() {
            var spy = sinon.spy();
            context = new TemplateContext({
                emit: spy,
                data: {
                    path: 'oldValue'
                }
            });

            context.set('path', 'newValue');
            var call = spy.getCall(0);
            var eventType = call.args[0],
                payload = call.args[1];

            expect(eventType).toEqual(context.changeEventType);
            expect(payload).toHaveProperties('old', 'value', 'property');
            expect(payload.old).toEqual('oldValue');
            expect(payload.value).toEqual('newValue');
            expect(payload.property).toEqual('path');
        });

        it('notify on set keypath changes should send event object', function() {
            var spy = sinon.spy();
            context = new TemplateContext({
                emit: spy,
                data: {
                    path: {
                        to: {
                            prop: 'oldValue'
                        }
                    }
                }
            });

            context.set('path.to.prop', 'newValue');
            var call = spy.getCall(0);
            var eventType = call.args[0],
                payload = call.args[1];

            expect(eventType).toEqual(context.changeEventType);
            expect(payload).toHaveProperties('old', 'value', 'property');
            expect(payload.old).toEqual('oldValue');
            expect(payload.value).toEqual('newValue');
            expect(payload.property).toEqual('path.to.prop');
        });

        it('should get value for path', function() {
            context = new TemplateContext({
                data: {
                    path: 'value'
                }
            });

            expect(context.get('path')).toBe('value');
        });

        it('should get value for keypath', function() {
            context = new TemplateContext({
                data: {
                    path: {
                        to: {
                            prop: 'value'
                        }
                    }
                }
            });

            expect(context.get('path.to.prop')).toBe('value');
        });

        it('has should return a boolean value', function() {
            context = new TemplateContext({
                data: {
                    path: 'oldValue'
                }
            });
            expect(context.has('path')).toBeTruthy();
        });
    });
});