/*global define:true, describe:true , it:true , expect:true,
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['templatecontext'], function(TemplateContext) {

    describe('just checking', function() {
        var context;
        beforeEach(function() {
            context = new TemplateContext();
        });

        it('templatecontext should be loaded', function() {
            expect(TemplateContext).toBeTruthy();
        });

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
                id: 1,
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };

            var expected = {
                UID: 'x1',
                firstname: 'firstName1',
                lastname: 'lastName1',
                email: 'email1',
                address: {
                    street: 'Street 1',
                    zip: '00000'
                }
            };

            var out = context.update(data);
            context.applyTransforms('addUID');
            context.applyTransforms('removeId');

            expect(out).toMatchObject(expected);

        });
    });
});