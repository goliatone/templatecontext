/*global define:true, describe:true , it:true , expect:true,
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['templatecontext'], function(templatecontext) {

    describe('just checking', function() {

        it('templatecontext should be loaded', function() {
            expect(templatecontext).toBeTruthy();
        });
    });
});