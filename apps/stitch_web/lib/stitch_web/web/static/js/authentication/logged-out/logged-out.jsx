import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import { Link } from "react-router-dom";
import { AuthenticationPage } from "common/components";

@inject("registrationStore", "titleStore")
@observer
class LoggedOut extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Signed Out");
    window.dispatchEvent(new CustomEvent("logged-out"));
  }

  render() {
    const loginLink = this.props.asPatient ? "/patient/login" : "/login";
    return (
      <AuthenticationPage
        title="Signed Out"
        headerCTA="no-cta"
        description={
          <span>
            You are signed out of{" "}
            <b>{this.props.registrationStore.teamSlug}.InvoChat.io</b>.
          </span>
        }
      >
        <Link
          to={loginLink}
          className="btn btn-block btn-onboarding btn-lg btn-primary"
        >
          Sign Back In
        </Link>
      </AuthenticationPage>
    );
  }
}

LoggedOut.defaultProps = {
  asPatient: false
};

LoggedOut.propTypes = {
  asPatient: PropTypes.bool
};

export default LoggedOut;
