import React from "react";
import Alert from "react-bootstrap/lib/Alert";

// Passed to component to add alert state
// and callbacks for controlling state

const withAlertState = GivenComponent => {
  class ExtendedComponent extends GivenComponent {
    constructor(props) {
      super(props);

      this.state = Object.assign({}, this.state || {}, {
        alertMessage: "",
        alertStyle: "",
        alertVisible: false
      });
    }

    renderAlert = () => {
      return (
        this.state.alertVisible && (
          <Alert bsStyle={this.state.alertStyle}>
            {this.state.alertMessage}
          </Alert>
        )
      );
    };

    onSuccess = message => {
      this.setState({
        alertMessage: message,
        alertVisible: true,
        alertStyle: "success"
      });
    };

    onError = message => {
      this.setState({
        alertMessage: message,
        alertVisible: true,
        alertStyle: "danger"
      });
    };

    hideAlert = () => {
      this.setState({
        alertVisible: false
      });
    };
  }

  return ExtendedComponent;
};

export default withAlertState;
