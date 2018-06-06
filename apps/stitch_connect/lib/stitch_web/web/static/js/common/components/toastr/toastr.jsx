import React, { Component } from "react";
import { ToastContainer, ToastMessage } from "react-toastr";
import notify from "../../../util/notify";

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

class Toastr extends Component {
  componentDidMount() {
    notify.container = this.container;
  }

  render() {
    return (
      <ToastContainer
        ref={input => {
          this.container = input;
        }}
        toastMessageFactory={ToastMessageFactory}
        className="toast-top-right"
      />
    );
  }
}

export default Toastr;
