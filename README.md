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

- #### add\_event\_listener(eventName, listener, options): `boolean`

    - The most simple way of adding a listener.
    - Returns `true` when the listener was successfully added or `false` when the inputs were invalid or the provided listener and options already exists.
        - Note that in the "load" [special case (explained below)](#special-cases), a listener is not added, and this instead returns `true` or `false` according to whether the listener was called immediately.

- #### add\_event\_listeners(eventList, listener, options): `{name: string, added: boolean}[]`

    - Each returned object's `name` is the name of the event and `added` indicates the result of the [wkof.turbo.add\_event\_listener(name, listener, options)](#add_event_listenereventname-listener-options-boolean) operation for that listener.
    - Added in version 4.1.1.

- #### add\_typical\_page\_listener(listener, urls, options): `boolean`

    - Merges the provided `urls` into the `options` parameter.
    - Under the hood, this also silently uses the "load" [special case](#special-cases) event to ensure that the listener is called at least once upon the first page load.
    - See: [wkof.turbo.add\_event\_listener(eventName, listener, options)](#add_event_listenereventname-listener-options-boolean).

- #### add\_typical\_frame\_listener(listener, targetIds, options): `boolean`

    - Merges the provided `targetIds` into the `options` parameter.
    - See: [wkof.turbo.add\_event\_listener(eventName, listener, options)](#add_event_listenereventname-listener-options-boolean).

- #### remove\_event\_listener(eventName, listener, options): `boolean`

    - Returns `true` when the listener was successfully removed or `false` when the inputs were invalid or when no active listener matching the parameters was found.

- #### remove\_event\_listeners(eventList, listener, options): `{name: string, removed: boolean}[]`

    - Each returned object's `name` is the name of the event and `removed` indicates the result of the [wkof.turbo.remove\_event\_listener(name, listener, options)](#remove_event_listenereventName-listener-options-boolean) operation for that listener.

- #### on: `object`

    - #### common: `object`

        - Contains non-writable convenience functions for common use cases.
        - Note that the object itself is extensible, so additional functions may be added if desired.
        - #### ~~events(eventList, listener, options)~~
 
            - Deprecated. Use [wkof.turbo.add\_event\_listeners(eventList, listener, options)](#add_event_listenerseventList-listener-options-name-string-added-boolean).

        - #### ~~eventList(eventList, listener, options): `{name: string, added: boolean}[]`~~

            - Deprecated. Use [wkof.turbo.add\_event\_listeners(eventList, listener, options)](#add_event_listenerseventList-listener-options-name-string-added-boolean).

        - #### targetIds(listener, targetIds, options): `boolean`

            - The listener is triggered whenever a frame is loaded with an element `id` that matches one of the provided `targetIds`.
            - Convenience function for [wkof.turbo.add\_typical\_frame\_listener(listener, targetIds, options)](#add_typical_frame_listenercallback-targetids-options-boolean).

        - #### urls(listener, urls, options): `boolean`

            - The listener is triggered whenever the user visits any of the URLs provided and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, urls, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### dashboard(listener, options): `boolean`

            - The listener is triggered whenever the user visits the "dashboard" and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, wkof.turbo.common.locations.dashboard, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### items\_pages(listener, options): `boolean`

            - The listener is triggered whenever the user visits the page for any of the specific items (radical, kanji, vocab) and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, wkof.turbo.common.locations.items\_pages, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### lessons(listener, options): `boolean`

            - The listener is triggered whenever the user visits the "lessons" page and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, wkof.turbo.common.locations.lessons, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### lessons\_picker(listener, options): `boolean`

            - The listener is triggered whenever the user visits the "lessons picker" page and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, wkof.turbo.common.locations.lessons\_picker, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### lessons\_quiz(listener, options): `boolean`

            - The listener is triggered whenever the user begins the "lessons quiz" page and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, wkof.turbo.common.locations.lessons\_quiz, options)](#add_typical_page_listenercallback-urls-options-boolean).

        - #### reviews(listener, options): `boolean`

            - The listener is triggered whenever the user visits the "reviews" page and the page has fully loaded.
            - Convenience function for [wkof.turbo.add\_typical\_page\_listener(listener, wkof.turbo.common.locations.reviews, options)](#add_typical_page_listenercallback-urls-options-boolean).

    - #### ~~event~~: `object`

        - Deprecated. Use the `addListener` method in the [wkof.turbo.events](#events-object) object.
        - ~~Contains functions to set listeners for each of the Turbo events. For the return values, see `add_event_listener(eventName, listener, options)`~~
        - ~~`before_cache(listener, options)`~~
        - ~~`before_fetch_request(listener, options)`~~
        - ~~`before_fetch_response(listener, options)`~~
        - ~~`before_frame_render(listener, options)`~~
        - ~~`before_morph_attribute(listener, options)`~~
        - ~~`before_morph_element(listener, options)`~~
        - ~~`before_prefetch(listener, options)`~~
        - ~~`before_render(listener, options)`~~
        - ~~`before_stream_render(listener, options)`~~
        - ~~`before_visit(listener, options)`~~
        - ~~`click(listener, options)`~~
        - ~~`fetch_request_error(listener, options)`~~
        - ~~`frame_load(listener, options)`~~
        - ~~`frame_missing(listener, options)`~~
        - ~~`frame_render(listener, options)`~~
        - ~~`load(listener, options)`~~
        - ~~`morph(listener, options)`~~
        - ~~`morph_element(listener, options)`~~
        - ~~`render(listener, options)`~~
        - ~~`submit_end(listener, options)`~~
        - ~~`submit_start(listener, options)`~~
        - ~~`visit(listener, options)`~~

- #### events: `object`

    - Each of the following keys is also accessible using the `turbo:` syntax that matches the `name` property (e.g. `wkof.turbo.events['turbo:before-render']`).

    - #### click: `object`

        - `source`: "document"
        - `name`: "turbo:click"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_visit: `object`

        - `source`: "document"
        - `name`: "turbo:before-visit"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### visit: `object`

        - `source`: "document"
        - `name`: "turbo:visit"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_cache: `object`

        - `source`: "document"
        - `name`: "turbo:before-cache"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_render: `object`

        - `source`: "document"
        - `name`: "turbo:before-render"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### render: `object`

        - `source`: "document"
        - `name`: "turbo:render"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### load: `object`

        - `source`: "document"
        - `name`: "turbo:load"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### morph: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:morph"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_morph\_element: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:before-morph-element"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_morph\_attribute: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:before-morph-attribute"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### morph\_element: `object`

        - `source`: "pageRefresh"
        - `name`: "turbo:morph-element"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### submit\_start: `object`

        - `source`: "forms"
        - `name`: "turbo:submit-start"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### submit\_end: `object`

        - `source`: "forms"
        - `name`: "turbo:submit-end"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_frame\_render: `object`

        - `source`: "frames"
        - `name`: "turbo:before-frame-render"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### frame\_render: `object`

        - `source`: "frames"
        - `name`: "turbo:frame-render"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### frame\_load: `object`

        - `source`: "frames"
        - `name`: "turbo:frame-load"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### frame\_missing: `object`

        - `source`: "frames"
        - `name`: "turbo:frame-missing"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_stream\_render: `object`

        - `source`: "streams"
        - `name`: "turbo:before-stream-render"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_fetch\_request: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:before-fetch-request"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_fetch\_response: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:before-fetch-response"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### before\_prefetch: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:before-prefetch"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

    - #### fetch\_request\_error: `object`

        - `source`: "httpRequests"
        - `name`: "turbo:fetch-request-error"
        - **addListener(listener, options)**: `boolean`
        - **removeListener(listener, options)**: `boolean`

- #### common: `object`

    - #### locations: `object`

        - Contains non-writable `RegExp` objects to match against the URLs for typical pages.

        - #### dashboard: `RegExp`

            - `/^https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/`

        - #### items\_pages: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/(radicals|kanji|vocabulary)\/.+\/?$/`

        - #### lessons: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subject-lessons\/(start|[\d-]+\/\d+)\/?$/`

        - #### lessons\_picker: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subject-lessons\/picker\/?$/`

        - #### lessons\_quiz: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subject-lessons\/[\d-]+\/quiz.*\/?$/`

        - #### reviews: `RegExp`

            - `/^https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/`



---


### General notes



- The listener (also known as the "callback function") is invoked with the parameters `(event: CustomEvent, url: URL)` for all events.
    - The `event` parameter is the [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) object, passed directly from the triggered event.
        - The name of the event triggered can be verified using `event.type`.
            - For example, `event.type === 'turbo:load'`.
    - The `url` parameter is a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), which has been parsed from the event, using predetermined logic to detect the URL most likely of use to the end user. **This URL is associated with the details of the triggered event**, usually **referencing the result or target** of whatever action has transpired or is preparing to transpire.
    - For the [special case](#special-cases) "load" event, `event.type` is "load" and `url` is the current page URL.
- **Always** set the `@match` userscript directive to `https://www.wanikani.com/*` or equivalent.
    - Otherwise, the script may not end up running if the user refreshes the page somewhere unexpected.
- Most of the convenience functions in [wkof.turbo.on.common](#common-object) utilize the custom "load" event.
    - Specifically, the following functions match this behavior:
        - `urls`, `dashboard`, `items_pages`, `lessons`, `lessons_picker`, `lessons_quiz`, `reviews`

Typical usage involves one of the following:
1. Use one of the convenience functions in [wkof.turbo.on.common](#common-object) if one meets requirements.
2. Pass one or more URLs to the `addListener(listener, options)` method of the specific `TurboEvent` object in [wkof.turbo.events](#events-object) that will be used.
    - URLs can be passed using a `urls` property in the object passed to the `options` parameter
        - For example, `{urls: myUrl}` or `{urls: [myUrl1, myUrl2]}`
    - Inputs for the urls property can be a `string`, a `RegExp`, or an `Array` or `Set` consisting of a mixture of those.
    - For example, `wkof.turbo.events.before_render.addListener(listener, {urls: 'https://www.wanikani.com/level/*'})`.


#### Special cases


- "load" (not to be confused with "turbo:load") is a special use case event name.
    - Adding an event listener for that event via this library causes it to execute the passed `listener` immediately after it is added in the case that the `options` match and the page has already finished loading, according to the `window.Turbo` session.
    - The callback delivered to the listener:
        - Parameters: `(event: CustomEvent, url: string) => void`.
        - The `event` parameter is a `CustomEvent` constructed as follows:
            - `new CustomEvent('load', {bubbles: false, cancelable: false, composed: false, target: document.documentElement})`.
        - The `url` parameter is a URL `string` of the current location, according to the `window.Turbo` session.


#### The "options" parameter


All the events provided have an optional options parameter
that functions as an extension of the `AddEventListenerOptions`|`EventListenerOptions` parameters
given to [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
The following table is a full description of the options available.

|    Property    |                        Type (accepted input values)                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|:--------------:|:---------------------------------------------------------------------------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      urls      |    `string`​｜​`RegExp`​｜​`(string﻿｜﻿RegExp)[]`​｜​`Set<string﻿｜﻿RegExp>`     | The URLs to be verified against the URL parameter. Values provided will be coerced into `RegExp` objects.<br/>If not specified, the listener runs on any URL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|   targetIds    |       `string`​｜​`string[]`​｜​`Set<string>`​｜​`Object﻿.<string﻿,﻿*>`        | The target IDs to be verified against the event target ID.<br/>If not specified, the listener runs for any event target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| useDocumentIds |                                  `boolean`                                  | Indicates whether to check the IDs of the document element in addition to the event target for the targetIds.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|    timeout     |           `string`<br/>"none"​｜​"promise"​｜​"setTimeout"​｜​"both"           | Added in 4.2.0 as a replacement for `noTimeout` (for now, specifying `noTimeout: true` will result in setting `timeout: "none"`).<br/>Indicates when the listener should be called based on the option provided.<ul><li>`"none"`: Call the callback immediately.</li><li>`"promise"`: Use [Promise.resolve()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)`.then(callback)`.</li><li>`"setTimeout"`: Use [setTimeout(callback, 0)](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout).</li><li>`"both"`: Use `setTimeout(() => Promise.resolve().then(callback), 0)`.</li></ul>These are typically used to let the event settle before invoking the callback.<br/>If not specified or not an exact match of one of the listed options, defaults to `"setTimeout"`.                                                                                              |
|    nocache     |                                  `boolean`                                  | Indicates whether to ignore events involving Turbo's cached pages.<br/>If not specified, defaults to `false`. See [hotwired.dev discussion](https://discuss.hotwired.dev/t/before-cache-render-event/4928/4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|     noWarn     |                                  `boolean`                                  | Added in 4.2.0 as a replacement for `wkof.turbo.silenceWarnings`.<br/>Indicates whether to prevent logging a console warning if adding a listener after the page has loaded.<br/>If not specified, defaults to `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|      once      |                                  `boolean`                                  | Indicates that the listener should be invoked at most once after being added. If `true`, the listener would be automatically removed when invoked.<br/>If not specified, defaults to `false`. See [EventTarget.addEventListener#once](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#once).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|    capture     |                                  `boolean`                                  | Indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.<br/>If not specified, defaults to `false`. See [EventTarget.addEventListener#capture](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|    passive     |                                  `boolean`                                  | If `true`, indicates that the function specified by listener will never call [preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault). If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning.<br/>If not specified, defaults to `false` – except that in browsers other than Safari, it defaults to `true` for [wheel](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event), [mousewheel](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousewheel_event), [touchstart](https://developer.mozilla.org/en-US/docs/Web/API/Element/touchstart_event), and [touchmove](https://developer.mozilla.org/en-US/docs/Web/API/Element/touchmove_event) events. See [EventTarget.addEventListener#passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive). |
|     signal     | [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | The listener will be removed when the given `AbortSignal` object's [abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) method is called.<br/>If not specified, no `AbortSignal` is associated with the listener. See [EventTarget.addEventListener#signal](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#signal).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |



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
    wkof.turbo.add_event_listeners(eventList, main, options);
}

function main() {
    // start of main script
}
```


#### Various different methods of creating and removing listeners

```javascript
// Make sure the events are fully loaded before starting any configuration of this library.
wkof.ready('TurboEvents').then(configurePageHandler);

// The listener is passed an `event` and `url` argument for all events added via this library.
function myFunction(event, url) {
    console.log(`myFunction() has run for event "${event.type}" with url ${url}`);
}

function configurePageHandler() {
    // Run the callback on "turbo:click" on any page.
    wkof.turbo.events.click.addListener(myFunction);

    const options1 = {
        // Run the listener on the dashboard and on individual radical, kanji, or vocab pages.
        urls: [wkof.turbo.common.locations.dashboard, wkof.turbo.common.locations.items_pages],
        // Do not show warnings about adding listeners after the page has loaded.
        noWarn: true
    };
    // Run the listener on the "turbo:before-visit" event.
    wkof.turbo.add_event_listener(wkof.turbo.events.before_visit, myFunction, options1);
    // The above line is equivalent to either of the following two lines.
    // These will both return false because the listener has already been added with these options. 
    wkof.turbo.events.before_visit.addListener(myFunction, options1);
    wkof.turbo.events["turbo:before-visit"].addListener(myFunction, options1);

    // Add a listener with the same options to the "turbo:visit" event.
    wkof.turbo.events.visit.addListener(myFunction, options1);
    
    // Run the callback on initial page load, turbo:before-render, and turbo:frame_render.
    // See the special case note about "load" in the preceding section.
    let eventList = ['load', wkof.turbo.events.before_render, wkof.turbo.events.frame_render];
    const options2 = {
        // Run the callback on the lessons picker page.
        urls: wkof.turbo.common.locations.lessons_picker,
        // Automatically remove the event after firing once
        once: true,
        // Ignore events for Turbo's cached version of pages.
        nocache: true,
        // Do not show warnings about adding listeners after the page has loaded.
        noWarn: true,
        // Disable the built-in feature that delays the callback execution until the next macrotask.
        timeout: 'none'
    };
    // The first parameter can be an array including either the Turbo event object that is provided
    // (wkof.turbo.events.before_render) or the string itself ("turbo:before-render").
    // Note that two new listeners are added in this example, one for each **Turbo** event.
    wkof.turbo.add_event_listeners(eventList, myFunction, options2);
    // returned array is [
    //     {name: "load", added: false},
    //     {name: "turbo:before-render", added: true},
    //     {name: "turbo:frame-render", added: true}
    // ]

    // Remove a single listener by using
    // `wkof.turbo.remove_event_listener(eventName, listener, options)`.
    // In this scenario, the result would be [false, true, true], since the "load" event does not
    // create a listener. However, if a "turbo:before-render" or "turbo:frame-render" event has
    // fired between creating the listener and making the following call, the respective loop
    // condition or conditions would also return false because the listener or listeners would
    // have already been removed due to using the `once: true` option during creation.
    eventList.map(eventName => {
        // The listener and options must both match the existing listener or the removal will fail. 
        // The listener must be reference equal, but the options can just have equivalent values.
        let equivalentOptions = {urls: wkof.turbo.common.locations.lessons_picker,
            once: true, nocache: true, noWarn: true, timeout: 'none'};
        return wkof.turbo.remove_event_listener(eventName, myFunction, equivalentOptions);
        // this could alternatively be done in the following way:
        return wkof.turbo.events[eventName].removeListener(myFunction, equivalentOptions);
    });

    // Listeners still active: "turbo:click", "turbo:before-visit", and "turbo:visit" 
    // The `remove_event_listeners` can remove multiple at once, however the options must all match.
    eventList = ["turbo:click", "turbo:before-visit", "turbo:visit"];
    wkof.turbo.remove_event_listeners(eventList, myFunction, options1);
    // returned array is [
    //     {"name": "turbo:click", "removed": false},
    //     {"name": "turbo:before-visit", "removed": true},
    //     {"name": "turbo:visit", "removed": true}
    // ]
    // "turbo:click" was not removed because the options did not match. The following will work:
    wkof.turbo.events.click.removeListener(myFunction);

    // Add a listener for all turbo events on any URL.
    // `Object.entries(wkof.turbo.events)` or `Object.values(wkof.turbo.events)` function the same.
    eventList = wkof.turbo.events;
    wkof.turbo.add_event_listeners(eventList, myFunction);
    // returned array is [
    //     {"name": "turbo:click", "added": true},
    //     {"name": "turbo:before-visit", "added": true},
    //     {"name": "turbo:visit", "added": true},
    //     {"name": "turbo:before-cache", "added": true},
    //     {"name": "turbo:before-render", "added": true},
    //     {"name": "turbo:render", "added": true},
    //     {"name": "turbo:load", "added": true},
    //     {"name": "turbo:morph", "added": true},
    //     {"name": "turbo:before-morph-element", "added": true},
    //     {"name": "turbo:before-morph-attribute", "added": true},
    //     {"name": "turbo:morph-element", "added": true},
    //     {"name": "turbo:submit-start", "added": true},
    //     {"name": "turbo:submit-end", "added": true},
    //     {"name": "turbo:before-frame-render", "added": true},
    //     {"name": "turbo:frame-render", "added": true},
    //     {"name": "turbo:frame-load", "added": true},
    //     {"name": "turbo:frame-missing", "added": true},
    //     {"name": "turbo:before-stream-render", "added": true},
    //     {"name": "turbo:before-fetch-request", "added": true},
    //     {"name": "turbo:before-fetch-response", "added": true},
    //     {"name": "turbo:before-prefetch", "added": true},
    //     {"name": "turbo:fetch-request-error", "added": true}
    // ]
}
```
