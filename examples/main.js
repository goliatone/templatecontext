/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'extend': 'gextend/extend',
        'keypath': 'gkeypath/keypath',
        'templatecontext': 'templatecontext'
    }
});

define(['templatecontext'], function(templatecontext) {
    console.log('Loading');
    var templatecontext = new templatecontext();
    templatecontext.init();
});