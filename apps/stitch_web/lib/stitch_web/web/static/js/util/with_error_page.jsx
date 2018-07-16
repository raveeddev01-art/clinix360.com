import React, { Component } from "react";
import SystemError from "../common/components/error/system-error";

const withErrorPage = (reloadDestination, ExtendedComponent) =>
  // withErrorPage is a higher order component that wraps a child
  // component and catches errors.

  // reloadDestination is the place that the "Reload App" button
  // directs to when it is clicked.

  class ErrorWrapper extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    componentDidCatch(error) {
      this.setState({ hasError: true });
      if (Raven) {
        Raven.captureException(error);
      }
    }

    render() {
      if (this.state.hasError) {
        return <SystemError reloadDestination={reloadDestination} />;
      }

      return (
        <div>
          <ExtendedComponent {...this.props} />
        </div>
      );
    }
  };

export default withErrorPage;
