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
>      - `false`: when the inputs were invalid.
>      - Note that in the "load" special case (explained below), a listener is not added, and this instead returns `true` or `false` depending on whether the callback was successfully fired immediately.
> - `remove_event_listener(eventName, listener, options)`
>    - returns: `boolean`
>      - `true`: when the listener was removed successfully.
>      - `false`: when the inputs were invalid or when no active listener matching the parameters is found.
> - `on`
>   - `common`
>      - Contains non-writable convenience functions for common use cases.
>      - For the return values of all except `events(eventList, callback, options)`, see `add_event_listener(eventName, listener, options)`
>      - `events(eventList, callback, options)`
>         - returns: `[]`
>           - Each entry contains an object with properties `name: string` and `added: boolean`, indicating the result of each item in `eventList`.
>      - `urls(callback, urls, options)`
>      - `targetIds(callback, targetIds, options)`
>      - `dashboard(callback, options)`
>      - `items_pages(callback, options)`
>      - `lessons(callback, options)`
>      - `lessons_picker(callback, options)`
>      - `lessons_quiz(callback, options)`
>      - `reviews(callback, options)`
>   - `event` (Frozen object)
>      - Contains functions to set listeners for each of the Turbo events.
>      - For the return values, see `add_event_listener(eventName, listener, options)`
>      - `before_cache(callback, urls, options)`
>      - `before_fetch_request(callback, urls, options)`
>      - `before_fetch_response(callback, urls, options)`
>      - `before_frame_render(callback, urls, options)`
>      - `before_morph_attribute(callback, urls, options)`
>      - `before_morph_element(callback, urls, options)`
>      - `before_prefetch(callback, urls, options)`
>      - `before_render(callback, urls, options)`
>      - `before_stream_render(callback, urls, options)`
>      - `before_visit(callback, urls, options)`
>      - `click(callback, urls, options)`
>      - `fetch_request_error(callback, urls, options)`
>      - `frame_load(callback, urls, options)`
>      - `frame_missing(callback, urls, options)`
>      - `frame_render(callback, urls, options)`
>      - `load(callback, urls, options)`
>      - `morph(callback, urls, options)`
>      - `morph_element(callback, urls, options)`
>      - `render(callback, urls, options)`
>      - `submit_end(callback, urls, options)`
>      - `submit_start(callback, urls, options)`
>      - `visit(callback, urls, options)`
> - `events` (Frozen object)
>   -  Each of these also has a `handler` property, which is used internally to handle the event. 
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
>   - `locations`: contains non-writable `RegExp` objects to match against the URLs for typical pages.
>      - `dashboard`
>      - `items_pages`
>      - `lessons`
>      - `lessons_picker`
>      - `lessons_quiz`
>      - `reviews`



### General notes



- The callback function is passed the arguments `(event, url)` for all Turbo events.
  - The `event` parameter is the event object, passed straight from the event triggered.
  - The `url` parameter is a URL string, which has been parsed from the event, using predetermined logic to detect the URL most likely of use to the end user. This URL is associated with the details of the triggered event, usually referencing the result of whatever action has transpired.
  - For the special case "load" event (discussed below), `event` contains the string "load" and `url` contains a string of the current page URL.
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
  - Adding a listener for that event via this library causes it to execute the callback immediately after it is added in the case that the URL matches and the "turbo:load" event has already fired.


#### The "options" parameter


All the events provided have an optional options parameter
that functions somewhat as an extension of the `AddEventListenerOptions`|`EventListenerOptions` parameters given to `EventTarget.addEventListener()`.
The following table is a full description of the options available.

