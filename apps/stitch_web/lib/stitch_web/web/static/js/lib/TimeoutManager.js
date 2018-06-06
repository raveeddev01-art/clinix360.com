export default class TimeoutManager {
  constructor() {
    this.timeouts = [];
  }

  setTimeout(callback, delayInMS) {
    const timeoutID = setTimeout(() => {
      this.clearTimeout(timeoutID);
      callback();
    }, delayInMS);

    this.timeouts.push(timeoutID);
    return timeoutID;
  }

  removeTimeoutID(timeoutID) {
    this.timeouts = this.timeouts.filter(t => t !== timeoutID);
  }

  clearTimeout(timeoutID) {
    clearTimeout(timeoutID);
    this.removeTimeoutID(timeoutID);
  }

  reset() {
    this.timeouts.forEach(t => {
      clearTimeout(t);
    });

    this.timeouts = [];
  }
}
