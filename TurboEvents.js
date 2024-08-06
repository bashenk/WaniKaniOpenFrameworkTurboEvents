// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     2.1.0
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

    const turboPrefix = 'turbo:';
    const handleDetailFetchResponseResponseUrl = { listener: async event => await handleEvent(event, event.detail.fetchResponse.response.url) },
        handleDetailFormSubmissionFetchRequestUrlHref = { listener: async event => await handleEvent(event, event.detail.formSubmission.fetchRequest.url.href) },
        handleDetailNewElementBaseURI = { listener: async event => await handleEvent(event, event.detail.newElement.baseURI) },
        handleDetailNewFrameBaseURI = {listener: async event => await handleEvent(event, event.detail.newFrame.baseURI)},
        handleDetailNewStreamUrl = {listener: async event => await handleEvent(event, event.detail.newStream.url)},
        handleDetailRequestUrlHref = {listener: async event => await handleEvent(event, event.detail.request.url.href)},
        handleDetailResponseUrl = {listener: async event => await handleEvent(event, event.detail.response.url)},
        handleDetailUrl = {listener: async event => await handleEvent(event, event.detail.url)},
        // "turbo:load" is necessary to run at startup and keep active to ensure `lastUrlLoaded` is properly maintained.
        handleDetailUrlAndUpdateLoadedPage = {listener: async event => await handleEvent(event, lastUrlLoaded = event.detail.url), persistent: true},
        handleDetailUrlHref = {listener: async event => await handleEvent(event, event.detail.url.href)},
        handleTargetBaseURI = {listener: async event => await handleEvent(event, event.target.baseURI)},
        handleTargetHref = {listener: async event => await handleEvent(event, event.target.href)};
    // https://turbo.hotwired.dev/reference/events
    const turboEvents = Object.freeze({
        click:                  {source: 'document', name: `${turboPrefix}click`, handler: handleDetailUrl},
        before_visit:           {source: 'document', name: `${turboPrefix}before-visit`, handler: handleDetailUrl},
        visit:                  {source: 'document', name: `${turboPrefix}visit`, handler: handleDetailUrl},
        before_cache:           {source: 'document', name: `${turboPrefix}before-cache`, handler: handleTargetBaseURI},
        before_render:          {source: 'document', name: `${turboPrefix}before-render`, handler: handleTargetBaseURI},
        render:                 {source: 'document', name: `${turboPrefix}render`, handler: handleTargetBaseURI},
        load:                   {source: 'document', name: `${turboPrefix}load`, handler: handleDetailUrlAndUpdateLoadedPage},
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
        const eventKey = eventName.slice(turboPrefix.length).replaceAll('-', '_');
        if (!(eventKey in turboEvents)) return false;
        if (!internal_handlers[eventName]?.active)
            addInternalEventListener(eventName, turboEvents[eventKey].handler, true);
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

    function addInternalEventListener(eventName, handler, activate) {
        if (typeof eventName !== 'string') return false;
        let internalHandler;
        if (eventName in internal_handlers && internal_handlers[eventName].options === handler.options)
            internalHandler = internal_handlers[eventName];
        else internalHandler = internal_handlers[eventName] = handler;

        if (activate && !internalHandler.active) {
            document.documentElement.addEventListener(eventName, handler.listener, handler.options);
            internalHandler.active = true;
        }
        return true;
    }

    function removeInternalEventListener(eventName) {
        if (typeof eventName !== 'string') return false;
        if (!(eventName in internal_handlers)) return false;
        const {active, listener, options, persistent} = internal_handlers[eventName];
        if (persistent || !active) return false;
        document.documentElement.removeEventListener(eventName, listener, options);
        internal_handlers[eventName].active = false;
        if (!persistent) delete internal_handlers[eventName];
        return true;
    }

    //------------------------------
    // Call event handlers.
    //------------------------------
    async function handleEvent(event, url) {
        await Promise.all(getEventHandlers(event, url));
    }

    function * getEventHandlers(event, url) {
        if (event === undefined || event === null || !(event.type in event_handlers)) return;
        for (const [listener, options] of event_handlers[event.type])
            yield emitHandler(event, url, listener, options);
    }

    async function emitHandler(event, url, listener, options) {
        // Ignore cached pages. See https://discuss.hotwired.dev/t/before-cache-render-event/4928/4
        if (options?.nocache && event.target?.hasAttribute('data-turbo-preview')) return;
        const urlRegExes = normalizeUrls(options?.urls);
        if (urlRegExes?.length > 0 && !urlRegExes.find(reg => reg.test(url))) return;
        // yield a promise for each listener
        if (!options?.noTimeout) await nextEventLoopTick();
        listener(event, url);
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

        for (const key in turboEvents) {
            const event = turboEvents[key];
            if (!('persistent' in event.handler)) event.handler.persistent = false;
            if (!('options' in event.handler)) event.handler.options = {capture: true, once: false, passive: true, signal: undefined};
            addInternalEventListener(event.name, event.handler, event.handler.persistent);
        }
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
