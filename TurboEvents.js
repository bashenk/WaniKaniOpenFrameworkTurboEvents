// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     4.0.0
// @match       https://www.wanikani.com/*
// @match       https://preview.wanikani.com/*
// @author      Inserio
// @copyright   2024, Brian Shenk
// @license     MIT; http://opensource.org/licenses/MIT
// @run-at      document-start
// @grant       none
// @supportURL  https://community.wanikani.com/t/x/66725
// @homepageURL https://github.com/bashenk/WaniKaniOpenFrameworkTurboEvents
// ==/UserScript==
/* global wkof */
/* jshint esversion: 11 */
// noinspection JSUnusedGlobalSymbols

(function() {
    'use strict';

    const version = '4.0.0', internalHandlers = {};

    /** @class TurboEvent */
    class TurboEvent {
        static get prefix() { return 'turbo:'; }

        name;
        shortName;
        source;
        handler;
        #listeners = [];

        constructor(source, shortName, handler) {
            this.name = `${TurboEvent.prefix}${shortName}`;
            this.shortName = shortName;
            this.source = source;
            this.handler = handler;
            Object.freeze(this);
        }

        toString() { return this.name; }

        /**
         * Sets up a function that will be called whenever the specified event is delivered to the target.
         * @param {TurboEventCallback} listener - The object that receives a notification (an object that implements the Event interface and a string with the relevant url) when an event of the specified type occurs. This must be a `function`.
         * @param {TurboAddEventListenerOptions} [options] - Options for the event listener.
         * @return {boolean} True if the listener was successfully added, false otherwise.
         */
        addListener(listener, options) {
            if (listener === undefined || listener === null || typeof listener !== 'function') return false;
            if (window.Turbo?.session.history.pageLoaded && !wkof.turbo.silenceWarnings)
                console.warn(`The page has already loaded before adding the Turbo Event listener. The target event "${this.name}" may have already been dispatched.`);
            options = getTurboListenerOptions(options);
            return this.#addInternalListener(listener, options);
        }

        /**
         * Removes an event listener for the specified event name.
         *
         * @param {TurboEventCallback} listener - The callback function to remove.
         * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
         * @return {boolean} Returns `true` if the listener was successfully removed, `false` otherwise.
         */
        removeEventListener(listener, options) {
            if (listener == null) return false;
            options = getTurboListenerOptions(options);
            return this.#removeInternalListener(listener, options);
        }

        #addInternalListener(listener, options) {
            const wrapper = this.#createListenerWrapper(listener, options);
            const eventListenerOptions = getEventListenerOptions(options);
            document.documentElement.addEventListener(this.name, wrapper, eventListenerOptions);
            this.#listeners.push({wrapper, listener, options});
            if (!(this.name in internalHandlers)) internalHandlers[this.name] = this.#listeners;
            return true;
        }

        #createListenerWrapper(listener, options) {
            return (event) => {
                const url = this.handler(event);
                if (options.once) {
                    if (!verifyTurboOptions(event, url, options)) {
                        this.#addInternalListener(listener, options);
                        return Promise.resolve();
                    }
                    this.#removeInternalListener(listener, options);
                }
                return new Promise(resolve => {
                    if (!options.noTimeout) setTimeout(() => resolve(listener(event, url)), 0);
                    else resolve(listener(event, url));
                });
            };
        }

        #removeInternalListener(listener, options) {
            const index = this.#listeners.findIndex(({listener: existingListener, options: existingOptions}) => listener === existingListener && deepEqual(options, existingOptions));
            if (index === -1) return false;
            document.documentElement.removeEventListener(this.name, this.#listeners[index].wrapper, getEventListenerOptions(options));
            this.#listeners.splice(index, 1);
            if (this.#listeners.length === 0) delete internalHandlers[this.name];
            return true;
        }
    }
    const handleDetailFetchResponseResponseUrl = event => event.detail.fetchResponse.response.url,
        handleDetailFormSubmissionFetchRequestUrlHref = event => event.detail.formSubmission.fetchRequest.url.href, handleDetailNewElementBaseURI = event => event.detail.newElement.baseURI,
        handleDetailNewFrameBaseURI = event => event.detail.newFrame.baseURI, handleDetailNewStreamUrl = event => event.detail.newStream.url,
        handleDetailRequestUrlHref = event => event.detail.request.url.href, handleDetailResponseUrl = event => event.detail.response.url, handleDetailUrl = event => event.detail.url,
        handleDetailUrlHref = event => event.detail.url.href, handleTargetBaseURI = event => event.target.baseURI, handleTargetHref = event => event.target.href;
    /**
     * Container for all the Turbo events.
     * @see https://turbo.hotwired.dev/reference/events
     */
    const turboEvents = Object.freeze({
        click:                  new TurboEvent('document','click', handleDetailUrl),
        before_visit:           new TurboEvent('document','before-visit', handleDetailUrl),
        visit:                  new TurboEvent('document','visit', handleDetailUrl),
        before_cache:           new TurboEvent('document','before-cache', handleTargetBaseURI),
        before_render:          new TurboEvent('document','before-render', handleTargetBaseURI),
        render:                 new TurboEvent('document','render', handleTargetBaseURI),
        load:                   new TurboEvent('document','load', handleDetailUrl),
        morph:                  new TurboEvent('pageRefresh','morph', handleDetailNewElementBaseURI),
        before_morph_element:   new TurboEvent('pageRefresh','before-morph-element', handleTargetBaseURI),
        before_morph_attribute: new TurboEvent('pageRefresh','before-morph-attribute', handleDetailNewElementBaseURI),
        morph_element:          new TurboEvent('pageRefresh','morph-element', handleDetailNewElementBaseURI),
        submit_start:           new TurboEvent('forms','submit-start', handleDetailFormSubmissionFetchRequestUrlHref),
        submit_end:             new TurboEvent('forms','submit-end', handleDetailFetchResponseResponseUrl),
        before_frame_render:    new TurboEvent('frames','before-frame-render', handleDetailNewFrameBaseURI),
        frame_render:           new TurboEvent('frames','frame-render', handleTargetBaseURI),
        frame_load:             new TurboEvent('frames','frame-load', handleTargetBaseURI),
        frame_missing:          new TurboEvent('frames','frame-missing', handleDetailResponseUrl),
        before_stream_render:   new TurboEvent('streams','before-stream-render', handleDetailNewStreamUrl),
        before_fetch_request:   new TurboEvent('httpRequests','before-fetch-request', handleDetailUrlHref),
        before_fetch_response:  new TurboEvent('httpRequests','before-fetch-response', handleDetailFetchResponseResponseUrl),
        before_prefetch:        new TurboEvent('httpRequests','before-prefetch', handleTargetHref),
        fetch_request_error:    new TurboEvent('httpRequests','fetch-request-error', handleDetailRequestUrlHref),
    });
    /** Convenience container for all the Turbo events. */
    const turboListeners = {
        /** @deprecated Use [wkof.turbo.events.before_cache.addListener]{@link TurboEvent#addListener} instead.*/ before_cache: (callback, options) => turboEvents.before_cache.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_fetch_request.addListener]{@link TurboEvent#addListener} instead.*/ before_fetch_request: (callback, options) => turboEvents.before_fetch_request.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_fetch_response.addListener]{@link TurboEvent#addListener} instead.*/ before_fetch_response: (callback, options) => turboEvents.before_fetch_response.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_frame_render.addListener]{@link TurboEvent#addListener} instead.*/ before_frame_render: (callback, options) => turboEvents.before_frame_render.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_morph_attribute.addListener]{@link TurboEvent#addListener} instead.*/ before_morph_attribute: (callback, options) => turboEvents.before_morph_attribute.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_morph_element.addListener]{@link TurboEvent#addListener} instead.*/ before_morph_element: (callback, options) => turboEvents.before_morph_element.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_prefetch.addListener]{@link TurboEvent#addListener} instead.*/ before_prefetch: (callback, options) => turboEvents.before_prefetch.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_render.addListener]{@link TurboEvent#addListener} instead.*/ before_render: (callback, options) => turboEvents.before_render.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_stream_render.addListener]{@link TurboEvent#addListener} instead.*/ before_stream_render: (callback, options) => turboEvents.before_stream_render.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.before_visit.addListener]{@link TurboEvent#addListener} instead.*/ before_visit: (callback, options) => turboEvents.before_visit.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.click.addListener]{@link TurboEvent#addListener} instead.*/ click: (callback, options) => turboEvents.click.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.fetch_request_error.addListener]{@link TurboEvent#addListener} instead.*/ fetch_request_error: (callback, options) => turboEvents.fetch_request_error.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.frame_load.addListener]{@link TurboEvent#addListener} instead.*/ frame_load: (callback, options) => turboEvents.frame_load.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.frame_missing.addListener]{@link TurboEvent#addListener} instead.*/ frame_missing: (callback, options) => turboEvents.frame_missing.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.frame_render.addListener]{@link TurboEvent#addListener} instead.*/ frame_render: (callback, options) => turboEvents.frame_render.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.load.addListener]{@link TurboEvent#addListener} instead.*/ load: (callback, options) => turboEvents.load.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.morph.addListener]{@link TurboEvent#addListener} instead.*/ morph: (callback, options) => turboEvents.morph.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.morph_element.addListener]{@link TurboEvent#addListener} instead.*/ morph_element: (callback, options) => turboEvents.morph_element.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.render.addListener]{@link TurboEvent#addListener} instead.*/ render: (callback, options) => turboEvents.render.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.submit_end.addListener]{@link TurboEvent#addListener} instead.*/ submit_end: (callback, options) => turboEvents.submit_end.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.submit_start.addListener]{@link TurboEvent#addListener} instead.*/ submit_start: (callback, options) => turboEvents.submit_start.addListener(callback, options),
        /** @deprecated Use [wkof.turbo.events.visit.addListener]{@link TurboEvent#addListener} instead.*/ visit: (callback, options) => turboEvents.visit.addListener(callback, options),
    }; Object.freeze(turboListeners);
    /** Container for various commonly used objects. */
    const common = {}; Object.defineProperties(common,{
        /** Collection of location patterns for commonly used pages. */
        locations: {value: Object.defineProperties({}, {
            dashboard: {value: /^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/},
            items_pages: {value: /^https:\/\/www\.wanikani\.com\/(radicals|kanji|vocabulary)\/.+\/?$/},
            lessons: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/(start|[\d-]+\/\d+)\/?$/},
            lessons_picker: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/picker\/?$/},
            lessons_quiz: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/[\d-]+\/quiz.*\/?$/},
            reviews: {value: /^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/},
        }),
    }});
    const commonListeners = {}; Object.defineProperties(commonListeners, {
        /** @see addMultipleEventListeners */ eventList: {value: (eventList, callback, options) => addMultipleEventListeners(eventList, callback, options)},
        /** @deprecated Use {@link eventList} instead.*/ events: {value: (eventList, callback, options) => commonListeners.eventList(eventList, callback, options)},
        /** @see addTypicalFrameListener */ targetIds: {value: (callback, targetIds, options) => addTypicalFrameListener(callback, targetIds, options)},
        /** @see addTypicalPageListener */ urls: {value: (callback, urls, options) => addTypicalPageListener(callback, urls, options)},
        /** @see addTypicalPageListener */ dashboard: {value: (callback, options) => addTypicalPageListener(callback, common.locations.dashboard, options)},
        /** @see addTypicalPageListener */ items_pages: {value: (callback, options) => addTypicalPageListener(callback, common.locations.items_pages, options)},
        /** @see addTypicalPageListener */ lessons: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons, options)},
        /** @see addTypicalPageListener */ lessons_picker: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons_picker, options)},
        /** @see addTypicalPageListener */ lessons_quiz: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons_quiz, options)},
        /** @see addTypicalPageListener */ reviews: {value: (callback, options) => addTypicalPageListener(callback, common.locations.reviews, options)},
    });
    /** Container for various event listeners. */
    const eventMap = {}; Object.defineProperties(eventMap, {
        common: {value: commonListeners},
        event: {value: turboListeners},
    });
    const publishedInterface = {}; Object.defineProperties(publishedInterface, {
        add_event_listener: {value: addEventListener},
        remove_event_listener: {value: removeEventListener},
        on: {value: eventMap},
        events: {value: turboEvents},
        common: {value: common},

        silenceWarnings: {value: false, writable: true},
        version: {value: version},
        '_.internal': {value: {internalHandlers}},
    });

    let lastUrlLoaded = window.Turbo?.session.history.pageIsLoaded() ? window.Turbo.session.history.location.href : '!';

    /* === JSDoc Definitions === */

    /**
     * The callback that handles the response
     * @callback TurboEventCallback
     * @extends EventListener
     * @param {CustomEvent} event - The Turbo event object.
     * @param {string} url - The URL associated with the event.
     */

    /**
     * @typedef TurboAddEventListenerOptions
     * @extends AddEventListenerOptions
     * @prop {boolean} [noTimeout] - Indicates whether to skip use of setTimeout(callback,0), typically used to let the event settle before invoking the callback. If not specified, defaults to `false`.
     * @prop {(string|RegExp|Array<string|RegExp>)} [urls] - The URLs to be verified against the URL parameter. If not specified, the listener runs on any URL.
     * @prop {(string|string[]|Set<string>)} [targetIds] - The target IDs to be verified against the event target ID. If not specified, no targetIds are associated with the listener.
     * @prop {boolean} [useDocumentIds] - Indicates whether to check the IDs of the document element in addition to the event target for the `targetIds`. If not specified, defaults to `false`.
     * @prop {boolean} [nocache] - Indicates whether to ignore events involving Turbo's cached pages. See {@link https://discuss.hotwired.dev/t/before-cache-render-event/4928/4}. If not specified, defaults to `false`.
     * @prop {boolean} [once] - Indicates that the listener should be invoked at most once after being added. If `true`, the listener would be automatically removed when invoked. If not specified, defaults to `false`.
     * @prop {boolean} [capture] - Indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree. If not specified, defaults to `false`.
     * @prop {boolean} [passive] - If `true`, indicates that the function specified by listener will never call `preventDefault()`. If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning.  If not specified, defaults to `false` – except that in browsers other than Safari, it defaults to `true` for wheel, mousewheel, touchstart and touchmove events.
     * @prop {AbortSignal} [signal] - @todo The listener will be removed when the given `AbortSignal` object's `abort()` method is called. If not specified, no `AbortSignal` is associated with the listener.
     */

    /* === Listeners === */

    /**
     * Sets up a function that will be called whenever the specified event is delivered to the target.
     *
     * @param {string} eventName - The name of the event to listen for.
     * @param {TurboEventCallback} listener - The object that receives a notification (an object that implements the Event interface and a string with the relevant url) when an event of the specified type occurs. This must be a `function`.
     * @param {TurboAddEventListenerOptions} [options] - Options for the event listener.
     * @return {boolean} True if the listener was successfully added, false otherwise.
     */
    function addEventListener(eventName, listener, options) {
        if (listener === undefined || listener === null || typeof listener !== 'function') return false;
        eventName = getValidEventName(eventName);
        if (eventName === undefined) return false;

        if (eventName === 'load') {
            const quasiLoadEvent = new CustomEvent('load', {bubbles: false, cancelable: false, composed: false, target: document.documentElement});
            if (lastUrlLoaded === '!' || !verifyTurboOptions(quasiLoadEvent, lastUrlLoaded, getTurboListenerOptions(Object.assign({useDocumentIds: true}, options)))) return false;
            listener(quasiLoadEvent, lastUrlLoaded);
            return true;
        }
        const eventKey = eventName.slice(TurboEvent.prefix.length).replaceAll('-', '_');
        if (!(eventKey in turboEvents)) return false;
        return turboEvents[eventKey].addListener(listener, options);
    }

    /**
     * Adds multiple event listeners to the specified event list.
     *
     * @param {(string|object|Array<string|object>|Set<string|object>)} eventList - The event list to add listeners to. If it is an object, it is assumed to be the `turboEvents` object. If it is an array, each element is treated as a string containing the event name or an object containing the event name as the property `name`.
     * @param {TurboEventCallback} listener - The callback function to be invoked when the event is triggered.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {(object|object[])} An array of objects `{name: string, added: boolean}` containing the added event names and whether the listener was successfully added.
     */
    function addMultipleEventListeners(eventList, listener, options) {
        if (eventList === turboEvents) eventList = Object.values(eventList);
        if (eventList instanceof Set) return Array.from(eventList.values().map(eventName => {
            const name = getValidEventName(eventName), added = addEventListener(name, listener, options);
            return {name, added};
        }));
        if (Array.isArray(eventList)) return eventList.map(eventName => {
            const name = getValidEventName(eventName), added = addEventListener(name, listener, options);
            return {name, added};
        });
        const name = getValidEventName(eventList), added = addEventListener(name, listener, options);
        return {name, added};
    }

    /**
     * Adds a turbo:load listener that will be called on the provided URLs and a "load" listener to guarantee the callback triggers even when the events have already fired.
     * This is a convenience function to simplify merging the options.
     *
     * @param {TurboEventCallback} callback - The callback function to be invoked when the event is triggered.
     * @param {(string|RegExp|Array<string|RegExp>)} urls - The URLs to be verified against the URL parameter.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {boolean} True if the listener was successfully added, false otherwise.
     */
    function addTypicalPageListener(callback, urls, options) {
        const warningSetting = wkof.turbo.silenceWarnings;
        try {
            wkof.turbo.silenceWarnings = true;
            return commonListeners.eventList(['load', turboEvents.load.name], callback, Object.assign(options ?? {}, {urls}))[1].added;
        } finally {
            wkof.turbo.silenceWarnings = warningSetting;
        }
    }

    /**
     * Adds a turbo:frame-load listener that will be called for the provided target IDs. This is a convenience function to simplify merging the options.
     *
     * @param {TurboEventCallback} callback - The callback function to be invoked when the frame event is triggered.
     * @param {(string|string[]|Set<string>)} [targetIds] - The target IDs to be verified against the event target ID.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {boolean} True if the listener was successfully added, false otherwise.
     */
    function addTypicalFrameListener(callback, targetIds, options) {
        return turboEvents.frame_load.addListener(callback, Object.assign(options ?? {}, {targetIds}));
    }

    /**
     * Removes an event listener for the specified event name.
     *
     * @param {string|object} eventName - The name of the event or an object with a `name` property.
     * @param {TurboEventCallback} listener - The callback function to remove.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {boolean} Returns `true` if the listener was successfully removed, `false` otherwise.
     */
    function removeEventListener(eventName, listener, options) {
        if (listener == null) return false;
        if (typeof eventName === 'object' && 'name' in eventName) eventName = eventName.name;
        if (typeof eventName !== 'string' || !(eventName in internalHandlers)) return false;
        const handlers = internalHandlers[eventName];
        options = getTurboListenerOptions(options);
        const handler = handlers.find(({listener: existingListener, options: existingOptions}) => listener === existingListener && deepEqual(options, existingOptions));
        if (!handler) return false;
        handlers.splice(handlers.indexOf(handler), 1);
        if (handlers.length === 0) removeInternalEventListener(eventName, options);
        return true;
    }

    function removeInternalEventListener(eventName, options) {
        if (typeof eventName !== 'string') return false;
        if (!(eventName in internalHandlers)) return false;
        const key = options.capture ? 'capture' : 'bubble';
        if (!(key in internalHandlers[eventName])) return false;
        const {handler, options: existingOptions} = internalHandlers[eventName][key];
        document.documentElement.removeEventListener(eventName, handler, existingOptions);
        delete internalHandlers[eventName][key];
        return true;
    }

    /**
     * Recursively checks if two objects are equivalent based on their properties and values.
     *
     * @param {*} x - The first object to compare.
     * @param {*} y - The second object to compare.
     * @return {boolean} Returns true if the objects are deeply equal, false otherwise.
     */
    function deepEqual(x, y) {
        const ok = Object.keys, tx = typeof x, ty = typeof y;
        return x && y && tx === 'object' && tx === ty ? (
            ok(x).length === ok(y).length &&
            ok(x).every(key => deepEqual(x[key], y[key]))
        ) : (x === y);
    }
    function didConfirmWarning() {
        const message = `It looks like a script is using an incompatible version of the WaniKani Open Framework Turbo Events library.
Setup will continue anyway, but some unexpected behavior may occur.

Press "OK" to hide this message for 7 days.
Press "Cancel" to be reminded again next time.`;
        return confirm(message);
    }

    /**
     * Retrieves the value of a cookie with the given name.
     *
     * @param {string} cname - The name of the cookie.
     * @return {string|undefined} The value of the cookie, or undefined if the cookie does not exist.
     */
    function getCookie(cname) {
        // structure is 'key=value', thus add 2 to the string length
        return decodeURIComponent(window.document.cookie).split(';').find(s => s.trimStart().startsWith(cname))?.substring(cname.trimStart().length + 2);
    }

    /**
     * Extracts the event listener options from the input object.
     *
     * @param {TurboAddEventListenerOptions} [options] - Input object containing some or all of the following properties:
     * @return {AddEventListenerOptions} An `options` object for `addEventListener()` or `removeEventListener()`.
     */
    function getEventListenerOptions(options) {
        const {passive, capture, once, signal} = options;
        return {capture, once, passive, signal};
    }

    /**
     * Merges the input object with the default options for event listeners and returns the result.
     *
     * @param {object} [input] - Input object containing some or all of the following properties:
     * @param {boolean} [input.capture=false] - Indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.
     * @param {boolean} [input.useDocumentIds=false] - Indicates whether to check the document IDs before adding the event listener.
     * @param {boolean} [input.noTimeout=false] - Indicates whether to disable the built-in feature that slightly delays the callback execution until the event has finished firing.
     * @param {boolean} [input.nocache=false] - Indicates whether to ignore events for Turbo's cached version of pages.
     * @param {boolean} [input.once=false] - Indicates that the listener should be invoked at most once after being added.
     * @param {boolean} [input.passive=false] - If `true`, indicates that the function specified by listener will never call `preventDefault()`.
     * @param {AbortSignal} [input.signal] - The listener will be removed when the given `AbortSignal` object's `abort()` method is called. If not specified, defaults to `undefined`
     * @param {(string|string[]|Set<string>)} [input.targetIds] - The target IDs to be verified against the event target ID. If not specified, defaults to `undefined`
     * @param {(string|RegExp|Array<string|RegExp>)} [input.urls] - The URLs to be verified against the URL parameter. If not specified, defaults to `undefined`
     * @return {TurboAddEventListenerOptions} An `options` object for Turbo event listeners.
     */
    function getTurboListenerOptions(input) {
        return {
            capture: typeof input?.capture === 'boolean' ? input.capture : false,
            useDocumentIds: typeof input?.useDocumentIds === 'boolean' ? input.useDocumentIds : false,
            noTimeout: typeof input?.noTimeout === 'boolean' ? input.noTimeout : false,
            nocache: typeof input?.nocache === 'boolean' ? input.nocache : false,
            once: typeof input?.once === 'boolean' ? input.once : false,
            passive: typeof input?.passive === 'boolean' ? input.passive : false,
            signal: input?.signal instanceof AbortSignal ? input.signal : undefined,
            targetIds: input?.targetIds != null ? normalizeToStringSet(input.targetIds) : undefined,
            urls: input?.urls != null ? normalizeToRegExpArray(input.urls) : undefined,
        };
    }

    /**
     * Retrieves a valid event name from the given input.
     *
     * @param {(string|object|object[])} eventName - The input event name to be validated.
     * @return {string|undefined} The valid event name if the input is valid, otherwise null.
     */
    function getValidEventName(eventName) {
        if (typeof eventName === 'string') return eventName;
        if (Array.isArray(eventName) && 'name' in eventName[1]) eventName = eventName[1].name; // e.g., `Object.entries(wkof.turbo.events)[0]`
        if (typeof eventName === 'object' && 'name' in eventName) eventName = eventName.name; // e.g., `Object.values(wkof.turbo.events)[0]` or `wkof.turbo.events.click`
        if (typeof eventName !== 'string') return undefined;
        return eventName;
    }

    /**
     * Normalizes the input `strings` into a Set of strings.
     *
     * @param {(*|*[]|Set<*>)} strings - The input strings to be normalized.
     * @return {Set<string>} A Set of strings containing the string values from the input.
     */
    function normalizeToStringSet(strings) {
        if (strings instanceof Set && strings.every(str => typeof str === 'string')) return strings;
        const output = new Set();
        if (strings === undefined || strings === null) return output;
        if (!(strings instanceof Set) && !Array.isArray(strings)) strings = [strings];
        for (const str of strings) {
            if (typeof str === 'string')
                output.add(str);
        }
        return output;
    }

    /**
     * Normalizes the input object `input` into an array of RegExp objects.
     *
     * @param {(*|*[])} input - The input to be normalized.
     * @return {RegExp[]} An array of RegExp objects containing input values coerced into RegExp objects.
     */
    function normalizeToRegExpArray(input) {
        if (input === undefined || input === null) return [];
        if (Array.isArray(input) && input.every(val => val instanceof RegExp)) return input;
        const output = [];
        if (!Array.isArray(input)) input = [input];
        for (const url of input) {
            if (url instanceof RegExp) output.push(url);
            else if (typeof url === 'string') output.push(new RegExp(url.replaceAll(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')));
        }
        return output;
    }

    function setCookie(cname, value, expiry) {
        const {days, hours, minutes, seconds} = Object.assign({days:0, hours:0, minutes:0, seconds:0},expiry);
        const expires = (new Date(Date.now()+(days*24*60*60*1000)+(hours*60*60*1000)+(minutes*60*1000)+(seconds*1000))).toUTCString();
        window.document.cookie = `${cname}=${value};expires=${expires};path=/;SameSite=None;Secure;`;
    }

    /**
     * Verifies the options passed to the function based on the event, url, and options parameters.
     *
     * @param {CustomEvent} event - The Turbo event object.
     * @param {string} url - The URL to use for verification.
     * @param {TurboAddEventListenerOptions} options - The options to use for verification.
     * @return {boolean} Returns true if the options are valid, false otherwise.
     */
    function verifyTurboOptions(event, url, options) {
        if (options === undefined || options === null) return true;
        // Ignore cached pages. See https://discuss.hotwired.dev/t/before-cache-render-event/4928/4
        const {urls, nocache, targetIds: ids} = options;
        if (nocache && event?.target?.hasAttribute('data-turbo-preview')) return false;
        if (urls?.length > 0 && !urls.some(reg => reg.test(url) && !(reg.lastIndex = 0))) return false;
        return ids == null || ids.size === 0 || ((event?.target?.id != null && ids.has(event.target.id)) || (options.useDocumentIds && ids.values().some(id => document.getElementById(id))));
    }

    function isNewerThan(otherVersion) {
        if (otherVersion == null) return true;
        const v1 = version.toString().split(`.`).map(v => parseInt(v)), v2 = otherVersion.toString().split(`.`).map(v => parseInt(v));
        return v1.reduce((r, v, i) => r ?? (v === v2[i] ? null : (v > (v2[i] || 0))), null) || false;
    }

    /* === Initialization === */

    /**
     * Adds Turbo Events to the wkof object, updating the version and adding any existing internal event listeners from an older version.
     *
     * @return {Promise<void>} A promise that resolves when the operation is complete.
     */
    function addTurboEvents() {
        const listenersToActivate = removeExistingTurboVersion();
        if (listenersToActivate === null) return Promise.resolve();
        wkof.turbo = publishedInterface;
        Object.defineProperty(wkof, "turbo", {writable: false});
        turboEvents.load.addListener(event => lastUrlLoaded = event.detail.url, {capture: true, passive: true, once: false});

        if (listenersToActivate !== undefined) {
            for (const {name, listener, options} in listenersToActivate) {
                const eventKey = name.slice(TurboEvent.prefix.length).replaceAll('-', '_');
                const event = turboEvents[eventKey];
                event.addListener(listener, options);
            }
        }
        return Promise.resolve();
    }

    /**
     * Removes any existing Turbo version and returns the existing active listeners.
     *
     * @return {Map<string, object>|null|undefined} A map of the event names for any existing active listeners and their listener options, or null if the current version is not newer than the existing version, or undefined if there is no existing version.
     */
    function removeExistingTurboVersion() {
        const unsafeGlobal = window.unsafeWindow || window;
        const existingTurbo = unsafeGlobal.wkof.turbo;
        if (!existingTurbo) return undefined;
        else if (!isNewerThan(existingTurbo.version)) return null;
        const internal = existingTurbo['_.internal'];
        const existingActiveListeners = new Map();
        if (internal == null) {
            const cookieKey = 'turbo_library_warning_seen';
            if (!getCookie(cookieKey) && didConfirmWarning())
                setCookie(cookieKey, 'Y', {days: 7});
        } else {
            setModuleReadyState(false);
            for (const [eventName, object] of Object.entries(internal.internalHandlers)) {
                if (!object) continue;
                if ('capture' in object || 'bubble' in object) {
                    for (const [, {handler, options}] of object) {
                        document.documentElement.removeEventListener(eventName, handler, options);
                        existingActiveListeners.set(eventName, {listener: handler, options});
                    }
                } else if ('active' in object) {
                    const {handler, active} = object;
                    if (active) {
                        document.documentElement.removeEventListener(eventName, handler.listener ?? handler, handler.listenerOptions);
                        existingActiveListeners.set(eventName, {listener: handler.listener, options: handler.listenerOptions});
                    }
                }
            }
        }
        delete unsafeGlobal.wkof.turbo;
        return existingActiveListeners;
    }

    /**
     * Sets the ready state of the TurboEvents module in the WaniKani Open Framework.
     *
     * @param {boolean} ready=true - Indicates if the module is ready.
     */
    function setModuleReadyState(ready=true) {
        wkof.set_state('wkof.TurboEvents', `${ready ? '' : 'not_'}ready`);
    }

    function startup() {
        if (!window.wkof) {
            const response = confirm('WaniKani Open Framework Turbo Events requires WaniKani Open Framework.\nClick "OK" to be forwarded to installation instructions.');
            if (response) window.location.href = 'https://community.wanikani.com/t/x/28549';
            return;
        }
        wkof.ready('wkof')
            .then(addTurboEvents)
            .then(setModuleReadyState);
    }

    startup();

})();
