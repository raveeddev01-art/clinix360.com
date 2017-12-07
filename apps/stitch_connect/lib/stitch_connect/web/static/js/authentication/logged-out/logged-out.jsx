import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { Link } from "react-router-dom";

@inject("registrationStore", "titleStore")
@observer
export default class Loggedout extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Signed Out");
  }

  render() {
    return (
      <div>
        <div className="authentication-card text-center m-b-20">
          <h2>Signed Out</h2>
          <h5 className="text-muted url-heading">
            {this.props.registrationStore.teamSlug}.teamstitch.com
          </h5>

          <Link to="/login" className="btn btn-block btn-lg btn-primary">
            Sign Back In
          </Link>
        </div>
      </div>
    );
  }
}
