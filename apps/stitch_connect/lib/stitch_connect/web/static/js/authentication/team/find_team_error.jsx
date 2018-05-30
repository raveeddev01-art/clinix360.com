import React, { Component } from "react";
import { inject } from "mobx-react";

import { AuthenticationPage } from "common/components";

@inject("titleStore")
export default class FindTeam extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Find Team");
  }

  render() {
    return (
      <AuthenticationPage
        title="Oops!"
        description={<span>Your session has expired. Please try again.</span>}
      >
        <hr />
        <h5>
          Just getting started?{" "}
          <a href={`https://${applicationHost}/signup/email`}>
            <strong>Create a new team</strong>
          </a>
        </h5>
      </AuthenticationPage>
    );
  }
}
