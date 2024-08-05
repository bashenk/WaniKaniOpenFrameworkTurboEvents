// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     2.0.4
// @match       https://www.wanikani.com/*
// @match       https://preview.wanikani.com/*
// @author      Inserio
// @copyright   2024, Brian Shenk
// @license     MIT; http://opensource.org/licenses/MIT
// @run-at      document-start
// @grant       none
// ==/UserScript==
/* global wkof */
/* jshint esversion: 11 */

(function() {
    'use strict';

    // https://turbo.hotwired.dev/reference/events
    const turboEvents = Object.freeze({
        click:                  {source: 'document', name: 'turbo:click'},
        before_visit:           {source: 'document', name: 'turbo:before-visit'},
        visit:                  {source: 'document', name: 'turbo:visit'},
        before_cache:           {source: 'document', name: 'turbo:before-cache'},
        before_render:          {source: 'document', name: 'turbo:before-render'},
        render:                 {source: 'document', name: 'turbo:render'},
        load:                   {source: 'document', name: 'turbo:load'},
        morph:                  {source: 'pageRefresh', name: 'turbo:morph'},
        before_morph_element:   {source: 'pageRefresh', name: 'turbo:before-morph-element'},
        before_morph_attribute: {source: 'pageRefresh', name: 'turbo:before-morph-attribute'},
        morph_element:          {source: 'pageRefresh', name: 'turbo:morph-element'},
        submit_start:           {source: 'forms', name: 'turbo:submit-start'},
        submit_end:             {source: 'forms', name: 'turbo:submit-end'},
        before_frame_render:    {source: 'frames', name: 'turbo:before-frame-render'},
        frame_render:           {source: 'frames', name: 'turbo:frame-render'},
        frame_load:             {source: 'frames', name: 'turbo:frame-load'},
        frame_missing:          {source: 'frames', name: 'turbo:frame-missing'},
        before_stream_render:   {source: 'streams', name: 'turbo:before-stream-render'},
        before_fetch_request:   {source: 'httpRequests', name: 'turbo:before-fetch-request'},
        before_fetch_response:  {source: 'httpRequests', name: 'turbo:before-fetch-response'},
        before_prefetch:        {source: 'httpRequests', name: 'turbo:before-prefetch'},
        fetch_request_error:    {source: 'httpRequests', name: 'turbo:fetch-request-error'},
    });
    const turboListeners = Object.freeze({
        click:                  function on_click(callback, options) { return addEventListener(turboEvents.click.name, callback, options); },
        before_visit:           function on_before_visit(callback, options) { return addEventListener(turboEvents.before_visit.name, callback, options); },
        visit:                  function on_visit(callback, options) { return addEventListener(turboEvents.visit.name, callback, options); },
        before_cache:           function on_before_cache(callback, options) { return addEventListener(turboEvents.before_cache.name, callback, options); },
        before_render:          function on_before_render(callback, options) { return addEventListener(turboEvents.before_render.name, callback, options); },
        render:                 function on_render(callback, options) { return addEventListener(turboEvents.render.name, callback, options); },
        load:                   function on_load(callback, options) { return addEventListener(turboEvents.load.name, callback, options); },
        morph:                  function on_morph(callback, options) { return addEventListener(turboEvents.morph.name, callback, options); },
        before_morph_element:   function on_before_morph_element(callback, options) { return addEventListener(turboEvents.before_morph_element.name, callback, options); },
        before_morph_attribute: function on_before_morph_attribute(callback, options) { return addEventListener(turboEvents.before_morph_attribute.name, callback, options); },
        morph_element:          function on_morph_element(callback, options) { return addEventListener(turboEvents.morph_element.name, callback, options); },
        submit_start:           function on_submit_start(callback, options) { return addEventListener(turboEvents.submit_start.name, callback, options); },
        submit_end:             function on_submit_end(callback, options) { return addEventListener(turboEvents.submit_end.name, callback, options); },
        before_frame_render:    function on_before_frame_render(callback, options) { return addEventListener(turboEvents.before_frame_render.name, callback, options); },
        frame_render:           function on_frame_render(callback, options) { return addEventListener(turboEvents.frame_render.name, callback, options); },
        frame_load:             function on_frame_load(callback, options) { return addEventListener(turboEvents.frame_load.name, callback, options); },
        frame_missing:          function on_frame_missing(callback, options) { return addEventListener(turboEvents.frame_missing.name, callback, options); },
        before_stream_render:   function on_before_stream_render(callback, options) { return addEventListener(turboEvents.before_stream_render.name, callback, options); },
        before_fetch_request:   function on_before_fetch_request(callback, options) { return addEventListener(turboEvents.before_fetch_request.name, callback, options); },
        before_fetch_response:  function on_before_fetch_response(callback, options) { return addEventListener(turboEvents.before_fetch_response.name, callback, options); },
        before_prefetch:        function on_before_prefetch(callback, options) { return addEventListener(turboEvents.before_prefetch.name, callback, options); },
        fetch_request_error:    function on_fetch_request_error(callback, options) { return addEventListener(turboEvents.fetch_request_error.name, callback, options); },
    });
    const common = {
        locations: {
            dashboard: /^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/,
            items_pages: /^https:\/\/www\.wanikani\.com\/(radicals|kanji|vocabulary)\/.+\/?$/,
            lessons: /^https:\/\/www\.wanikani\.com\/subject-lessons\/(start|[\d-]+\/\d+)\/?$/,
            lessons_picker: /^https:\/\/www\.wanikani\.com\/subject-lessons\/picker\/?$/,
            lessons_quiz: /^https:\/\/www\.wanikani\.com\/subject-lessons\/[\d-]+\/quiz.*\/?$/,
            reviews: /^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/,
        },
    };
    const commonListeners = {
        events:         function on_events(eventList, callback, options) { return eventList.map(eventName => addEventListener(eventName, callback, options)).every(result => result); },
        urls:           function on_urls(callback, urls) { return addTypicalPageListener(callback, urls); },
        dashboard:      function on_dashboard(callback) { return addTypicalPageListener(callback, common.locations.dashboard); },
        items_pages:    function on_items_pages(callback) { return addTypicalPageListener(callback, common.locations.items_pages); },
        lessons:        function on_lessons(callback) { return addTypicalPageListener(callback, common.locations.lessons); },
        lessons_picker: function on_lessons_picker(callback) { return addTypicalPageListener(callback, common.locations.lessons_picker); },
        lessons_quiz:   function on_lessons_quiz(callback) { return addTypicalPageListener(callback, common.locations.lessons_quiz); },
        reviews:        function on_reviews(callback) { return addTypicalPageListener(callback, common.locations.reviews); },
    };
    const eventMap = {
        common: commonListeners,
        event: turboListeners,
    };

    const publishedInterface = {
        add_event_listener: addEventListener,
        remove_event_listener: removeEventListener,
        on: eventMap,
        events: turboEvents,
        common: common,
    };

    let lastUrlLoaded = '!';
    let nextUrl = '!';

    /**
     * Listeners
     */

    // Add a typical listener to run for the provided urls.
    function addTypicalPageListener(callback, urls) {
        return wkof.turbo.on.common.events(['load', turboEvents.load.name], callback, {urls, noTimeout: false});
    }

    const internal_handlers = {};
    const event_handlers = {};

    // Sets up a function that will be called whenever the specified event is delivered to the target.
    function addEventListener(eventName, listener, options) {
        if (listener === undefined || listener === null) return false;
        if (typeof eventName === 'object' && 'name' in eventName) eventName = eventName.name;
        if (typeof eventName !== 'string') return false;

        if (eventName === 'load' && typeof listener === 'function') {
            const urls = normalizeUrls(options?.urls);
            if (lastUrlLoaded === '!' || urls?.length > 0 && !urls.find(url => url.test(lastUrlLoaded)))
                return true; // TODO: Should this return false?
            listener();
            return true;
        }
        if (!(eventName in internal_handlers)) addInternalEventListener(eventName, handleEvent, false);
        if (!(eventName in event_handlers)) event_handlers[eventName] = new Map();
        event_handlers[eventName].set(listener, options);
        return true;
    }

    // Removes an event listener previously registered with addEventListener().
    function removeEventListener(eventName, listener, options) {
        if (listener === undefined || listener === null) return false;
        if (typeof eventName === 'object' && 'name' in eventName) eventName = eventName.name;
        if (typeof eventName !== 'string' || !(eventName in event_handlers)) return false;
        const eventHandlers = event_handlers[eventName];
        if (!eventHandlers.has(listener)) return false;
        const listenerOptions = eventHandlers.get(listener);
        if (deepEqual(listenerOptions, options)) {
            eventHandlers.delete(listener);
            if (eventHandlers.size === 0) removeInternalEventListener(eventName);
            return true;
        }
        return false;
    }

    function addInternalEventListener(eventName, listener, persistent) {
        if (typeof eventName !== 'string') return false;
        if (eventName in internal_handlers) return false;
        document.documentElement.addEventListener(eventName, listener);
        internal_handlers[eventName] = {listener, persistent};
        return true;
    }

    function removeInternalEventListener(eventName) {
        if (typeof eventName !== 'string') return false;
        if (!(eventName in internal_handlers)) return false;
        const handler = internal_handlers[eventName];
        if (handler.persistent) return false;
        document.documentElement.removeEventListener(eventName, handler.listener);
        delete internal_handlers[eventName];
        return true;
    }

    //------------------------------
    // Call event handlers.
    //------------------------------
    async function handleEvent(event) {
        await Promise.all(getEventHandlers(event));
    }

    function * getEventHandlers(event) {
        if (event === undefined || event === null || !(event.type in event_handlers)) return;
        for (const [listener, options] of event_handlers[event.type])
            yield emitHandler(event, listener, options);
    }

    async function emitHandler(event, listener, options) {
        // Ignore cached pages. See https://discuss.hotwired.dev/t/before-cache-render-event/4928/4
        if (options?.nocache && event.target.hasAttribute('data-turbo-preview')) return;
        const urls = normalizeUrls(options?.urls);
        if (urls?.length > 0 && !urls.find(url => url.test(nextUrl))) return;
        // yield a promise for each listener
        if (!options?.noTimeout) await nextEventLoopTick();
        listener(event);
        if (options?.once) removeEventListener(event.type, listener, options);
    }

    /**
     * Helpers
     */

    function normalizeUrls(urls) {
        if (urls === undefined || urls === null) return null;
        if (!Array.isArray(urls)) urls = [urls];
        return urls.reduce((acc, url) => {
            if (url instanceof RegExp) acc.push(url);
            if (typeof url === 'string') acc.push(new RegExp(url.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')));
            return acc;
        }, []);
    }

    function deepEqual(x, y) {
        const ok = Object.keys, tx = typeof x, ty = typeof y;
        return x && y && tx === 'object' && tx === ty ? (
            ok(x).length === ok(y).length &&
            ok(x).every(key => deepEqual(x[key], y[key]))
        ) : (x === y);
    }

    /**
     * Initialization
     */

    function addTurboEvents() {
        wkof.turbo = publishedInterface;

        const updateNextUrlFromDetail = async event => {
            nextUrl = event.detail.url;
            await handleEvent(event);
        };
        const updateCurrentUrlFromDetail = async event => {
            lastUrlLoaded = nextUrl = event.detail.url;
            await handleEvent(event);
        };
        const updateNextUrlFromTarget = async event => {
            nextUrl = event.target.baseURI;
            await handleEvent(event);
        };

        for (const turboEvent of [wkof.turbo.events.click, wkof.turbo.events.before_visit, wkof.turbo.events.visit])
            addInternalEventListener(turboEvent.name, updateNextUrlFromDetail, true);
        for (const turboEvent of [wkof.turbo.events.before_cache, wkof.turbo.events.before_render, wkof.turbo.events.render])
            addInternalEventListener(turboEvent.name, updateNextUrlFromTarget, true);

        addInternalEventListener(wkof.turbo.events.load.name, updateCurrentUrlFromDetail, true);
    }

    function nextEventLoopTick() {
        return new Promise(resolve => setTimeout(() => resolve(), 0));
    }

    function startup() {
        if (!window.wkof) {
            const response = confirm('WaniKani Open Framework Turbo Events requires WaniKani Open Framework.\n Click "OK" to be forwarded to installation instructions.');
            if (response) window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
            return;
        }
        wkof.ready('wkof')
            .then(addTurboEvents)
            .then(turboEventsReady);
    }

    function turboEventsReady() {
        wkof.set_state('wkof.TurboEvents', 'ready');
    }

    startup();

})();
