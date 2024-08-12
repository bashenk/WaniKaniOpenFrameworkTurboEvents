# Wanikani Open Framework Turbo Events





## Library script for browser development




This is a library script
that adds helpful methods to [WaniKani Open Framework](https://community.wanikani.com/t/x/22231)
for dealing with [Turbo Events](https://turbo.hotwired.dev/reference/events).  
Scripts developers can use this library to simplify their workflow.

All additions are added to a new `turbo` property of the `wkof` object, thus accessible via `wkof.turbo`.




---



### The `wkof.turbo` object



The `wkof.turbo` object has the following properties and methods
(methods are all non-writable; properties are all non-writable and extensible unless noted otherwise):

- #### add_event_listener(eventName, listener, options): `boolean`

    - The most simple way of adding a listener.
    - Returns `true` when the listener was successfully added or `false` when the inputs were invalid or the provided listener and options already exists.
        - Note that in the "load" [special case (explained below)](#special-cases), a listener is not added, and this instead returns `true` or `false` according to whether the callback was called immediately.

- #### add_typical_page_listener(callback, urls, options): `boolean`

    - Merges the provided `urls` into the `options` parameter.
    - Under the hood, this also silently uses the "load" [special case](#special-cases) event to ensure that the callback is called at least once upon the first page load.
    - See: [add_event_listener(eventName, listener, options)](#add_event_listenereventname-listener-options-boolean).

- #### add_typical_frame_listener(callback, targetIds, options): `boolean`

    - Merges the provided `targetIds` into the `options` parameter.
    - Under the hood, this also silently uses the "load" [special case](#special-cases) event to ensure that the callback is called at least once upon the first page load.
    - See: [add_event_listener(eventName, listener, options)](#add_event_listenereventname-listener-options-boolean).

- #### remove_event_listener(eventName, listener, options): `boolean`

    - Returns `true` when the listener was successfully removed or `false` when the inputs were invalid or when no active listener matching the parameters was found.

- #### on: `object`

    - #### common: `object`

        - Contains non-writable convenience functions for common use cases.
        - Note that the object itself is extensible, so additional functions may be added if desired.
        - ~~`events(eventList, callback, options)`~~ Deprecated. Use [eventList(eventList, callback, options)](#eventlisteventlist-callback-options-name-string-added-boolean).

        - #### eventList(eventList, callback, options): `{name: string, added: boolean}[]`

            - Each returned object's `name` is the name of the event and `added` indicates the result of the [add_event_listener](#add_event_listenereventname-listener-options-boolean) operation for that listener.

        - #### targetIds(callback, targetIds, options): `boolean`

            - Callback is triggered whenever a frame is loaded with an element `id` that matches one of the provided `targetIds`.
            - Convenience function for [add_typical_frame_listener(callback, targetIds, options)](#add_typical_frame_listenercallback-targetids-options-boolean).

        - #### urls(callback, urls, options): `boolean`

            - Callback is triggered whenever the user visits any of the URLs provided and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, urls, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### dashboard(callback, options): `boolean`

            - Callback is triggered whenever the user visits the "dashboard" and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, wkof.turbo.common.locations.dashboard, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### items_pages(callback, options): `boolean`

            - Callback is triggered whenever the user visits the page for any of the specific items (radical, kanji, vocab) and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, wkof.turbo.common.locations.items_pages, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### lessons(callback, options): `boolean`

            - Callback is triggered whenever the user visits the "lessons" page and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, wkof.turbo.common.locations.lessons, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### lessons_picker(callback, options): `boolean`

            - Callback is triggered whenever the user visits the "lessons" picker page and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, wkof.turbo.common.locations.lessons_picker, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### lessons_quiz(callback, options): `boolean`

            - Callback is triggered whenever the user begins the "lessons" quiz page and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, wkof.turbo.common.locations.lessons_quiz, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### reviews(callback, options): `boolean`

            - Callback is triggered whenever the user visits the "reviews" page and the page has fully loaded.
            - Convenience function for [add_typical_page_listener(callback, wkof.turbo.common.locations.reviews, options)](#add_typical_page_listenercallback-urls-options-boolean).

    - #### ~~event~~: `object`

        - Deprecated. Use the `addListener` method in the [events](#events-object) object.
        - ~~Contains functions to set listeners for each of the Turbo events. For the return values, see `add_event_listener(eventName, listener, options)`~~
        - ~~`before_cache(callback, options)`~~
        - ~~`before_fetch_request(callback, options)`~~
        - ~~`before_fetch_response(callback, options)`~~
        - ~~`before_frame_render(callback, options)`~~
        - ~~`before_morph_attribute(callback, options)`~~
        - ~~`before_morph_element(callback, options)`~~
        - ~~`before_prefetch(callback, options)`~~
        - ~~`before_render(callback, options)`~~
        - ~~`before_stream_render(callback, options)`~~
        - ~~`before_visit(callback, options)`~~
        - ~~`click(callback, options)`~~
        - ~~`fetch_request_error(callback, options)`~~
        - ~~`frame_load(callback, options)`~~
        - ~~`frame_missing(callback, options)`~~
        - ~~`frame_render(callback, options)`~~
        - ~~`load(callback, options)`~~
        - ~~`morph(callback, options)`~~
        - ~~`morph_element(callback, options)`~~
        - ~~`render(callback, options)`~~
        - ~~`submit_end(callback, options)`~~
        - ~~`submit_start(callback, options)`~~
        - ~~`visit(callback, options)`~~

- #### events: `object`

    - Each of the following keys is also accessible using the `turbo:` syntax that matches the `name` property (e.g. `wkof.turbo.events['turbo:before-render']`).

    - #### click: `object`

        - `source`: "document"
        - `name`: "turbo:click"
        - `addListener(callback, options)`: `boolean`

    - #### before_visit: `object`

        - `source`: "document"
        - `name`: "turbo:before-visit"
        - `addListener(callback, options)`: `boolean`

    - #### visit: `object`

        - `source`: "document"
        - `name`: "turbo:visit"
        - `addListener(callback, options)`: `boolean`

    - #### before_cache: `object`

        - `source`: "document"
        - `name`: "turbo:before-cache"
        - `addListener(callback, options)`: `boolean`

    - #### before_render: `object`

        - `source`: "document"
        - `name`: "turbo:before-render"
        - `addListener(callback, options)`: `boolean`

    - #### render: `object`

        - `source`: "document"
        - `name`: "turbo:render"
        - `addListener(callback, options)`: `boolean`

    - #### load: `object`

        - `source`: "document"
        - `name`: "turbo:load"
        - `addListener(callback, options)`: `boolean`

    - #### morph: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:morph"
        - `addListener(callback, options)`: `boolean`

    - #### before_morph_element: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:before-morph-element"
        - `addListener(callback, options)`: `boolean`

    - #### before_morph_attribute: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:before-morph-attribute"
        - `addListener(callback, options)`: `boolean`

    - #### morph_element: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:morph-element"
        - `addListener(callback, options)`: `boolean`

    - #### submit_start: `object`

        - `source`: "forms"
        - `name`: "turbo:submit-start"
        - `addListener(callback, options)`: `boolean`

    - #### submit_end: `object`

        - `source`: "forms"
        - `name`: "turbo:submit-end"
        - `addListener(callback, options)`: `boolean`

    - #### before_frame_render: `object`

        - `source`: "frames"
        - `name`: "turbo:before-frame-render"
        - `addListener(callback, options)`: `boolean`

    - #### frame_render: `object`

        - `source`: "frames"
        - `name`: "turbo:frame-render"
        - `addListener(callback, options)`: `boolean`

    - #### frame_load: `object`

        - `source`: "frames"
        - `name`: "turbo:frame-load"
        - `addListener(callback, options)`: `boolean`

    - #### frame_missing: `object`

        - `source`: "frames"
        - `name`: "turbo:frame-missing"
        - `addListener(callback, options)`: `boolean`

    - #### before_stream_render: `object`

        - `source`: "streams"
        - `name`: "turbo:before-stream-render"
        - `addListener(callback, options)`: `boolean`

    - #### before_fetch_request: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:before-fetch-request"
        - `addListener(callback, options)`: `boolean`

    - #### before_fetch_response: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:before-fetch-response"
        - `addListener(callback, options)`: `boolean`

    - #### before_prefetch: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:before-prefetch"
        - `addListener(callback, options)`: `boolean`

    - #### fetch_request_error: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:fetch-request-error"
        - `addListener(callback, options)`: `boolean`

- #### common: `object`

    - #### locations: `object`

        - Contains non-writable `RegExp` objects to match against the URLs for typical pages.

        - #### dashboard: `RegExp`

            - `/^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/`

        - #### items_pages: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/(radicals|kanji|vocabulary)\/.+\/?$/`

        - #### lessons: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subject-lessons\/(start|[\d-]+\/\d+)\/?$/`

        - #### lessons_picker: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subject-lessons\/picker\/?$/`

        - #### lessons_quiz: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subject-lessons\/[\d-]+\/quiz.*\/?$/`

        - #### reviews: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/`



---


### General notes



- The callback function is invoked with the parameters `(event: CustomEvent, url: string)` for all events.
    - The `event` parameter is the `CustomEvent` object, passed directly from the triggered event.
        - The name of the event triggered can be verified using `event.type`.
            - For example, `event.type === 'turbo:load'`.
    - The `url` parameter is a URL string, which has been parsed from the event, using predetermined logic to detect the URL most likely of use to the end user. **This URL is associated with the details of the triggered event**, usually **referencing the result or target** of whatever action has transpired or is preparing to transpire.
    - For the [special case](#special-cases) "load" event, `event.type` is "load" and `url` contains a string of the current page URL.
- **Always** set the `@match` userscript directive to `https://www.wanikani.com/*` or equivalent.
    - Otherwise, the script may not end up running if the user refreshes the page somewhere unexpected.
- Most of the convenience functions in [wkof.turbo.on.common](#common-object) utilize the custom "load" event.
    - Specifically, the following functions match this behavior:
        - `urls`, `dashboard`, `items_pages`, `lessons`, `lessons_picker`, `lessons_quiz`, `reviews`

Typical usage involves one of the following:
1. Use one of the convenience functions in [wkof.turbo.on.common](#common-object) if one meets requirements.
2. Pass one or more URLs to the `addListener(callback, options)` method of the specific `TurboEvent` object in [wkof.turbo.events](#events-object) that will be used.
    - URLs can be passed using a `urls` property in the object passed to the `options` parameter
        - For example, `{urls: myUrl}` or `{urls: [myUrl1, myUrl2]}`
    - Inputs for the urls property can be a `string`, a `RegExp`, or an `Array` or `Set` consisting of a mixture of those.
    - For example, `wkof.turbo.events.before_render.addListener(callback, {urls: 'https://www.wanikani.com/level/*'})`.


#### Special cases


- "load" (not to be confused with "turbo:load") is a special use case event name.
    - Adding a listener for that event via this library causes it to execute the callback immediately after it is added in the case that the URL matches and the page has already finished loading, according to the `window.Turbo` session.
    - Callback:
        - Parameters: `(event: CustomEvent, url: string) => void`.
        - The `event` parameter is a `CustomEvent` constructed as follows:
            - `new CustomEvent('load', {bubbles: false, cancelable: false, composed: false, target: document.documentElement})`.
        - The `url` parameter is a URL `string` of the current location, according to the `window.Turbo` session.


#### The "options" parameter


All the events provided have an optional options parameter
that functions somewhat as an extension of the `AddEventListenerOptions`|`EventListenerOptions` parameters given to `EventTarget.addEventListener()`.
The following table is a full description of the options available.

|    Property    |                                  Type                                   | Supported | Description                                                                                                                                                                                                                                                                                                                                                                                     |
|:--------------:|:-----------------------------------------------------------------------:|:---------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      urls      |  `string` \| `RegExp` \| `(string\|RegExp)[]` \| `Set<string\|RegExp>`  |    yes    | The URLs to be verified against the URL parameter.<br/>If not specified, defaults to an empty `Array`.                                                                                                                                                                                                                                                                                          |
|   targetIds    | `string` \| `string[]` \| `Set<string>` \|<br>`Object.<string,boolean>` |    yes    | The target IDs to be verified against the event target ID.<br/>If not specified, defaults to an empty `Set`.                                                                                                                                                                                                                                                                                    |
| useDocumentIds |                                `boolean`                                |    yes    | Indicates whether to check the IDs of the document element in addition to the event target for the targetIds.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                                                        |
|   noTimeout    |                                `boolean`                                |    yes    | Indicates whether to skip use of `setTimeout(callback,0)`, typically used to let the event settle before invoking the callback.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                                      |
|    nocache     |                                `boolean`                                |    yes    | Indicates whether to ignore events involving Turbo's cached pages. See https://discuss.hotwired.dev/t/before-cache-render-event/4928/4.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                              |
|      once      |                                `boolean`                                |    yes    | Indicates that the listener should be invoked at most once after being added. If `true`, the listener would be automatically removed when invoked.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                   |
|    capture     |                                `boolean`                                |    yes    | Indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.<br/>If not specified, defaults to `false`.                                                                                                                                                                                            |
|    passive     |                                `boolean`                                |    yes    | If `true`, indicates that the function specified by listener will never call `preventDefault()`. If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning.<br/>If not specified, defaults to `false` – except that in browsers other than Safari, it defaults to `true` for wheel, mousewheel, touchstart and touchmove events. |
|     signal     |                              `AbortSignal`                              |    yes    | The listener will be removed when the given `AbortSignal` object's `abort()` method is called.<br/>If not specified, no `AbortSignal` is associated with the listener.                                                                                                                                                                                                                          |



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
    wkof.turbo.on.common.eventList(eventList, main, options);
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
    wkof.turbo.events.before_render.addListener(myFunction, options1);

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
    wkof.turbo.on.common.eventList(eventList, myFunction, options2);

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
