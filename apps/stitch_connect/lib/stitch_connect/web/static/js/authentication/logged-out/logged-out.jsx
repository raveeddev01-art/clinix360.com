import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { Link } from "react-router-dom";
import { AuthenticationPage } from "common/components";

@inject("registrationStore", "titleStore")
@observer
export default class LoggedOut extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Signed Out");
  }

  render() {
    return (
      <AuthenticationPage
        title="Signed Out"
        description={
          <span>
            You are signed out of{" "}
            <b>{this.props.registrationStore.teamSlug}.teamstitch.com</b>.
          </span>
        }
      >
        <Link
          to="/login"
          className="btn btn-block btn-onboarding btn-lg btn-primary"
        >
          Sign Back In
        </Link>
      </AuthenticationPage>
    );
  }
}
