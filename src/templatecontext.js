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
}(this, "templatecontext", ['keypath', 'extend'], function(keypath, extend) {

    /**
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = extend;

    /**
     * Shim console, make sure that if no console
     * available calls do not generate errors.
     * @return {Object} Console shim.
     */
    var _shimConsole = function(con) {

        if (con) return con;

        con = {};
        var empty = {},
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

    var _keypath = keypath;

    var _slice = [].slice;

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * TemplateContext constructor
     *
     * @param  {object} config Configuration object.
     */
    var TemplateContext = function(config) {
        // this.ID = Date.now();
        config = config || {};

        config = _extend({}, this.constructor.DEFAULTS, config);
        this.init(config);
    };

    /**
     * Make default options available so we
     * can override.
     */
    TemplateContext.DEFAULTS = {
        changeEventGlue: '.',
        changeEventType: 'change',
        updateEventType: 'update'
    };

    ///////////////////////////////////////////////////
    // PUBLIC METHODS
    // TODO: Integrate keypath
    // TODO: setter/getter binding
    ///////////////////////////////////////////////////
    /**
     * Initialization method
     * @param  {Object} config Conf object
     * @return {this}
     */
    TemplateContext.prototype.init = function(config) {
        if (this.initialized) return this.logger.warn('Already initialized');
        this.initialized = true;

        this.logger.log('TemplateContext: Init!');

        ['data', 'source', 'states', 'formatters', 'transforms'].forEach(function(key) {
            this[key] = {};
        }, this);

        // this.data = {};
        // this.source = {};
        // this.states = {};
        // this.formatters = {};
        // this.transforms = {};

        _extend(this, config || {});

        return this;
    };

    /**
     * Set `path` value. It will trigger
     * events in case there are registered
     * listeners.
     *
     * TODO: Move set/get/has to plugin?
     *
     * @param {String} path  Path to property.
     *                       It can be a `keypath`.
     * @param {Mixed} value  Any value we want to store
     *                       in `path`.
     */
    TemplateContext.prototype.set = function(path, value) {
        var old = this.get(path, undefined),
            evt = {
                old: old,
                value: value,
                property: path
            };

        _keypath(this.data, path, value);

        //Generic change event: change
        this.emit(this.eventType(this.changeEventType), evt);
        //Targeted change event: change.user.name
        this.emit(this.eventType(this.changeEventType, path), evt);

        return this;
    };

    TemplateContext.prototype.get = function(path, defaultValue) {
        return _keypath(this.data, path, defaultValue);
    };

    TemplateContext.prototype.has = function(path) {
        return this.get(path, '__-UNDEF-__') !== '__-UNDEF-__';
    };

    /**
     * Register formatter function. It will be available
     * to all views
     * @param  {String} id        Formatter identifier
     * @param  {Function} formatter
     * @return {this}
     */
    TemplateContext.prototype.registerFormatter = function(id, formatter) {
        if (typeof formatter !== 'function') return this;
        this.formatters[id] = formatter;
        return this;
    };


    TemplateContext.prototype.update = function(data, state) {

        var source = state === true ? {} : this.data;
        // console.log('UPDATE', source)
        this.data = _extend(source, this.defaults, this.formatters, data);
        // console.log('POSTUPDATE', this.data)
        if (typeof state === 'string') this.mergeState(state);

        this.emit(this.eventType(this.updateEventType));


        return this.data;
    };

    TemplateContext.prototype.mergeState = function(state, fresh) {
        if (!this.states.hasOwnProperty(state)) return false;

        var data = this.states[state];

        var source = fresh === true ? {} : this.data;

        this.data = _extend(source, this.defaults, this.formatters, data);

        this.emit(this.eventType(this.updateEventType, state));

        return true;
    };

    TemplateContext.prototype.applyTransforms = function(transformId) {
        if (!this.transforms.hasOwnProperty(transformId)) return;

        var transform = this.transforms[transformId];

        // this.data = transform.call(this, this.data);
        transform.call(this, this.data);

        return this;
    };

    /**
     * Logger method, meant to be implemented by
     * mixin. As a placeholder, we use console if available
     * or a shim if not present.
     */
    TemplateContext.prototype.logger = _shimConsole(console);

    /**
     * Stub method
     * @return {[type]} [description]
     */
    TemplateContext.prototype.emit = function() {};

    TemplateContext.prototype.eventType = function(type, path) {
        if (!path) return type;
        return [type, path].join(this.changeEventGlue);
    };



    TemplateContext.prototype.merge = function() {
        this.logger.warn('TemplateContext: Deprecated notice. Use mergeState instead.');
        var args = _slice.call(arguments);
        return this.mergeState.call(this, args);
    };

    return TemplateContext;
}));