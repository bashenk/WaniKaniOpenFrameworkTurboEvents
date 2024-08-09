// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     3.0.5
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

    const version = '3.0.5', turboPrefix = 'turbo:', eventHandlers = {}, internalHandlers = {}, emptyArray = Object.freeze([]),
        handleDetailFetchResponseResponseUrl = async event => await handleTurboEvent(event, event.detail.fetchResponse.response.url),
        handleDetailFormSubmissionFetchRequestUrlHref = async event => await handleTurboEvent(event, event.detail.formSubmission.fetchRequest.url.href),
        handleDetailNewElementBaseURI = async event => await handleTurboEvent(event, event.detail.newElement.baseURI),
        handleDetailNewFrameBaseURI = async event => await handleTurboEvent(event, event.detail.newFrame.baseURI),
        handleDetailNewStreamUrl = async event => await handleTurboEvent(event, event.detail.newStream.url),
        handleDetailRequestUrlHref = async event => await handleTurboEvent(event, event.detail.request.url.href),
        handleDetailResponseUrl = async event => await handleTurboEvent(event, event.detail.response.url),
        handleDetailUrl = async event => await handleTurboEvent(event, event.detail.url),
        handleUpdateLoadedPage = event => lastUrlLoaded = event.detail.url,
        handleDetailUrlHref = async event => await handleTurboEvent(event, event.detail.url.href),
        handleTargetBaseURI = async event => await handleTurboEvent(event, event.target.baseURI),
        handleTargetHref = async event => await handleTurboEvent(event, event.target.href);
    // https://turbo.hotwired.dev/reference/events
    const turboEvents = deepFreeze({
        click:                  {source: 'document', name: `${turboPrefix}click`, handler: handleDetailUrl},
        before_visit:           {source: 'document', name: `${turboPrefix}before-visit`, handler: handleDetailUrl},
        visit:                  {source: 'document', name: `${turboPrefix}visit`, handler: handleDetailUrl},
        before_cache:           {source: 'document', name: `${turboPrefix}before-cache`, handler: handleTargetBaseURI},
        before_render:          {source: 'document', name: `${turboPrefix}before-render`, handler: handleTargetBaseURI},
        render:                 {source: 'document', name: `${turboPrefix}render`, handler: handleTargetBaseURI},
        load:                   {source: 'document', name: `${turboPrefix}load`, handler: handleDetailUrl},
        morph:                  {source: 'pageRefresh', name: `${turboPrefix}morph`, handler: handleDetailNewElementBaseURI},
        before_morph_element:   {source: 'pageRefresh', name: `${turboPrefix}before-morph-element`, handler: handleTargetBaseURI},
        before_morph_attribute: {source: 'pageRefresh', name: `${turboPrefix}before-morph-attribute`, handler: handleDetailNewElementBaseURI},
        morph_element:          {source: 'pageRefresh', name: `${turboPrefix}morph-element`, handler: handleDetailNewElementBaseURI},
        submit_start:           {source: 'forms', name: `${turboPrefix}submit-start`, handler: handleDetailFormSubmissionFetchRequestUrlHref},
        submit_end:             {source: 'forms', name: `${turboPrefix}submit-end`, handler: handleDetailFetchResponseResponseUrl},
        before_frame_render:    {source: 'frames', name: `${turboPrefix}before-frame-render`, handler: handleDetailNewFrameBaseURI},
        frame_render:           {source: 'frames', name: `${turboPrefix}frame-render`, handler: handleTargetBaseURI},
        frame_load:             {source: 'frames', name: `${turboPrefix}frame-load`, handler: handleTargetBaseURI},
        frame_missing:          {source: 'frames', name: `${turboPrefix}frame-missing`, handler: handleDetailResponseUrl},
        before_stream_render:   {source: 'streams', name: `${turboPrefix}before-stream-render`, handler: handleDetailNewStreamUrl},
        before_fetch_request:   {source: 'httpRequests', name: `${turboPrefix}before-fetch-request`, handler: handleDetailUrlHref},
        before_fetch_response:  {source: 'httpRequests', name: `${turboPrefix}before-fetch-response`, handler: handleDetailFetchResponseResponseUrl},
        before_prefetch:        {source: 'httpRequests', name: `${turboPrefix}before-prefetch`, handler: handleTargetHref},
        fetch_request_error:    {source: 'httpRequests', name: `${turboPrefix}fetch-request-error`, handler: handleDetailRequestUrlHref},
    }), turboListeners = Object.freeze({
        before_cache:           (callback, options) => addEventListener(turboEvents.before_cache.name, callback, options),
        before_fetch_request:   (callback, options) => addEventListener(turboEvents.before_fetch_request.name, callback, options),
        before_fetch_response:  (callback, options) => addEventListener(turboEvents.before_fetch_response.name, callback, options),
        before_frame_render:    (callback, options) => addEventListener(turboEvents.before_frame_render.name, callback, options),
        before_morph_attribute: (callback, options) => addEventListener(turboEvents.before_morph_attribute.name, callback, options),
        before_morph_element:   (callback, options) => addEventListener(turboEvents.before_morph_element.name, callback, options),
        before_prefetch:        (callback, options) => addEventListener(turboEvents.before_prefetch.name, callback, options),
        before_render:          (callback, options) => addEventListener(turboEvents.before_render.name, callback, options),
        before_stream_render:   (callback, options) => addEventListener(turboEvents.before_stream_render.name, callback, options),
        before_visit:           (callback, options) => addEventListener(turboEvents.before_visit.name, callback, options),
        click:                  (callback, options) => addEventListener(turboEvents.click.name, callback, options),
        fetch_request_error:    (callback, options) => addEventListener(turboEvents.fetch_request_error.name, callback, options),
        frame_load:             (callback, options) => addEventListener(turboEvents.frame_load.name, callback, options),
        frame_missing:          (callback, options) => addEventListener(turboEvents.frame_missing.name, callback, options),
        frame_render:           (callback, options) => addEventListener(turboEvents.frame_render.name, callback, options),
        load:                   (callback, options) => addEventListener(turboEvents.load.name, callback, options),
        morph:                  (callback, options) => addEventListener(turboEvents.morph.name, callback, options),
        morph_element:          (callback, options) => addEventListener(turboEvents.morph_element.name, callback, options),
        render:                 (callback, options) => addEventListener(turboEvents.render.name, callback, options),
        submit_end:             (callback, options) => addEventListener(turboEvents.submit_end.name, callback, options),
        submit_start:           (callback, options) => addEventListener(turboEvents.submit_start.name, callback, options),
        visit:                  (callback, options) => addEventListener(turboEvents.visit.name, callback, options),
    }), common = Object.defineProperties({},{
        locations: {value: Object.defineProperties({}, {
            dashboard: {value: /^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/},
            items_pages: {value: /^https:\/\/www\.wanikani\.com\/(radicals|kanji|vocabulary)\/.+\/?$/},
            lessons: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/(start|[\d-]+\/\d+)\/?$/},
            lessons_picker: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/picker\/?$/},
            lessons_quiz: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/[\d-]+\/quiz.*\/?$/},
            reviews: {value: /^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/},
        }),
    }}), commonListeners = Object.defineProperties({},{
        events:         {value: (eventList, callback, options) => addMultipleEventListeners(eventList, callback, options)},
        urls:           {value: (callback, urls, options) => addTypicalPageListener(callback, urls, options)},
        targetIds:      {value: (callback, targetIds, options) => addTypicalFrameListener(callback, targetIds, options)},
        dashboard:      {value: (callback, options) => addTypicalPageListener(callback, common.locations.dashboard, options)},
        items_pages:    {value: (callback, options) => addTypicalPageListener(callback, common.locations.items_pages, options)},
        lessons:        {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons, options)},
        lessons_picker: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons_picker, options)},
        lessons_quiz:   {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons_quiz, options)},
        reviews:        {value: (callback, options) => addTypicalPageListener(callback, common.locations.reviews, options)},
    }), eventMap = Object.defineProperties({}, {
        common: {value: commonListeners},
        event: {value: turboListeners},
    });
    const publishedInterface = Object.defineProperties({},{
        add_event_listener: {value: addEventListener},
        remove_event_listener: {value: removeEventListener},
        on: {value: eventMap},
        events: {value: turboEvents},
        common: {value: common},

        silenceWarnings: {value: false, writable: true},
        version: {value: version},
        '_.internal': {value: {internalHandlers, eventHandlers}},
    });
    let lastUrlLoaded = window.Turbo?.session.history.pageLoaded ? window.Turbo.session.location.href : '!';

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
            if (lastUrlLoaded === '!' || !verifyOptions(quasiLoadEvent, lastUrlLoaded, getListenerOptions(Object.assign({useDocumentIds: true}, options)))) return false;
            listener(quasiLoadEvent, lastUrlLoaded);
            return true;
        }
        if (window.Turbo?.session.history.pageLoaded && !wkof.silenceWarnings)
            console.warn(`The page has already loaded before adding the Turbo Event listener. The target event "${eventName}" may have already been dispatched.`);
        options = getListenerOptions(options);
        const eventKey = eventName.slice(turboPrefix.length).replaceAll('-', '_');
        if (!(eventKey in turboEvents)) return false;
        const {capture, passive, signal} = options;
        addInternalEventListener(eventName, turboEvents[eventKey].handler, {capture, passive, signal});
        if (!(eventName in eventHandlers)) eventHandlers[eventName] = [];
        eventHandlers[eventName].push({listener, options});
        return true;
    }

    function addInternalEventListener(eventName, handler, options) {
        if (typeof eventName !== 'string') return false;
        const key = options.capture ? 'capture' : 'bubble';
        if (!(eventName in internalHandlers)) internalHandlers[eventName] = {};
        else if (internalHandlers[eventName][key]) return false;
        options = {capture: options.capture, once: false, passive: false, signal: undefined}; // TODO: Determine if `once`|`signal` can be passed here without causing issues.
        internalHandlers[eventName][key] = {handler, options};
        document.documentElement.addEventListener(eventName, handler, options);
        return true;
    }

    /**
     * Adds multiple event listeners to the specified event list.
     *
     * @param {(string|object|Array<string|object>)} eventList - The event list to add listeners to. If it is an object, it is assumed to be the `turboEvents` object. If it is an array, each element is treated as a string containing the event name or an object containing the event name as the property `name`.
     * @param {TurboEventCallback} listener - The callback function to be invoked when the event is triggered.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {(object|object[])} An array of objects containing the added event names and whether the listener was successfully added.
     */
    function addMultipleEventListeners(eventList, listener, options) {
        if (eventList === turboEvents) eventList = Object.values(eventList);
        if (Array.isArray(eventList)) {
            return eventList.map(eventName => {
                const name = getValidEventName(eventName), added = addEventListener(name, listener, options);
                return {name, added};
            });
        } else {
            const name = getValidEventName(eventList), added = addEventListener(name, listener, options);
            return {name, added};
        }
    }

    /**
     * Adds a turbo:load listener that will be called on the provided URLs. This is a convenience function to simplify merging the options.
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
            return commonListeners.events(['load', turboEvents.load.name], callback, Object.assign(options ?? {}, {urls}));
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
        return turboListeners.frame_load(callback, Object.assign(options ?? {}, {targetIds}));
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
        if (typeof eventName !== 'string' || !(eventName in eventHandlers)) return false;
        const handlers = eventHandlers[eventName];
        options = getListenerOptions(options);
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

    /**
     * Freezes an object and all its nested properties.
     *
     * @template T
     * @param {T} o - The object to freeze.
     * @return {Readonly<T>} - The frozen object.
     */
    function deepFreeze(o) {
        if (o != null && (typeof o === 'object' || typeof o === 'function'))
            Object.values(o).filter(v => !Object.isFrozen(v)).forEach(deepFreeze);
        return Object.freeze(o);
    }

    function didConfirmWarning() {
        const message = `It looks like a script is using an incompatible version of the WaniKani Open Framework Turbo Events library.
Setup will continue anyway, but some unexpected behavior may occur.

Press "OK" to hide this message for 7 days.
Press "Cancel" to be reminded again next time.`;
        return confirm(message);
    }

    /**
     * Generates a promise that resolves either immediately—when the options dictate that the event does not match—or when the given event listener is called with the provided event and URL.
     *
     * @param {CustomEvent} event - The Turbo event object.
     * @param {string} url - The URL associated with the event.
     * @param {TurboEventCallback} listener - The callback to invoke when the event occurs.
     * @param {TurboAddEventListenerOptions} [options] - Additional options for the event listener.
     * @return {Promise<void|*>} A promise that resolves either immediately or when the event listener is executed.
     */
    function emitListener(event, url, listener, options) {
        if (!verifyOptions(event, url, options)) return Promise.resolve();
        if (options.once) removeEventListener(event.type, listener, options);
        return new Promise(resolve => {
            if (!options.noTimeout) setTimeout(()=> resolve(listener(event,url)), 0);
            else resolve(listener(event, url));
        });
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
     * Generates an iterator that yields promises for each event listener associated with the given event.
     *
     * @param {CustomEvent} event - The Turbo event object.
     * @param {string} url - The URL associated with the event.
     * @yields {Promise<void|*>} A promise that resolves either immediately or when the event listener is executed.
     */
    function * getEventListeners(event, url) {
        if (event === undefined || event === null || !(event.type in eventHandlers)) return;
        for (const {listener, options} of eventHandlers[event.type]) {
            yield emitListener(event, url, listener, options);
        }
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
     * @return {TurboAddEventListenerOptions} An `options` object for event listeners.
     */
    function getListenerOptions(input) {
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
     * Asynchronously handles an event by executing all registered event listeners for the given event and URL.
     *
     * @param {CustomEvent} event - The Turbo event object.
     * @param {string} url - The URL associated with the event.
     * @return {Promise<void>} A promise that resolves when all event listeners have been executed.
     */
    async function handleTurboEvent(event, url) {
        await Promise.all(getEventListeners(event, url));
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
        if (input === undefined || input === null) return emptyArray;
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
    function verifyOptions(event, url, options) {
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
        // Keep this one out of the internal event handler list because it does not propagate events to the handlers
        document.documentElement.addEventListener(turboEvents.load.name, handleUpdateLoadedPage, {capture: false, passive: true, once: false});

        if (listenersToActivate !== undefined) {
            for (const {name, options} in listenersToActivate) {
                const eventKey = name.slice(turboPrefix.length).replaceAll('-', '_');
                const {handler} = turboEvents[eventKey];
                addInternalEventListener(name, handler, options);
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
            Object.assign(eventHandlers, internal.eventHandlers);
            for (const [eventName, object] of Object.entries(internal.internalHandlers)) {
                if (!object) continue;
                if ('capture' in object || 'bubble' in object) {
                    for (const [, {handler, options}] of object) {
                        document.documentElement.removeEventListener(eventName, handler, options);
                        existingActiveListeners.set(eventName, options);
                    }
                } else if ('active' in object) {
                    const {handler, active} = object;
                    if (active) {
                        document.documentElement.removeEventListener(eventName, handler.listener ?? handler, handler.listenerOptions);
                        existingActiveListeners.set(eventName, handler.listenerOptions);
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
