class Notify {
  _container = null;

  set container(container) {
    this._container = container;
  }

  show = (message, type = "success", timeOut = 5000) => {
    if (!this._container) {
      throw new Error("Toastr container is not defined");
    }

    if (!this._container[type]) {
      throw new Error("Undefined message type");
    }

    this._container[type](message, "", {
      timeOut
    });
  };

  clear = () => {
    if (!this._container) {
      throw new Error("Toastr container is not defined");
    }

    this._container.clear();
  };
}

const notify = new Notify();
window.notify = notify;
export default notify;
