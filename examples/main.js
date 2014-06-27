/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'templatecontext': 'templatecontext'
    }
});

define(['templatecontext', 'jquery'], function (templatecontext, $) {
    console.log('Loading');
	var templatecontext = new templatecontext();
	templatecontext.init();
});