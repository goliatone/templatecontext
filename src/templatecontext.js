/*
 * templatecontext
 * https://github.com/goliatone/templatecontext
 * Created with gbase.
 * Copyright (c) 2014 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
define("templatecontext", ['keypath', 'extend'], function(keypath, extend) {

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

        if (config.autoinitialize) this.init(config);
    };

    TemplateContext.VERSION = '0.1.2';

    /**
     * Make default options available so we
     * can override.
     */
    var DEFAULTS = TemplateContext.DEFAULTS = {
        state: '',
        autoinitialize: true,
        changeEventGlue: '.',
        changeEventType: 'change',
        updateEventType: 'update',
        initProperties: ['data', 'defaults', 'source', 'states', 'formatters', 'transforms']
    };

    TemplateContext.extend = _extend;
    TemplateContext.keypath = _keypath;
    TemplateContext.shimConsole = _shimConsole;

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

        DEFAULTS.initProperties.forEach(function(key) {
            this[key] = {};
        }, this);

        _extend(this, config || {});

        this.update(this.data, this.state);

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

        _keypath.set(this.data, path, value);

        //Generic change event: change
        this.emit(this.eventType(this.changeEventType), evt);
        //Targeted change event: change.user.name
        this.emit(this.eventType(this.changeEventType, path), evt);

        return this;
    };

    /**
     * Get the value for a given `path`. Path can
     * be a keypath to a property.
     * @param  {String} path         Keypath to prop.
     * @param  {Mixed} defaultValue Value to be returned if
     *                              path is undefined.
     * @return {Mixed}
     */
    TemplateContext.prototype.get = function(path, defaultValue) {
        return _keypath.get(this.data, path, defaultValue);
    };

    /**
     * Does the context's `data` object contain a
     * property found under `path`?
     * @param  {String}  path Keypath to prop.
     * @return {Boolean}
     */
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

    /**
     * Update the context data object by merging in
     * the provided `data` object.
     * @param  {Object} data  Object to be merged in
     * @param  {String|Boolean} state StateID or boolean
     *                                indicating if a new
     *                                object should be applied for data.
     * @return {Object}
     */
    TemplateContext.prototype.update = function(data, state) {

        //TODO: Should this be ? {} : this.clone();
        var source = state === true ? {} : this.data;

        this.data = _extend(source, this.defaults, this.formatters, data);

        if (typeof state === 'string') this.mergeState(state);

        this.emit(this.eventType(this.updateEventType));

        return this.data;
    };

    /**
     * Apply a stored state to the context.
     * @param  {String} state State ID
     * @param  {Boolean} fresh
     * @return {Boolean}      Was state merged?
     */
    TemplateContext.prototype.mergeState = function(state, fresh) {
        if (!this.states.hasOwnProperty(state)) return false;

        var data = this.states[state];

        var source = fresh === true ? {} : this.data;

        this.data = _extend(source, this.defaults, this.formatters, data);

        this.emit(this.eventType(this.updateEventType, state));

        return true;
    };

    /**
     * Applies a selected transform by ID.
     * Transforms are used to modify the context's `data`.
     * The transform will be executed in the context's
     * `scope` and it will be provided one argument:
     * the context `data` object.
     *
     * @param  {String} transformId ID of stored transform.
     * @return {this}
     */
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

    /**
     * Helper method to construct event types.
     * @param  {String} type Event type
     * @param  {String} path Path to property updated
     * @return {String}
     * @private
     */
    TemplateContext.prototype.eventType = function(type, path) {
        if (!path) return type;
        return [type, path].join(this.changeEventGlue);
    };

    /**
     * @see `mergeState`
     * @deprecated
     */
    TemplateContext.prototype.merge = function() {
        this.logger.warn('TemplateContext: Deprecated notice. Use mergeState instead.');
        var args = _slice.call(arguments);
        return this.mergeState.call(this, args);
    };

    return TemplateContext;
});