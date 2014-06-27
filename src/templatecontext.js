/*
 * templatecontext
 * https://github.com/goliatone/templatecontext
 * Created with gbase.
 * Copyright (c) 2014 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function(root, name, deps, factory) {
    "use strict";
    // Node
    if (typeof deps === 'function') {
        factory = deps;
        deps = [];
    }

    if (typeof exports === 'object') {
        module.exports = factory.apply(root, deps.map(require));
    } else if (typeof define === 'function' && 'amd' in define) {
        //require js, here we assume the file is named as the lower
        //case module name.
        define(name.toLowerCase(), deps, factory);
    } else {
        // Browser
        var d, i = 0,
            global = root,
            old = global[name],
            mod;
        while ((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function() {
            global[name] = old;
            return mod;
        };
    }
}(this, "templatecontext", function() {

    /**
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = function extend(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function(source) {
            for (var property in source) {
                if (source[property] && source[property].constructor &&
                    source[property].constructor === Object) {
                    target[property] = target[property] || {};
                    target[property] = extend(target[property], source[property]);
                } else target[property] = source[property];
            }
        });
        return target;
    };

    /**
     * Shim console, make sure that if no console
     * available calls do not generate errors.
     * @return {Object} Console shim.
     */
    var _shimConsole = function() {
        var empty = {},
            con = {},
            noop = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
                'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
                'table,time,timeEnd,timeStamp,trace,warn').split(','),
            prop,
            method;

        while (method = methods.pop()) con[method] = noop;
        while (prop = properties.pop()) con[prop] = empty;

        return con;
    };


    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * TemplateContext constructor
     *
     * @param  {object} config Configuration object.
     */
    var TemplateContext = function(config) {
        config = config || {};

        config = _extend({}, this.constructor.DEFAULTS, config);

        this.init(config);
    };

    /**
     * Make default options available so we
     * can override.
     */
    TemplateContext.DEFAULTS = {

    };

    ///////////////////////////////////////////////////
    // PRIVATE METHODS
    ///////////////////////////////////////////////////
    /**
     * Initialization method
     * @param  {Object} config Conf object
     * @return {this}
     */
    TemplateContext.prototype.init = function(config) {
        if (this.initialized) return this.logger.warn('Already initialized');
        this.initialized = true;

        console.log('TemplateContext: Init!');

        this.data = {};
        this.source = {};
        this.states = {};
        this.formatters = {};
        this.transforms = {};

        _extend(this, config || {});

        return this;
    };

    /**
     * [set description]
     * @param {[type]} path  [description]
     * @param {[type]} value [description]
     */
    TemplateContext.prototype.set = function(path, value) {
        //TODO: Make keypath setter!
        this.data[path] = value;
        return this;
    };

    TemplateContext.prototype.get = function(path, def) {

    };

    /**
     * Update
     * @param  {[type]} data  [description]
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    TemplateContext.prototype.update = function(data, state) {

        var source = state === true ? {} : this.data;

        this.data = extend(source, this.defaults, this.formatters, data);

        if (typeof state === 'string') this.merge(state);
        this.emit('change');

        return this.data;
    };

    TemplateContext.prototype.merge = function(state, fresh) {
        if (!this.states.hasOwnProperty(state)) return false;
        var data = this.states[state];
        var source = fresh === true ? {} : this.data;
        this.data = extend(source, this.defaults, this.formatters, data);

        this.emit('change.' + state);

        return true;
    };

    TemplateContext.prototype.applyTransforms = function(transformId) {
        if (!this.transforms.hasOwnProperty(transformId)) return;
        var transform = this.transforms[transformId];
        this.data = transform.call(this, this.data);
    };

    /**
     * Logger method, meant to be implemented by
     * mixin. As a placeholder, we use console if available
     * or a shim if not present.
     */
    TemplateContext.prototype.logger = console || _shimConsole();

    /**
     * Stub method
     * @return {[type]} [description]
     */
    TemplateContext.prototype.emit = function() {};

    return TemplateContext;
}));