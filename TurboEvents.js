// ==UserScript==
// @name        Wanikani Open Framework Turbo Events
// @namespace   https://greasyfork.org/en/users/11878
// @description Adds helpful methods for dealing with Turbo Events to WaniKani Open Framework
// @version     1.0.0
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
        click:                  function on_click(callback) { return onEvent(turboEvents.click.name, callback); },
        before_visit:           function on_before_visit(callback) { return onEvent(turboEvents.before_visit.name, callback); },
        visit:                  function on_visit(callback) { return onEvent(turboEvents.visit.name, callback); },
        before_cache:           function on_before_cache(callback) { return onEvent(turboEvents.before_cache.name, callback); },
        before_render:          function on_before_render(callback) { return onEvent(turboEvents.before_render.name, callback); },
        render:                 function on_render(callback) { return onEvent(turboEvents.render.name, callback); },
        load:                   function on_load(callback) { return onEvent(turboEvents.load.name, callback); },
        morph:                  function on_morph(callback) { return onEvent(turboEvents.morph.name, callback); },
        before_morph_element:   function on_before_morph_element(callback) { return onEvent(turboEvents.before_morph_element.name, callback); },
        before_morph_attribute: function on_before_morph_attribute(callback) { return onEvent(turboEvents.before_morph_attribute.name, callback); },
        morph_element:          function on_morph_element(callback) { return onEvent(turboEvents.morph_element.name, callback); },
        submit_start:           function on_submit_start(callback) { return onEvent(turboEvents.submit_start.name, callback); },
        submit_end:             function on_submit_end(callback) { return onEvent(turboEvents.submit_end.name, callback); },
        before_frame_render:    function on_before_frame_render(callback) { return onEvent(turboEvents.before_frame_render.name, callback); },
        frame_render:           function on_frame_render(callback) { return onEvent(turboEvents.frame_render.name, callback); },
        frame_load:             function on_frame_load(callback) { return onEvent(turboEvents.frame_load.name, callback); },
        frame_missing:          function on_frame_missing(callback) { return onEvent(turboEvents.frame_missing.name, callback); },
        before_stream_render:   function on_before_stream_render(callback) { return onEvent(turboEvents.before_stream_render.name, callback); },
        before_fetch_request:   function on_before_fetch_request(callback) { return onEvent(turboEvents.before_fetch_request.name, callback); },
        before_fetch_response:  function on_before_fetch_response(callback) { return onEvent(turboEvents.before_fetch_response.name, callback); },
        before_prefetch:        function on_before_prefetch(callback) { return onEvent(turboEvents.before_prefetch.name, callback); },
        fetch_request_error:    function on_fetch_request_error(callback) { return onEvent(turboEvents.fetch_request_error.name, callback); },
    });
 
    const publishedInterface= {
        on_page_event: onPageEvent,
        remove_event_handler: removeEventHandler,
 
        on: eventMap,
        events: turboEvents,
    };
 
    let lastUrlLoaded = document.URL;
 
    //------------------------------
    // Add handlers for all events.
    //------------------------------
    let event_handlers = {};
    function onEvent(eventName, handler) {
        if (!event_handlers[eventName]) event_handlers[eventName] = new Set();
        if (event_handlers[eventName].size === 0) {
            const eventListener = event => handleEvent(eventName, event);
            document.documentElement.addEventListener(eventName, eventListener);
            event_handlers[eventName].add(eventListener);
        }
        event_handlers[eventName].add(handler);
        return handler;
    }
 
    function removeEventHandler(eventName, handler) {
        const eventHandlers = event_handlers[eventName];
        if (eventHandlers) {
            eventHandlers.delete(handler);
            if (eventHandlers.size === 1) {
                document.documentElement.removeEventListener(eventName, eventHandlers[0]);
                eventHandlers.clear();
            }
        }
    }
 
    //------------------------------
    // Call event handlers.
    //------------------------------
    function handleEvent(eventName, event) {
        const handlers = event_handlers[eventName];
        let firstElement = true;
        for (const handler of handlers) {
            if (firstElement) { firstElement = false; continue; }
            if (typeof handler === 'function') handler(event);
        }
    }
 
    //------------------------------
    // Add handlers for page events for a list of URLs.
    //------------------------------
    let page_handlers = [];
    function onPageEvent(handler) {
        if (!Array.isArray(handler.urls)) handler.urls = [handler.urls];
        if (!Array.isArray(handler.events)) handler.events = [handler.events];
        handler.urls = handler.urls.map((url) => {
            if (url instanceof RegExp) return url;
            if (typeof url !== 'string') return null;
            return new RegExp(url.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*','.*'));
        }).filter(url => url !== null);
        handler.events = handler.events.map((event) => {
            if (typeof event === 'string') return event;
            if (typeof event === 'object' && event.name) return event.name;
            return null;
        }).filter(event => event !== null);
        page_handlers.push(handler);
        if (handler.events.includes('load')) {
            handler.urls.forEach(url => {
                if (!url.test(lastUrlLoaded)) return;
                handler.callback();
            });
        }
    }
 
    //------------------------------
    // Call page event handlers.
    //------------------------------
    async function handlePageEvents(event_name, event, new_page_url) {
        page_handlers.forEach(handler => {
            if (!handler.urls.find(url => url.test(new_page_url))) return;
            if ((handler.events.length === 0 || handler.events.includes(event_name)) && typeof handler.callback === 'function') handler.callback(event);
        });
    }
 
    function addTurboEvents() {
        wkof.turbo = publishedInterface;
 
        document.documentElement.addEventListener(turboEvents.click.name, async event => {
            lastUrlLoaded = event.detail.url;
            await handlePageEvents(turboEvents.click.name, event, lastUrlLoaded);
        });
        document.documentElement.addEventListener(turboEvents.before_visit.name, async event => {
            lastUrlLoaded = event.detail.url;
            await handlePageEvents(turboEvents.before_visit.name, event, lastUrlLoaded);
        });
        document.documentElement.addEventListener(turboEvents.visit.name, async event => {
            lastUrlLoaded = event.detail.url;
            await handlePageEvents(turboEvents.visit.name, event, lastUrlLoaded);
        });
        document.documentElement.addEventListener(turboEvents.before_cache.name, async event => {
            lastUrlLoaded = document.URL;
            await handlePageEvents(turboEvents.visit.name, event, lastUrlLoaded);
        });
        document.documentElement.addEventListener(turboEvents.before_render.name, async event => {
            lastUrlLoaded = document.URL;
            let observer = new MutationObserver(async m => {
                if (relevantRootElementChildren(m[0].target).length > 0) return;
                observer.disconnect();
                observer = null;
                await handlePageEvents(turboEvents.before_render.name, event, lastUrlLoaded);
            });
            observer.observe(event.detail.newBody, {childList: true});
        });
        document.documentElement.addEventListener(turboEvents.load.name, async event => {
            lastUrlLoaded = event.detail.url;
            await handlePageEvents(turboEvents.load.name, event, lastUrlLoaded);
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
