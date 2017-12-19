import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";
import { Helmet } from "react-helmet";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import Login from "./login/login";
import TeamPicker from "./team/team_picker";
import LegacyRouter from "./legacy_router";

@inject("titleStore")
@observer
class AuthenticationRouter extends Component {
  render() {
    const { titleStore } = this.props;
    const onboardingWrapperClass = cx("onboarding-wrapper", {
      "on-electron": window.electronApp
    });

    return (
      <div className={onboardingWrapperClass}>
        <Helmet>
          <title>{titleStore.title}</title>

          <script type="text/javascript">{`
              window.intercomSettings = {
                app_id: "jig8cj9z",
                hide_default_launcher: false
              };
          `}</script>
        </Helmet>
        <Switch>
          <Route exact path="/signin" component={TeamPicker} />
          <Route exact path="/login" render={() => <Login {...this.props} />} />
          <Route path="/" component={LegacyRouter} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(AuthenticationRouter);
