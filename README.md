# Wanikani Open Framework Turbo Events

Library script that adds helpful methods to [WaniKani Open Framework](https://community.wanikani.com/t/wanikani-open-framework-developer-thread/22231) for dealing with [Turbo Events](https://turbo.hotwired.dev/reference/events) that scripts developers can use to simplify their workflow.

All additions are added to a new `turbo` property of the `wkof` object, thus accessible via `wkof.turbo`.

### Example usage:

```javascript
// Make sure the events are fully loaded before starting your configuration.
wkof.ready('TurboEvents').then(configurePageHandler);

// The callback function can accept an event argument (if desired), which will be provided in all turbo events
// I.e., it will not be provided in the 'load' event (not to be confused with the 'turbo:load' event), if used.
function callbackFunction(event) {
    console.log(`callbackFunction() has run for event "${event?.type}"`);
}

const reviewsRegex = /https:\/\/www\.wanikani\.com\/subjects\/review.*\/?$/;
const dashboardRegex = /https:\/\/www\.wanikani\.com(\/dashboard.*)?\/?$/;

function configurePageHandler() {
    // Run the callback on turbo:click on any page.
    const onClick = wkof.turbo.on.click(callbackFunction);
    // The returned object contains a reference to the listener, using the event name as the property name.
    let eventName = wkof.turbo.events.click.name;
    const onClickListener = onClick[eventName]; // alternative: onclick['turbo:click']

    // Run the callback on turbo:before-render only on reviews pages
    const onBeforeRender = wkof.turbo.on.before_render(callbackFunction, [reviewsRegex]);

    // Run the callback on initial page load and turbo:before-render only on the dashboard.
    // The first parameter can be an array including either the turbo event object that is
    // provided (wkof.turbo.events.before_render) or the string itself ('turbo:before-render')
    // Note that two new listeners are added in this example, one for each event.
    let eventList = ['load', wkof.turbo.events.before_render];
    const onLoadAndBeforeRender = wkof.turbo.on.events(eventList, callbackFunction, [dashboardRegex]);

    // Remove the listener(s) if no longer desired (this convenience function removes both listeners)
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
