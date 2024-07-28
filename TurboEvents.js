// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     1.1.1
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

    const eventMap = Object.freeze({
        events:                 function on_events(eventList, callback, urls) { return addEventListener(eventList, {callback, urls}); },
        click:                  function on_click(callback, urls) { return addEventListener(turboEvents.click.name, {callback, urls}); },
        before_visit:           function on_before_visit(callback, urls) { return addEventListener(turboEvents.before_visit.name, {callback, urls}); },
        visit:                  function on_visit(callback, urls) { return addEventListener(turboEvents.visit.name, {callback, urls}); },
        before_cache:           function on_before_cache(callback, urls) { return addEventListener(turboEvents.before_cache.name, {callback, urls}); },
        before_render:          function on_before_render(callback, urls) { return addEventListener(turboEvents.before_render.name, {callback, urls}); },
        render:                 function on_render(callback, urls) { return addEventListener(turboEvents.render.name, {callback, urls}); },
        load:                   function on_load(callback, urls) { return addEventListener(turboEvents.load.name, {callback, urls}); },
        morph:                  function on_morph(callback, urls) { return addEventListener(turboEvents.morph.name, {callback, urls}); },
        before_morph_element:   function on_before_morph_element(callback, urls) { return addEventListener(turboEvents.before_morph_element.name, {callback, urls}); },
        before_morph_attribute: function on_before_morph_attribute(callback, urls) { return addEventListener(turboEvents.before_morph_attribute.name, {callback, urls}); },
        morph_element:          function on_morph_element(callback, urls) { return addEventListener(turboEvents.morph_element.name, {callback, urls}); },
        submit_start:           function on_submit_start(callback, urls) { return addEventListener(turboEvents.submit_start.name, {callback, urls}); },
        submit_end:             function on_submit_end(callback, urls) { return addEventListener(turboEvents.submit_end.name, {callback, urls}); },
        before_frame_render:    function on_before_frame_render(callback, urls) { return addEventListener(turboEvents.before_frame_render.name, {callback, urls}); },
        frame_render:           function on_frame_render(callback, urls) { return addEventListener(turboEvents.frame_render.name, {callback, urls}); },
        frame_load:             function on_frame_load(callback, urls) { return addEventListener(turboEvents.frame_load.name, {callback, urls}); },
        frame_missing:          function on_frame_missing(callback, urls) { return addEventListener(turboEvents.frame_missing.name, {callback, urls}); },
        before_stream_render:   function on_before_stream_render(callback, urls) { return addEventListener(turboEvents.before_stream_render.name, {callback, urls}); },
        before_fetch_request:   function on_before_fetch_request(callback, urls) { return addEventListener(turboEvents.before_fetch_request.name, {callback, urls}); },
        before_fetch_response:  function on_before_fetch_response(callback, urls) { return addEventListener(turboEvents.before_fetch_response.name, {callback, urls}); },
        before_prefetch:        function on_before_prefetch(callback, urls) { return addEventListener(turboEvents.before_prefetch.name, {callback, urls}); },
        fetch_request_error:    function on_fetch_request_error(callback, urls) { return addEventListener(turboEvents.fetch_request_error.name, {callback, urls}); },
    });

    const publishedInterface= {
        add_event_listener: addEventListener,
        remove_event_listener: removeEventListener,

        on: eventMap,
        events: turboEvents,
    };

    let lastUrlLoaded = document.URL;

    //------------------------------
    // Add handlers for all events.
    //------------------------------
    const internal_handlers = {};
    const event_handlers = {};
    function addEventListener(eventNames, handler) {
        if (!Array.isArray(handler.urls)) handler.urls = [handler.urls];
        if (!Array.isArray(eventNames)) eventNames = [eventNames];
        handler.urls = handler.urls.map((url) => {
            if (url instanceof RegExp) return url;
            if (typeof url !== 'string') return null;
            return new RegExp(url.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*','.*'));
        }).filter(url => url !== null);
        eventNames = eventNames.map((event) => {
            if (typeof event === 'string') return event;
            if (typeof event === 'object' && event.name) return event.name;
            return null;
        }).filter(event => event !== null);

        const result = {};
        const lastUrl = lastUrlLoaded;
        for (let i = 0; i < eventNames.length; i++){
            const eventName = eventNames[i];
            if (!internal_handlers[eventName])
                document.documentElement.addEventListener(eventName, internal_handlers[eventName] = handleEvent);
            if (!event_handlers[eventName])
                event_handlers[eventName] = new Set();
            event_handlers[eventName].add(handler);
            result[eventName] = handler;
            if (eventName === 'load' && typeof handler.callback === 'function' && handler.urls?.length > 0 && handler.urls.find(url => url.test(lastUrl)))
                handler.callback();
        }
        result.remove = function() { eventNames.forEach(eventName => wkof.turbo.remove_event_listener(eventName, this[eventName])); }
        return result;
    }

    function removeEventListener(eventName, listener) {
        if (typeof eventName === 'object' && eventName.name) eventName = eventName.name;
        else if (typeof eventName !== 'string') return false;
        const eventHandlers = event_handlers[eventName];
        if (eventHandlers) {
            eventHandlers.delete(listener);
            if (eventHandlers.size === 0) document.documentElement.removeEventListener(eventName, internal_handlers[eventName]);
            return true;
        }
        return false;
    }

    //------------------------------
    // Call event handlers.
    //------------------------------
    function handleEvent(event) {
        const handlers = event_handlers[event.type];
        if (!handlers) return;
        const lastUrl = lastUrlLoaded;
        for (const handler of handlers) {
            if (handler.urls?.length > 0 && !handler.urls.find(url => url.test(lastUrl))) continue;
            if (typeof handler.callback === 'function') handler.callback(event);
        }
    }

    function addTurboEvents() {
        wkof.turbo = publishedInterface;

        [wkof.turbo.events.click,
            wkof.turbo.events.before_visit,
            wkof.turbo.events.visit,
            wkof.turbo.events.before_cache,
            wkof.turbo.events.render,
            wkof.turbo.events.load
        ].forEach(turboEvent => {
            document.documentElement.addEventListener(turboEvent.name, internal_handlers[turboEvent.name] = event => {
                lastUrlLoaded = event.detail?.url ?? event.target?.baseURI ?? document.URL;
                handleEvent(event);
            });
        });

        document.documentElement.addEventListener(wkof.turbo.events.before_render.name, internal_handlers[turboEvents.before_render.name] = event => {
            lastUrlLoaded = event.target?.baseURI ?? document.URL;
            let observer = new MutationObserver(m => {
                if (relevantRootElementChildren(m[0].target).length > 0) return;
                observer.disconnect();
                observer = null;
                handleEvent(event);
            });
            observer.observe(event.detail.newBody, {childList: true});
        });

    }

    // it seems like Turbo does not move the SVG element into document.body, so let's ignore it
    function relevantRootElementChildren(rootElement) {
        return [...rootElement?.children ?? []].filter(c => c.tagName !== `svg`);
    }

    function startup() {
        if (!window.wkof) {
            const response = confirm('WaniKani Open Framework Additional Filters requires WaniKani Open Framework.\n Click "OK" to be forwarded to installation instructions.');
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
