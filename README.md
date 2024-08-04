# Wanikani Open Framework Turbo Events





## Library script for browser development




This is a library script
that adds helpful methods to [WaniKani Open Framework](https://community.wanikani.com/t/x/22231)
for dealing with [Turbo Events](https://turbo.hotwired.dev/reference/events).  
Scripts developers can use this library to simplify their workflow.

All additions are added to a new `turbo` property of the `wkof` object, thus accessible via `wkof.turbo`.




### The exposed `wkof.turbo` object



The `wkof.turbo` object has the following properties and methods:

> - `add_event_listener(eventName, listener, options)`
>   - returns: `boolean`
>      - `true`: when the listener was successfully added.
>          - Note that in the "load" special case, this currently returns `true` despite not adding a listener.
>      - `false`: when the inputs were invalid.
> - `remove_event_listener(eventName, listener, options)`
>    - returns: `boolean`
>      - `true`: when the listener was removed successfully.
>      - `false`: when the inputs were invalid or when no active listener matching the parameters is found.
> - `on`
>   - `common`: contains convenience functions for common use cases.
>      - `events(eventList, callback, options)`
>      - `urls(callback, urls)`
>      - `dashboard(callback)`
>      - `items_pages(callback)`
>      - `lessons(callback)`
>      - `lessons_picker(callback)`
>      - `lessons_quiz(callback)`
>      - `reviews(callback)`
>   - `event`: contains functions to set listeners for each of the turbo events.
>      - `click(callback, urls, options)`
>      - `before_visit(callback, urls, options)`
>      - `visit(callback, urls, options)`
>      - `before_cache(callback, urls, options)`
>      - `before_render(callback, urls, options)`
>      - `render(callback, urls, options)`
>      - `load(callback, urls, options)`
>      - `morph(callback, urls, options)`
>      - `before_morph_element(callback, urls, options)`
>      - `before_morph_attribute(callback, urls, options)`
>      - `morph_element(callback, urls, options)`
>      - `submit_start(callback, urls, options)`
>      - `submit_end(callback, urls, options)`
>      - `before_frame_render(callback, urls, options)`
>      - `frame_render(callback, urls, options)`
>      - `frame_load(callback, urls, options)`
>      - `frame_missing(callback, urls, options)`
>      - `before_stream_render(callback, urls, options)`
>      - `before_fetch_request(callback, urls, options)`
>      - `before_fetch_response(callback, urls, options)`
>      - `before_prefetch(callback, urls, options)`
>      - `fetch_request_error(callback, urls, options)`
> - `events`
>   - `click`
>      - `source: 'document'`
>      - `name: 'turbo:click'`
>   - `before_visit`
>      - `source: 'document'`
>      - `name: 'turbo:before-visit'`
>   - `visit`
>      - `source: 'document'`
>      - `name: 'turbo:visit'`
>   - `before_cache`
>      - `source: 'document'`
>      - `name: 'turbo:before-cache'`
>   - `before_render`
>      - `source: 'document'`
>      - `name: 'turbo:before-render'`
>   - `render`
>      - `source: 'document'`
>      - `name: 'turbo:render'`
>   - `load`
>      - `source: 'document'`
>      - `name: 'turbo:load'`
>   - `morph`
>      - `source: 'pageRefresh'`
>      - `name: 'turbo:morph'`
>   - `before_morph_element`
>      - `source: 'pageRefresh'`
>      - `name: 'turbo:before-morph-element'`
>   - `before_morph_attribute`
>      - `source: 'pageRefresh'`
>      - `name: 'turbo:before-morph-attribute'`
>   - `morph_element`
>      - `source: 'pageRefresh'`
>      - `name: 'turbo:morph-element'`
>   - `submit_start`
>      - `source: 'forms'`
>      - `name: 'turbo:submit-start'`
>   - `submit_end`
>      - `source: 'forms'`
>      - `name: 'turbo:submit-end'`
>   - `before_frame_render`
>      - `source: 'frames'`
>      - `name: 'turbo:before-frame-render'`
>   - `frame_render`
>      - `source: 'frames'`
>      - `name: 'turbo:frame-render'`
>   - `frame_load`
>      - `source: 'frames'`
>      - `name: 'turbo:frame-load'`
>   - `frame_missing`
>      - `source: 'frames'`
>      - `name: 'turbo:frame-missing'`
>   - `before_stream_render`
>      - `source: 'streams'`
>      - `name: 'turbo:before-stream-render'`
>   - `before_fetch_request`
>      - `source: 'httpRequests'`
>      - `name: 'turbo:before-fetch-request'`
>   - `before_fetch_response`
>      - `source: 'httpRequests'`
>      - `name: 'turbo:before-fetch-response'`
>   - `before_prefetch`
>      - `source: 'httpRequests'`
>      - `name: 'turbo:before-prefetch'`
>   - `fetch_request_error`
>      - `source: 'httpRequests'`
>      - `name: 'turbo:fetch-request-error'`
> - `common`
>   - `locations`: contains `RegExp` objects to match against the URLs for typical pages.
>      - `dashboard`
>      - `items_pages`
>      - `lessons`
>      - `lessons_picker`
>      - `lessons_quiz`
>      - `reviews`



### General notes



- **Always** set the `@match` userscript directive to `https://www.wanikani.com/*` or equivalent.
    - Otherwise, the script may not end up running if the user refreshes the page somewhere unexpected.

Typical usage involves one of the following:
1. Use one of the convenience functions in `wkof.turbo.on.common` if one meets your requirements.
2. Pass one or more URLs to the method in `wkof.turbo.on.event` that will be used. 
   - URLs can be passed using a `urls` property in the object passed to the `options` parameter
     - For example, `{urls: myUrl}` or `{urls: [myUrl1, myUrl2]}`
   - Inputs for the urls property can be a `string`, a `RegExp`, or an array consisting of a mixture of those.


#### Special cases


- "load" (not to be confused with "turbo:load") is a special use case event name.
  - Adding a listener for that event via this library causes it to execute the callback immediately after it is added  
    in the case that the URL matches and the "turbo:load" event has already fired.



### Example usage



#### Basic/minimal script configuration


```javascript
// ==UserScript==
// @name         Wanikani Something Special
// @namespace    https://www.youtube.com/watch?v=dQw4w9WgXcQ
// @version      1.0.0
// @description  Does something special
// @author       You Know
// @match        https://www.wanikani.com/*
// @grant        none
// @license      MIT
// ==/UserScript==
if (!window.wkof) {
  if (confirm(`${script_name} requires Wanikani Open Framework.\nDo you want to be forwarded to the installation instructions?`))
    window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
  return;
}

// This script needs to run whenever the user is on the dashboard.
wkof.ready('TurboEvents').then(() => wkof.turbo.on.common.dashboard(main));

function main() {
    // start of main script
}
```


#### Standard script inclusion using manual configuration

```javascript
// ==UserScript==
// @name         Wanikani Something Special
// @namespace    https://www.youtube.com/watch?v=dQw4w9WgXcQ
// @version      1.0.0
// @description  Does something special
// @author       You Know
// @match        https://www.wanikani.com/*
// @grant        none
// @license      MIT
// ==/UserScript==
if (!window.wkof) {
    if (confirm(`${script_name} requires Wanikani Open Framework.\nDo you want to be forwarded to the installation instructions?`))
        window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
    return;
}
wkof.ready('TurboEvents').then(configureTurbo);

function configureTurbo() {
    // This script needs to run whenever the user is in a reviews session
    const reviewsRegex = /^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/;
    const options = {urls: reviewsRegex};

    // These are the events most often of use for general purpose scripts
    // See the special case note about 'load' in the preceding section.
    const eventList = ['load', wkof.turbo.events.load];

    // Setup the listener
    wkof.turbo.on.common.events(eventList, main, options);
}

function main() {
    // start of main script
}
```


#### Various different methods of creating and removing listeners

```javascript
// Make sure the events are fully loaded before starting your configuration.
wkof.ready('TurboEvents').then(configurePageHandler);

// The callback function can accept an event argument, which is provided in the callback for all
// turbo events. That is, it is *not* provided for the special case of the aforementioned "load" event.
function callbackFunction(event) {
    console.log(`callbackFunction() has run for event "${event?.type ?? 'load'}"`);
}

const reviewsRegex = /^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/;
const dashboardRegex = /^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/;

function configurePageHandler() {
    // Run the callback on "turbo:click" on any page.
    wkof.turbo.on.event.click(callbackFunction);

    const options1 = {
        // Run the callback only on the dashboard and reviews pages.
        urls: [dashboardRegex, reviewsRegex]
    };
    // Run the callback on the "turbo:before-render" event
    const onBeforeRender = wkof.turbo.on.event.before_render(callbackFunction, options1);

    // Run the callback on initial page load and turbo:before-render
    // See the special case note about "load" in the preceding section.
    let eventList = ['load', wkof.turbo.events.before_render];
    const options2 = {
        urls: dashboardRegex, // Run the callback only on the dashboard.
        once: true // Automatically remove the event after firing once
    };
    // The first parameter can be an array including either the turbo event object that's provided
    // (wkof.turbo.events.before_render) or the string itself ("turbo:before-render").
    // Note that two new listeners are added in this example, one for each event.
    const onLoadAndBeforeRender = wkof.turbo.on.common.events(eventList, callbackFunction, options2);

    // If desired, remove listeners by using the method in the wkof.turbo object.
    eventList.forEach(eventName => {
        wkof.turbo.remove_event_listener(eventName, callbackFunction, options2);
    });

    wkof.turbo.remove_event_listener(wkof.turbo.events.before_render, callbackFunction);

    // Can also use the generic `add_event_listener` method to add/remove listeners with more
    // fine-tuned control.

    const options3 = {
        once: true, // Automatically remove the event after firing once
        nocache: true, // Ignore events for cached pages
        noTimeout: true // Don't use the built-in feature that executes setTimeout delay execution 
                        // of the callback until the event has finished firing  
    };
    const visitHandler = wkof.turbo.add_event_listener(wkof.turbo.events.visit, callbackFunction, options3)
    wkof.turbo.remove_event_listener(wkof.turbo.events.visit, callbackFunction, options3);

    // Listener is still active from the `wkof.turbo.on.event.click(callbackFunction)` invocation.
}
```
