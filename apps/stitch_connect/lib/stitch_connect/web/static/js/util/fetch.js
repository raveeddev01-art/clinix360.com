import merge from "deepmerge";
import "whatwg-fetch";

var Promise = require("es6-promise").Promise;

window.csrfToken = "";
var metaElem = document.querySelector("meta[name=csrf-token]");
if (metaElem) window.csrfToken = metaElem.getAttribute("content");

window.CSRFFetch = function(url, options = {}) {
  if (!(options.body instanceof FormData)) {
    if (window.authenticationToken) {
      options.body = merge(options.body, {
        authenticationToken: window.authenticationToken
      });
    }
    options.body = JSON.stringify(options.body);
  }

  if (options.method === "GET") {
    options.body = undefined;
  }

  return fetch(
    url,
    merge(
      {
        headers: {
          "x-csrf-token": window.csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "same-origin"
      },
      options
    )
  );
};

window.jCSRFFetch = function(url, options = {}) {
  if (window.authenticationToken) {
    let modifiedUrl =
      url +
      (url.indexOf("?") > -1 ? "&" : "?") +
      `authenticationToken=${window.authenticationToken}`;
    url = modifiedUrl;
  }
  return window
    .CSRFFetch(
      url,
      merge(
        {
          headers: merge(
            { Accept: "application/json" },
            options.body instanceof FormData
              ? {}
              : { "Content-Type": "application/json" }
          )
        },
        options
      )
    )
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        notify.show(
          json.message || "There was problem with your request",
          "error"
        );

        return Promise.reject({
          status: response.status,
          data: json
        });
      }

      return {
        status: response.status,
        data: json
      };
    });
};

window.get = function(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "GET" }));
};
window.post = function(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "POST" }));
};
window.put = function(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "PUT" }));
};
window.patch = function(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "PATCH" }));
};
window.remove = function(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "DELETE" }));
};
