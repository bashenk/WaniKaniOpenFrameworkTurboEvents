// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     4.1.0
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

/**
 * The built-in object that specifies characteristics about the event listener.
 * @external AddEventListenerOptions
 * @see https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options
 */

(function() {
    'use strict';

    const version = '4.1.0', internalHandlers = {};

    /* === JSDoc Definitions === */

    /**
     * The callback that handles the response
     * @callback TurboEventCallback
     * @augments EventListener
     * @param {CustomEvent} event - The Turbo event object.
     * @param {string} url - The URL associated with the event.
     */

    /**
     * Cannot use @interface because then simple subtyping does not work, and @record is apparently not supported, though that would probably solve it.
     * @typedef {{capture?: boolean, once?: boolean, passive?: boolean, signal?: AbortSignal, nocache?: boolean, noTimeout?: boolean, targetIds?: (string|string[]|Set<string>|Object.<string,boolean>), urls?: (string|RegExp|(string|RegExp)[]|Set<string|RegExp>), useDocumentIds?: boolean}} TurboAddEventListenerOptions
     * @augments AddEventListenerOptions
     * @augments EventListenerOptions
     * @see https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options
     */

    /* === Classes === */

    /**
     * @class TurboListenerOptions
     * @implements TurboAddEventListenerOptions
     * @see TurboAddEventListenerOptions
     * @see https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options
     */
    class TurboListenerOptions {
        /** Indicates that events of this type will be dispatched to the registered listener before being dispatched to any {@link EventTarget} beneath it in the DOM tree. If not specified, defaults to `false`. Implements {@link EventListenerOptions#capture}.
         * @type {boolean} */ capture;
        /** Indicates that the listener should be invoked at most once after being added. When `true`, the listener would be automatically removed when invoked. If not specified, defaults to `false`. Implements {@link AddEventListenerOptions#once}.
         * @type {boolean} */ once;
        /** When `true`, indicates that the function specified by listener will never call [preventDefault()]{@link Event#preventDefault}. If a passive listener does call [preventDefault()]{@link Event#preventDefault}, the user agent will do nothing other than generate a console warning.  If not specified, defaults to `false` – except that in browsers other than Safari, it defaults to `true` for wheel, mousewheel, touchstart and touchmove events. Implements {@link AddEventListenerOptions#passive}.
         * @type {boolean} */ passive;
        /** The listener will be removed when the given {@link AbortSignal} object's [abort()]{@link AbortSignal#abort} method is called. If not specified, no {@link AbortSignal} is associated with the listener. Implements {@link AddEventListenerOptions#signal}.
         * @type {AbortSignal} */ signal;
        /** Indicates whether to ignore events involving Turbo's cached pages. See {@link https://discuss.hotwired.dev/t/before-cache-render-event/4928/4}. If not specified, defaults to `false`.
         * @type {boolean} */ nocache;
        /** Indicates whether the listener should skip use of {@link setTimeout}(callback,0), typically used to let the event settle before invoking the callback. If not specified, defaults to `false`.
         * @type {boolean} */ noTimeout;
        /** The target IDs to be verified against the event target ID. If not specified, no targetIds are associated with the listener. The input is coerced into an object with each key being the input `string` and the value being `true`.
         * @type {Object.<string,boolean>} */ targetIds;
        /** The URLs to be verified against the URL parameter. If not specified, the listener runs on any URL. The input is coerced into an array of {@link RegExp} objects.
         * @type {RegExp[]} */ urls;
        /** Indicates whether to check the IDs of the document element in addition to the event target for the {@link targetIds}. If not specified, defaults to `false`.
         * @type {boolean} */ useDocumentIds;

        /**
         * Merges the input object with the default options for event listeners and returns the result.
         *
         * @param {TurboAddEventListenerOptions} [options]
         * @see https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options
         */
        constructor(options) {
            Object.seal(this);
            if (options instanceof TurboListenerOptions) {
                Object.assign(this, options);
                return;
            }
            if (typeof options?.capture === 'boolean') this.capture = options.capture;
            if (typeof options?.once === 'boolean') this.once = options.once;
            if (typeof options?.passive === 'boolean') this.passive = options.passive;
            if (options?.signal instanceof AbortSignal) this.signal = options.signal;
            if (typeof options?.useDocumentIds === 'boolean') this.useDocumentIds = options.useDocumentIds;
            if (typeof options?.noTimeout === 'boolean') this.noTimeout = options.noTimeout;
            if (typeof options?.nocache === 'boolean') this.nocache = options.nocache;
            if (options?.targetIds != null) this.targetIds = Object.freeze(normalizeIdsToFlags(options.targetIds));
            if (options?.urls != null) this.urls = Object.freeze(normalizeToRegExpArray(options.urls));
        }

        /**
         * Extracts the event listener options from the object.
         *
         * @return {AddEventListenerOptions} An `options` object for `addEventListener()` or `removeEventListener()`.
         */
        getEventListenerOptions() {
            const output = {};
            if (this.capture !== undefined) output.capture = this.capture;
            if (this.once !== undefined) output.once = this.once;
            if (this.passive !== undefined) output.passive = this.passive;
            if (this.signal !== undefined) output.signal = this.signal;
            return output;
        }

        verify(event, url) { return this.#verifyAbort() && this.#verifyNoCache(event?.target) && this.#verifyTargetIds(event?.target?.id) && this.#verifyUrl(url); }

        #verifyAbort() { return !this.signal?.aborted; }

        #verifyNoCache(target) { return !this.nocache || !target?.hasAttribute('data-turbo-preview'); }

        #verifyTargetIds(id) {
            return this.targetIds == null || id != null && id in this.targetIds || this.useDocumentIds && Object.keys(this.targetIds).some(i => document.getElementById(i));
        }

        #verifyUrl(url) { return !(this.urls?.length > 0) || this.urls.some(reg => reg.test(url) && !(reg.lastIndex = 0)); }

        /**
         * Compares this object with another object for equality.
         *
         * @param {TurboAddEventListenerOptions} other - The other object to compare with.
         * @return {boolean} Whether the two objects are equal.
         */
        equals(other) {
            return this === other || other != null && (this.capture === other.capture
                && this.once === other.once
                && this.passive === other.passive
                && this.signal === other.signal
                && this.useDocumentIds === other.useDocumentIds
                && this.noTimeout === other.noTimeout
                && this.nocache === other.nocache
                && (this.targetIds === other.targetIds || deepEqual(this.targetIds, other.targetIds))
                && (this.urls === other.urls || deepEqual(this.urls, other.urls)));
        }

        /**
         * Creates a new instance of TurboListenerOptions from the provided options.
         *
         * @param {...TurboAddEventListenerOptions} [options] - Variable number of objects containing some or all of the described properties, to merge into an `TurboListenerOptions` instance. Property values are overwritten by the last object provided with the same property name. If only one object is provided, and it is an instance of `TurboListenerOptions`, it is returned as-is.
         * @return {TurboListenerOptions} An instance of `TurboListenerOptions`.
         */
        static from(...options) {
            switch (options.length) {
                case 0:
                    return new TurboListenerOptions();
                case 1:
                    return options[0] instanceof TurboListenerOptions ? options[0] : new TurboListenerOptions(options[0]);
            }
            return new TurboListenerOptions(options.reduce((acc, cur) => ({ ...acc, ...cur })));
        }

        /**
         * Creates a new instance of TurboListenerOptions from the provided options, using the current options as the basis.
         *
         * @see TurboListenerOptions.from
         */
        with(...options) {return TurboListenerOptions.from(new TurboListenerOptions(this), ...options);}

    }

    /** @class TurboEvent */
    class TurboEvent {
        name;
        source;
        #urlHandler;
        /** @type {{wrapper:(Event) => Promise<void|*>, listener:TurboEventCallback, options:TurboListenerOptions}[]} */
        #listeners = [];

        constructor(source, name, urlHandler) {
            this.name = name;
            this.source = source;
            this.#urlHandler = urlHandler;
            Object.freeze(this);
        }

        toString() { return this.name; }

        /**
         * Sets up a function that will be called whenever this event is delivered to the target.
         *
         * @param {TurboEventCallback} listener - The object that receives a notification (an object that implements the `Event` interface and a `string` with the relevant url) when an event of the specified type occurs. This must be a `function`.
         * @param {TurboAddEventListenerOptions} [options] - Options for the event listener.
         * @return {boolean} True if the listener was successfully added, false otherwise.
         */
        addListener(listener, options) {
            if (listener === undefined || listener === null || typeof listener !== 'function') return false;
            // noinspection JSUnresolvedReference
            if (window.Turbo?.session.history.pageLoaded && !wkof.turbo.silenceWarnings)
                console.warn(`The page has already loaded before adding the Turbo Event listener. The target event "${this.name}" may have already been dispatched.`);
            const listenerOptions = TurboListenerOptions.from(options);
            const index = this.#listeners.findIndex(({listener: existingListener, options: existingOptions}) => listener === existingListener && listenerOptions.equals(existingOptions));
            if (index !== -1) return false; // listener already exists.
            return this.#addWrappedListener(listener, listenerOptions);
        }

        /**
         * @param {TurboEventCallback} listener
         * @param {TurboListenerOptions} options
         * @returns {boolean}
         */
        #addWrappedListener(listener, options) {
            const wrapper = this.#createListenerWrapper(listener, options);
            const eventListenerOptions = options.getEventListenerOptions();
            if (eventListenerOptions.signal != null) eventListenerOptions.signal.onabort = () => this.#removeWrappedListener(listener, options);
            document.documentElement.addEventListener(this.name, wrapper, eventListenerOptions);
            this.#listeners.push({wrapper, listener, options});
            if (!(this.name in internalHandlers)) internalHandlers[this.name] = this.#listeners;
            return true;
        }

        /**
         * @param {TurboEventCallback} listener
         * @param {TurboListenerOptions} options
         * @returns {(function(Event): (Promise<void|*>))}
         */
        #createListenerWrapper(listener, options) {
            const wrapper = (event) => {
                const url = this.#urlHandler(event);
                if (!options.verify(event, url)) {
                    if (options.once)
                        document.documentElement.addEventListener(this.name, wrapper, options.getEventListenerOptions()); // re-add because the underlying listener is not going to be called.
                    return Promise.resolve();
                }
                return new Promise(resolve => {
                    if (options.noTimeout) resolve(listener(event, url));
                    else setTimeout(() => resolve(listener(event, url)), 0);
                });
            };
            return wrapper;
        }

        /**
         * Removes a listener for this event.
         *
         * @param {TurboEventCallback} listener - The callback function to remove.
         * @param {TurboAddEventListenerOptions} [options] - The options provided when adding the listener.
         * @return {boolean} Returns `true` if the listener was successfully removed, `false` otherwise.
         */
        removeListener(listener, options) {
            if (listener === undefined || listener === null || typeof listener !== 'function') return false;
            return this.#removeWrappedListener(listener, TurboListenerOptions.from(options));
        }

        #removeWrappedListener(listener, options) {
            const index = this.#listeners.findIndex(({listener: existingListener, options: existingOptions}) => listener === existingListener && options.equals(existingOptions));
            if (index === -1) return false; // listener doesn't exist.
            document.documentElement.removeEventListener(this.name, this.#listeners[index].wrapper, options.getEventListenerOptions());
            this.#listeners.splice(index, 1);
            if (this.#listeners.length === 0) delete internalHandlers[this.name];
            return true;
        }
    }

    // noinspection JSUnresolvedReference
    const urlHandlers = {
        detailFetchResponseResponseUrl: event => event.detail.fetchResponse.response.url,
        detailFormSubmissionFetchRequestUrlHref: event => event.detail.formSubmission.fetchRequest.url.href, detailNewElementBaseURI: event => event.detail.newElement.baseURI,
        detailNewFrameBaseURI: event => event.detail.newFrame.baseURI, detailNewStreamUrl: event => event.detail.newStream.url, detailRequestUrlHref: event => event.detail.request.url.href,
        detailResponseUrl: event => event.detail.response.url, detailUrl: event => event.detail.url, detailUrlHref: event => event.detail.url.href,
        targetBaseURI: event => event.target.baseURI, targetHref: event => event.target.href,
    };

    /* === WKOF Properties === */

    /**
     * Container for all the Turbo events.
     * @see https://turbo.hotwired.dev/reference/events
     * */
    const turboEvents = {}; Object.defineProperties(turboEvents, {
        // enumerable properties
        click: {value: new TurboEvent('document', 'turbo:click', urlHandlers.detailUrl), enumerable: true},
        before_visit: {value: new TurboEvent('document', 'turbo:before-visit', urlHandlers.detailUrl), enumerable: true},
        visit: {value: new TurboEvent('document', 'turbo:visit', urlHandlers.detailUrl), enumerable: true},
        before_cache: {value: new TurboEvent('document', 'turbo:before-cache', urlHandlers.targetBaseURI), enumerable: true},
        before_render: {value: new TurboEvent('document', 'turbo:before-render', urlHandlers.targetBaseURI), enumerable: true},
        render: {value: new TurboEvent('document', 'turbo:render', urlHandlers.targetBaseURI), enumerable: true},
        load: {value: new TurboEvent('document', 'turbo:load', urlHandlers.detailUrl), enumerable: true},
        morph: {value: new TurboEvent('pageRefresh', 'turbo:morph', urlHandlers.detailNewElementBaseURI), enumerable: true},
        before_morph_element: {value: new TurboEvent('pageRefresh', 'turbo:before-morph-element', urlHandlers.targetBaseURI), enumerable: true},
        before_morph_attribute: {value: new TurboEvent('pageRefresh', 'turbo:before-morph-attribute', urlHandlers.detailNewElementBaseURI), enumerable: true},
        morph_element: {value: new TurboEvent('pageRefresh', 'turbo:morph-element', urlHandlers.detailNewElementBaseURI), enumerable: true},
        submit_start: {value: new TurboEvent('forms', 'turbo:submit-start', urlHandlers.detailFormSubmissionFetchRequestUrlHref), enumerable: true},
        submit_end: {value: new TurboEvent('forms', 'turbo:submit-end', urlHandlers.detailFetchResponseResponseUrl), enumerable: true},
        before_frame_render: {value: new TurboEvent('frames', 'turbo:before-frame-render', urlHandlers.detailNewFrameBaseURI), enumerable: true},
        frame_render: {value: new TurboEvent('frames', 'turbo:frame-render', urlHandlers.targetBaseURI), enumerable: true},
        frame_load: {value: new TurboEvent('frames', 'turbo:frame-load', urlHandlers.targetBaseURI), enumerable: true},
        frame_missing: {value: new TurboEvent('frames', 'turbo:frame-missing', urlHandlers.detailResponseUrl), enumerable: true},
        before_stream_render: {value: new TurboEvent('streams', 'turbo:before-stream-render', urlHandlers.detailNewStreamUrl), enumerable: true},
        before_fetch_request: {value: new TurboEvent('httpRequests', 'turbo:before-fetch-request', urlHandlers.detailUrlHref), enumerable: true},
        before_fetch_response: {value: new TurboEvent('httpRequests', 'turbo:before-fetch-response', urlHandlers.detailFetchResponseResponseUrl), enumerable: true},
        before_prefetch: {value: new TurboEvent('httpRequests', 'turbo:before-prefetch', urlHandlers.targetHref), enumerable: true},
        fetch_request_error: {value: new TurboEvent('httpRequests', 'turbo:fetch-request-error', urlHandlers.detailRequestUrlHref), enumerable: true},
    }); Object.defineProperties(turboEvents, {
        // non-enumerable properties
        'turbo:click':                  {value: turboEvents.click},
        'turbo:before-visit':           {value: turboEvents.before_visit},
        'turbo:visit':                  {value: turboEvents.visit},
        'turbo:before-cache':           {value: turboEvents.before_cache},
        'turbo:before-render':          {value: turboEvents.before_render},
        'turbo:render':                 {value: turboEvents.render},
        'turbo:load':                   {value: turboEvents.load},
        'turbo:morph':                  {value: turboEvents.morph},
        'turbo:before-morph-element':   {value: turboEvents.before_morph_element},
        'turbo:before-morph-attribute': {value: turboEvents.before_morph_attribute},
        'turbo:morph-element':          {value: turboEvents.morph_element},
        'turbo:submit-start':           {value: turboEvents.submit_start},
        'turbo:submit-end':             {value: turboEvents.submit_end},
        'turbo:before-frame-render':    {value: turboEvents.before_frame_render},
        'turbo:frame-render':           {value: turboEvents.frame_render},
        'turbo:frame-load':             {value: turboEvents.frame_load},
        'turbo:frame-missing':          {value: turboEvents.frame_missing},
        'turbo:before-stream-render':   {value: turboEvents.before_stream_render},
        'turbo:before-fetch-request':   {value: turboEvents.before_fetch_request},
        'turbo:before-fetch-response':  {value: turboEvents.before_fetch_response},
        'turbo:before-prefetch':        {value: turboEvents.before_prefetch},
        'turbo:fetch-request-error':    {value: turboEvents.fetch_request_error},
    }); Object.freeze(turboEvents);

    /** Convenience container for all the Turbo events. */ /* eslint-disable @stylistic/max-len */
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
    }; Object.freeze(turboListeners); /* eslint-enable @stylistic/max-len */
    /** Container for various commonly used objects. */
    const common = Object.defineProperties({},{
        /** Collection of location patterns for commonly used pages. */
        locations: {value: Object.defineProperties({}, {
            dashboard: {value: /^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/, enumerable: true},
            items_pages: {value: /^https:\/\/www\.wanikani\.com\/(radicals|kanji|vocabulary)\/.+\/?$/, enumerable: true},
            lessons: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/(start|[\d-]+\/\d+)\/?$/, enumerable: true},
            lessons_picker: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/picker\/?$/, enumerable: true},
            lessons_quiz: {value: /^https:\/\/www\.wanikani\.com\/subject-lessons\/[\d-]+\/quiz.*\/?$/, enumerable: true},
            reviews: {value: /^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/, enumerable: true},
        }), enumerable: true},
    });
    /** Container for various commonly used event listeners. */
    const commonListeners = {}; Object.defineProperties(commonListeners, {
        /** @see addMultipleEventListeners */ eventList: {value: (eventList, callback, options) => addMultipleEventListeners(eventList, callback, options), enumerable: true},
        /** @deprecated Use {@link eventList} instead.*/ events: {value: (eventList, callback, options) => commonListeners.eventList(eventList, callback, options), enumerable: true},
        /** @see addTypicalFrameListener */ targetIds: {value: (callback, targetIds, options) => addTypicalFrameListener(callback, targetIds, options), enumerable: true},
        /** @see addTypicalPageListener */ urls: {value: (callback, urls, options) => addTypicalPageListener(callback, urls, options), enumerable: true},
        /** @see addTypicalPageListener */ dashboard: {value: (callback, options) => addTypicalPageListener(callback, common.locations.dashboard, options), enumerable: true},
        /** @see addTypicalPageListener */ items_pages: {value: (callback, options) => addTypicalPageListener(callback, common.locations.items_pages, options), enumerable: true},
        /** @see addTypicalPageListener */ lessons: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons, options), enumerable: true},
        /** @see addTypicalPageListener */ lessons_picker: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons_picker, options), enumerable: true},
        /** @see addTypicalPageListener */ lessons_quiz: {value: (callback, options) => addTypicalPageListener(callback, common.locations.lessons_quiz, options), enumerable: true},
        /** @see addTypicalPageListener */ reviews: {value: (callback, options) => addTypicalPageListener(callback, common.locations.reviews, options), enumerable: true},
    });
    /** The object to be published onto the `wkof.turbo` object. */
    const publishedInterface = {}; Object.defineProperties(publishedInterface, {
        add_event_listener: {value: addEventListener, enumerable: true},
        add_typical_page_listener: {value: addTypicalPageListener, enumerable: true},
        add_typical_frame_listener: {value: addTypicalFrameListener, enumerable: true},
        remove_event_listener: {value: removeEventListener, enumerable: true},
        /** Container for various event listeners. */
        on: {value: Object.defineProperties({}, {
                common: {value: commonListeners, enumerable: true},
                event: {value: turboListeners, enumerable: true},
            }), enumerable: true,
        },
        events: {value: turboEvents, enumerable: true},
        common: {value: common, enumerable: true},

        /** Set to `true` to silence all console warnings. */
        silenceWarnings: {value: false, writable: true, enumerable: true},
        version: {value: version, enumerable: true},
        '_.internal': {value: {internalHandlers}},
    });

    // noinspection JSUnresolvedReference
    let lastUrlLoaded = window.Turbo?.session.history.pageLoaded ? window.Turbo.session.history.location.href : (document.readyState === "complete" ? document.URL : '!');

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
        eventName = normalizeEventName(eventName);
        if (eventName === undefined) return false;

        if (eventName === 'load') {
            const quasiLoadEvent = new CustomEvent('load', {bubbles: false, cancelable: false, composed: false, target: document.documentElement});
            const turboOptions = TurboListenerOptions.from({useDocumentIds: true}, options);
            if (lastUrlLoaded === '!' || !turboOptions.verify(quasiLoadEvent, lastUrlLoaded)) return false;
            listener(quasiLoadEvent, lastUrlLoaded);
            return true;
        }
        if (!(eventName in turboEvents)) return false;
        return turboEvents[eventName].addListener(listener, options);
    }

    /**
     * Adds multiple event listeners to the specified event list.
     *
     * @param {(string|object|Array<string|object>|Set<string|object>)} eventList - The event list to add listeners to. If it is an object, it is assumed to be the `turboEvents` object. If it is an array, each element is treated as a string containing the event name or an object containing the event name as the property `name`.
     * @param {TurboEventCallback} listener - The callback function to be invoked when the event is triggered.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {({name: string, added: boolean}[])} An array of objects `{name: string, added: boolean}` containing the added event names and whether the listener was successfully added.
     */
    function addMultipleEventListeners(eventList, listener, options) {
        if (eventList === turboEvents) eventList = Object.values(eventList);
        if (eventList instanceof Set) eventList = Array.from(eventList.values());
        if (!Array.isArray(eventList)) eventList = [eventList];
        return eventList.map(eventName => {
            const name = normalizeEventName(eventName), added = addEventListener(name, listener, options);
            return {name, added};
        });
    }

    /**
     * Adds a `turbo:load` listener that will be called on the provided URLs and a `load` listener to guarantee the callback triggers even when the events have already fired.
     * This is a convenience function to simplify merging the options.
     *
     * @param {TurboEventCallback} callback - The callback function to be invoked when the event is triggered.
     * @param {(string|RegExp|Array<string|RegExp>)|Set<string>} urls - The URLs to be verified against the URL parameter.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {boolean} True if the listener was successfully added, false otherwise.
     */
    function addTypicalPageListener(callback, urls, options) {
        const warningSetting = wkof.turbo.silenceWarnings;
        try {
            wkof.turbo.silenceWarnings = true;
            return commonListeners.eventList(['load', turboEvents.load.name], callback, TurboListenerOptions.from(options, {urls}))[1].added;
        } finally {
            wkof.turbo.silenceWarnings = warningSetting;
        }
    }

    /**
     * Adds a `turbo:frame-load` listener that will be called for the provided target IDs. This is a convenience function to simplify merging the options.
     *
     * @param {TurboEventCallback} callback - The callback function to be invoked when the frame event is triggered.
     * @param {(string|string[]|Set<string>)} [targetIds] - The target IDs to be verified against the event target ID.
     * @param {TurboAddEventListenerOptions} [options] - The options for the event listener.
     * @return {boolean} True if the listener was successfully added, false otherwise.
     */
    function addTypicalFrameListener(callback, targetIds, options) {
        return turboEvents.frame_load.addListener(callback, TurboListenerOptions.from(options, {targetIds}));
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
        eventName = normalizeEventName(eventName);
        if (!(eventName in turboEvents)) return false;
        return turboEvents[eventName].removeListener(listener, options);
    }

    /* === Helper Functions === */

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

    function isNewerThan(otherVersion) {
        if (otherVersion == null) return true;
        const v1 = version.toString().split(`.`).map(v => parseInt(v)), v2 = otherVersion.toString().split(`.`).map(v => parseInt(v));
        return v1.reduce((r, v, i) => r ?? (v === v2[i] ? null : (v > (v2[i] || 0))), null) || false;
    }

    /**
     * Normalizes the input into a `string` or `undefined`.
     *
     * @param {(string|object|object[])} eventName - The input event name to be validated.
     * @return {string|undefined} The valid event name if the input is valid, otherwise null.
     */
    function normalizeEventName(eventName) {
        if (typeof eventName === 'string') return eventName;
        if (Array.isArray(eventName) && 'name' in eventName[1]) eventName = eventName[1].name; // e.g., `Object.entries(wkof.turbo.events)[0]`
        if (typeof eventName === 'object' && 'name' in eventName) eventName = eventName.name; // e.g., `Object.values(wkof.turbo.events)[0]` or `wkof.turbo.events.click`
        if (typeof eventName !== 'string') return undefined;
        return eventName;
    }

    /**
     * Normalizes the input into an object where keys are strings and values are booleans.
     *
     * @param {(undefined|null|Set<*>|*|*[])} input - The input to be normalized.
     * @return {Object.<string, boolean>} An object where keys are strings and values are booleans.
     */
    function normalizeIdsToFlags(input) {
        if (input === undefined || input === null) return {};
        if (input instanceof Set) input = input.values();
        else if (Object.values(input).every(val => val === true)) return input;
        else if (!Array.isArray(input)) input = [input];
        const output = {};
        for (const id of input)
            if (typeof id === 'string')
                output[id] = true;
        return output;
    }

    /**
     * Normalizes the input object `input` into an array of RegExp objects.
     *
     * @param {(*|*[]|Set<*>)} input - The input to be normalized.
     * @return {RegExp[]} An array of RegExp objects containing input values coerced into RegExp objects.
     */
    function normalizeToRegExpArray(input) {
        if (input === undefined || input === null) return [];
        if (input instanceof Set) input = [...input.values()];
        if (!Array.isArray(input)) input = [input];
        if (input.every(val => val instanceof RegExp)) return input;
        const output = [];
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
                const event = turboEvents[name];
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
        const {wkof} = window.unsafeWindow || window;
        const existingTurbo = wkof.turbo;
        if (!existingTurbo) return undefined;
        else if (!isNewerThan(existingTurbo.version)) return null;
        setModuleReadyState(false);
        const internal = existingTurbo['_.internal'];
        const existingActiveListeners = new Map();
        if (internal == null) {
            const cookieKey = 'turbo_library_warning_seen';
            if (!getCookie(cookieKey) && didConfirmWarning())
                setCookie(cookieKey, 'Y', {days: 7});
        } else {
            for (const [eventName, object] of Object.entries(internal.internalHandlers)) {
                if (!object) continue;
                if (Array.isArray(object)) { // version 4
                    for (const item of object) {
                        if (!('wrapper' in item)) continue;
                        for (const {wrapper, options} of object) {
                            const eventListenerOptions = options.getEventListenerOptions();
                            document.documentElement.removeEventListener(eventName, wrapper, eventListenerOptions);
                            existingActiveListeners.set(eventName, {listener: wrapper, eventListenerOptions});
                        }
                    }
                    continue;
                }
                if ('capture' in object || 'bubble' in object) { // version 3
                    for (const [, {handler, options}] in Object.entries(object)) {
                        document.documentElement.removeEventListener(eventName, handler, options);
                        existingActiveListeners.set(eventName, {listener: handler, options});
                    }
                    continue;
                }
                if ('active' in object) { // version 2
                    const {handler, active} = object;
                    if (!active) continue;
                    // noinspection JSUnresolvedReference
                    const listenerOptions = handler.listenerOptions;
                    document.documentElement.removeEventListener(eventName, handler.listener ?? handler, listenerOptions);
                    existingActiveListeners.set(eventName, {listener: handler.listener, options: listenerOptions});
                }
            }
        }
        delete wkof.turbo;
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
