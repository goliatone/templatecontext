/*global define:true, describe:true , it:true , expect:true, 
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['templatecontext', 'jquery'], function(templatecontext, $) {

    describe('just checking', function() {

        it('templatecontext should be loaded', function() {
            expect(templatecontext).toBeTruthy();
            var templatecontext = new templatecontext();
            expect(templatecontext).toBeTruthy();
        });

        it('templatecontext should initialize', function() {
            var templatecontext = new templatecontext();
            var output   = templatecontext.init();
            var expected = 'This is just a stub!';
            expect(output).toEqual(expected);
        });
        
    });

});