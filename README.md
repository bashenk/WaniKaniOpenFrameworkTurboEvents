# Wanikani Open Framework Turbo Events

Library script that adds helpful methods to [WaniKani Open Framework](https://community.wanikani.com/t/wanikani-open-framework-developer-thread/22231) for dealing with [Turbo Events](https://turbo.hotwired.dev/reference/events) that scripts developers can use to simplify their workflow.

All additions are added to a new `turbo` property of the `wkof` object, thus accessible via `wkof.turbo`.

### Basic exposed object

#### The `wkof.turbo` object
The `wkof.turbo` object has the following properties and methods:
- `on`
  - `events(eventList, callback, urls)`
  - `click(callback, urls)`
  - `before_visit(callback, urls)`
  - `visit(callback, urls)`
  - `before_cache(callback, urls)`
  - `before_render(callback, urls)`
  - `render(callback, urls)`
  - `load(callback, urls)`
  - `morph(callback, urls)`
  - `before_morph_element(callback, urls)`
  - `before_morph_attribute(callback, urls)`
  - `morph_element(callback, urls)`
  - `submit_start(callback, urls)`
  - `submit_end(callback, urls)`
  - `before_frame_render(callback, urls)`
  - `frame_render(callback, urls)`
  - `frame_load(callback, urls)`
  - `frame_missing(callback, urls)`
  - `before_stream_render(callback, urls)`
  - `before_fetch_request(callback, urls)`
  - `before_fetch_response(callback, urls)`
  - `before_prefetch(callback, urls)`
  - `fetch_request_error(callback, urls)`
- `events`
  - `click`
    - `source: 'document'`
    - `name: 'turbo:click'`
  - `before_visit`
    - `source: 'document'`
    - `name: 'turbo:before-visit'`
  - `visit`
    - `source: 'document'`
    - `name: 'turbo:visit'`
  - `before_cache`
    - `source: 'document'`
    - `name: 'turbo:before-cache'`
  - `before_render`
    - `source: 'document'`
    - `name: 'turbo:before-render'`
  - `render`
    - `source: 'document'`
    - `name: 'turbo:render'`
  - `load`
    - `source: 'document'`
    - `name: 'turbo:load'`
  - `morph`
    - `source: 'pageRefresh'`
    - `name: 'turbo:morph'`
  - `before_morph_element`
    - `source: 'pageRefresh'`
    - `name: 'turbo:before-morph-element'`
  - `before_morph_attribute`
    - `source: 'pageRefresh'`
    - `name: 'turbo:before-morph-attribute'`
  - `morph_element`
    - `source: 'pageRefresh'`
    - `name: 'turbo:morph-element'`
  - `submit_start`
    - `source: 'forms'`
    - `name: 'turbo:submit-start'`
  - `submit_end`
    - `source: 'forms'`
    - `name: 'turbo:submit-end'`
  - `before_frame_render`
    - `source: 'frames'`
    - `name: 'turbo:before-frame-render'`
  - `frame_render`
    - `source: 'frames'`
    - `name: 'turbo:frame-render'`
  - `frame_load`
    - `source: 'frames'`
    - `name: 'turbo:frame-load'`
  - `frame_missing`
    - `source: 'frames'`
    - `name: 'turbo:frame-missing'`
  - `before_stream_render`
    - `source: 'streams'`
    - `name: 'turbo:before-stream-render'`
  - `before_fetch_request`
    - `source: 'httpRequests'`
    - `name: 'turbo:before-fetch-request'`
  - `before_fetch_response`
    - `source: 'httpRequests'`
    - `name: 'turbo:before-fetch-response'`
  - `before_prefetch`
    - `source: 'httpRequests'`
    - `name: 'turbo:before-prefetch'`
  - `fetch_request_error`
    - `source: 'httpRequests'`
    - `name: 'turbo:fetch-request-error'`
- `add_event_listener(eventNames, listener)`
  - returns: `object`
    - `remove()`
      - Convenience method to remove all listeners created by the prior method
    - `eventName1: listener`
    - `...`
- `remove_event_listener(eventName, listener)`
  - returns: `boolean`
    - `true` on successful removal
    - `false` on invalid inputs or listener already not active

### General Notes

#### Whenever a specific URL is required
1. Pass one or more URLs to the method in `wkof.turbo.on` that will be used. 
   - URL inputs can be a `string`, a `RegExp`, or an array consisting of a mixture of those.
2. Set the `@match` userscript directive to `https://www.wanikani.com/*` or equivalent.
   - Otherwise, the script may not end up running if the user refreshes the page somewhere unexpected.

### Example usage

```javascript
// Make sure the events are fully loaded before starting your configuration.
wkof.ready('TurboEvents').then(configurePageHandler);

// The callback function can accept an event argument (if desired), which will be provided in all
// turbo events I.e., it will not be provided in the 'load' event (not to be confused with the 
// 'turbo:load' event), if used.
function callbackFunction(event) {
    console.log(`callbackFunction() has run for event "${event?.type}"`);
}

const reviewsRegex = /https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/;
const dashboardRegex = /https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/;

function configurePageHandler() {
    // Run the callback on turbo:click on any page.
    const onClick = wkof.turbo.on.click(callbackFunction);
    // Returned object contains a reference to the listener in its property named after the event.
    let eventName = wkof.turbo.events.click.name;
    const onClickListener = onClick[eventName]; // alternative: onclick['turbo:click']

    // Run the callback on turbo:before-render only on reviews pages
    const onBeforeRender = wkof.turbo.on.before_render(callbackFunction, [reviewsRegex]);

    // Run the callback on initial page load and turbo:before-render only on the dashboard.
    // The first parameter can be an array including either the turbo event object that is provided
    // (wkof.turbo.events.before_render) or the string itself ('turbo:before-render').
    // Note that two new listeners are added in this example, one for each event.
    let eventList = ['load', wkof.turbo.events.before_render];
    const onLoadAndBeforeRender = wkof.turbo.on.events(eventList, callbackFunction, [dashboardRegex]);

    // Remove the listener(s) if no longer desired (this function removes both listeners).
    onLoadAndBeforeRender.remove();

    // Can alternatively remove listeners with the base turbo object
    eventName = wkof.turbo.events.before_render.name;
    wkof.turbo.remove_event_listener(wkof.turbo.events.before_render, onBeforeRender[eventName]);


    // Can also use the more generic method to add/remove listeners with more fine-tuned control
    const visitListener = {callback: callbackFunction, urls: []};
    const visitHandler = wkof.turbo.add_event_listener(wkof.turbo.events.visit, visitListener)
    wkof.turbo.remove_event_listener(wkof.turbo.events.visit, visitListener);

    // onClick listener still active
}
```
