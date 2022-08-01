import React, { Component } from "react";
import { observer } from "mobx-react";

@observer
class ConnectionError extends Component {
  render() {
    return (
        <div className="connection-error">
          <i className="fa fa-exclamation-circle"></i>
          InvoChat is trying to connect.
        </div>
    );
  }
}

export default ConnectionError;
