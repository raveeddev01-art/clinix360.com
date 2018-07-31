export default class Windows {
  static open(url, options = {}) {
    const opts = {
      width: 850,
      height: 600,
      directories: "no",
      titlebar: "no",
      toolbar: "no",
      location: "no",
      status: "no",
      menubar: "no",
      copyhistory: "no",
      name: "_blank",
      ...options
    };

    opts.width = Math.min(opts.width, screen.width);
    opts.height = Math.min(opts.height, screen.height);
    opts.left = window.outerWidth / 2 + window.screenX - opts.width / 2;
    opts.top = window.outerHeight / 2 + window.screenY - opts.height / 2;

    const o = Object.entries(opts).map(([key, value]) => `${key}=${value}`);
    return window.open(url, opts.name, o.toString());
  }
}
