import "es6-promise/auto";

// https://stackoverflow.com/a/36948541/5129131
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

/* eslint-disable */
// CustomEvent issue on IE11
// https://stackoverflow.com/a/26596324/3773265
(function() {
  if (typeof window.CustomEvent === "function") return false; //If not IE

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();
