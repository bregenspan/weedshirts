/**
 * Adds a CSS transition listener with a timeout, to handle cases where Chrome
 * sometimes takes long after the transition is visually complete to fire the transition
 * complete event.
 * @param {Element} el
 * @param {Function} handler
 * @param {Number} timeout
 */
function impatientCssTransitionListener(el, handler, timeout) {
    var events = ['transitionend', 'webkitTransitionend', 'mozTransitionend'],
        called = false;

    function wrappedHandler(e) {
        called = true;
        if (!e || e.target === e.currentTarget) { // don't handle bubbled events
            handler.call(el);
        }
    }

    events.forEach(function (event) {
        el.addEventListener(event, wrappedHandler, true);
    });

    window.setTimeout(function () {
        events.forEach(function (event) {
            el.removeEventListener(event, wrappedHandler, true);
        });
        if (!called) {
            wrappedHandler.call();
        }
    }, timeout);
}

module.exports = impatientCssTransitionListener;
