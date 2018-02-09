import merge from "deepmerge";
import "whatwg-fetch";
import Promise from "bluebird";

window.csrfToken = "";
const metaElem = document.querySelector("meta[name=csrf-token]");
if (metaElem) window.csrfToken = metaElem.getAttribute("content");

window.CSRFFetch = function CSRFFetch(url, options = {}) {
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

window.jCSRFFetch = function jCSRFFetch(url, params = {}) {
  let modifiedUrl = url;
  if (window.authenticationToken) {
    modifiedUrl = `${url +
      (url.indexOf("?") > -1
        ? "&"
        : "?")}authenticationToken=${window.authenticationToken}`;
  }

  const { hideNotify, ...options } = params;

  return window
    .CSRFFetch(
      modifiedUrl,
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
    .then(response => {
      if (response.status === 204) {
        return { json: {}, response };
      }

      return response.json().then(json => ({ json, response }));
    })
    .then(({ json, response }) => {
      if (!response.ok) {
        if (!hideNotify) {
          notify.show(
            json.message || "There was problem with your request",
            "error"
          );
        }

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

window.get = function get(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "GET" }));
};

window.post = function post(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "POST" }));
};

window.put = function put(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "PUT" }));
};

window.patch = function patch(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "PATCH" }));
};

window.remove = function remove(url, options = {}) {
  return window.jCSRFFetch(url, merge(options, { method: "DELETE" }));
};