|    Property    |                    Type                     | Supported | Description                                                                                                                                                                                                                                                                                                                                                                                     |
|:--------------:|:-------------------------------------------:|:---------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      urls      | `string \| RegExp \| Array<string\|RegExp>` |    yes    | The URLs to be verified against the URL parameter.<br/>If not specified, defaults to an empty `Array`.                                                                                                                                                                                                                                                                                          |
|   targetIds    |     `string \| string[] \| Set<string>`     |    yes    | The target IDs to be verified against the event target ID.<br/>If not specified, defaults to an empty `Set`.                                                                                                                                                                                                                                                                                    |
| useDocumentIds |                  `boolean`                  |    yes    | Indicates whether to check the IDs of the document element in addition to the event target for the targetIds.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                                                        |
|   noTimeout    |                  `boolean`                  |    yes    | Indicates whether to skip use of `setTimeout(callback,0)`, typically used to let the event settle before invoking the callback.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                                      |
|    nocache     |                  `boolean`                  |    yes    | Indicates whether to ignore events involving Turbo's cached pages. See https://discuss.hotwired.dev/t/before-cache-render-event/4928/4.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                              |
|      once      |                  `boolean`                  |    yes    | Indicates that the listener should be invoked at most once after being added. If `true`, the listener would be automatically removed when invoked.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                   |
|    capture     |                  `boolean`                  |    yes    | Indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.<br/>If not specified, defaults to `false`.                                                                                                                                                                                            |
|    passive     |                  `boolean`                  |    no     | If `true`, indicates that the function specified by listener will never call `preventDefault()`. If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning.<br/>If not specified, defaults to `false` – except that in browsers other than Safari, it defaults to `true` for wheel, mousewheel, touchstart and touchmove events. |
|     signal     |                `AbortSignal`                |    no     | The listener will be removed when the given AbortSignal object's `abort()` method is called.<br/>If not specified, no `AbortSignal` is associated with the listener.                                                                                                                                                                                                                            |



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
    // This example needs to run whenever the user is in a reviews session or lessons quiz. So this
    // example will use RegEx objects conviently provided by this library.
    const options = {
        urls: [
            wkof.turbo.common.locations.reviews,
            wkof.turbo.common.locations.lessons_quiz
        ]
    };

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
// Make sure the events are fully loaded before starting any configuration of this library.
wkof.ready('TurboEvents').then(configurePageHandler);

// The callback function is passed an event argument for all Turbo events. However, it is *not*
// provided for the special case of the aforementioned "load" event.
function myFunction(event, url) {
    console.log(`myFunction() has run for event "${event?.type ?? 'load'}" with url ${url}`);
}

function configurePageHandler() {
    // Run the callback on "turbo:click" on any page.
    wkof.turbo.on.event.click(myFunction);

    const options1 = {
        // Run the callback on the dashboard and on individual radical, kanji, or vocab pages.
        urls: [wkof.turbo.common.locations.dashboard, wkof.turbo.common.locations.items_pages]
    };
    // Run the callback on the "turbo:before-render" event.
    wkof.turbo.on.event.before_render(myFunction, options1);

    // Run the callback on initial page load, turbo:before-render, and turbo:frame_render.
    // See the special case note about "load" in the preceding section.
    let eventList = ['load', wkof.turbo.events.before_render, wkof.turbo.events.frame_render];
    const options2 = {
        // Run the callback on the lessons picker page.
        urls: wkof.turbo.common.locations.lessons_picker,
        // Automatically remove the event after firing once
        once: true
    };
    // The first parameter can be an array including either the Turbo event object that is provided
    // (wkof.turbo.events.before_render) or the string itself ("turbo:before-render").
    // Note that two new listeners are added in this example, one for each **Turbo** event.
    wkof.turbo.on.common.events(eventList, myFunction, options2);

    // Remove listeners by using `wkof.turbo.remove_event_listener(eventName, listener, options)`.
    // In this scenario, the result would presumably be [false, true, true], since the "load" event
    // does not create a listener. However, if a "turbo:before-render" or "turbo:frame-render"
    // event has fired between creating the listener and making the following call, the respective
    // loop condition or conditions would also return false because the listener or listeners would
    // have already been removed due to using the `once: true` option during creation.
    eventList.forEach(eventName => {
        // The callback and options must both match the existing listener or the removal will fail. 
        // Callback must be reference equal, but the options can just have equivalent values.
        let equivalentOptions = {urls: wkof.turbo.common.locations.lessons_picker, once: true};
        wkof.turbo.remove_event_listener(eventName, myFunction, equivalentOptions);
    });

    const options3 = {
        // Automatically remove the event after firing once.
        once: true,
        // Ignore events for Turbo's cached version of pages.
        nocache: true,
        // Disable the built-in feature that slightly delays the callback execution until the event
        // has finished firing, which is done essentially via `setTimeout(callback, 0)`.
        noTimeout: true
    };
    // The `urls` option is not set, so this will run on the `visit` event for every page.
    // However, since `once: true` is set, it will be removed after first execution.
    wkof.turbo.add_event_listener(wkof.turbo.events.visit, myFunction, options3);
    // Or, it can be removed immediately.
    wkof.turbo.remove_event_listener(wkof.turbo.events.visit, myFunction, options3);

    // Listener is still active from the `wkof.turbo.on.event.click(myFunction)` invocation.

    // Add a listener for all turbo events on any URL.
    // `Object.entries(wkof.turbo.events)` or `Object.values(wkof.turbo.events)` function the same.
    eventList = wkof.turbo.events;
    wkof.turbo.on.common.events(eventList, myFunction);
}
```
