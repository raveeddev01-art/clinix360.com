import React, { Component } from "react";
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Header from "./components/header";
import Footer from "./components/footer";

import Landing from "./landing";
import Connect from "./products/connect";
import Pricing from "./resources/pricing";
import Downloads from "./resources/downloads";

@inject("titleStore")
@observer
class WebsiteRouter extends Component {
  render() {
    return (
      <div className="website-wrapper">
        <Header />

        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/connect" component={Connect} />
          <Route exact path="/pricing" component={Pricing} />
          <Route exact path="/downloads" component={Downloads} />
          {/* <Route exact path="/signin" component={TeamPicker} />
          <Route exact path="/find-teams" component={FindTeam} />

          <Route exact path="/login" component={Login} />
          <Route path="/signup" component={Registration} />

          <Route exact path="/reset-password" component={SendEmail} />
          <Route exact path="/reset-password/:token" component={SetPassword} /> */}

          <Route component={() => <Redirect to="/" />} />
        </Switch>

        <Footer />
      </div>
    );
  }
}

export default withRouter(WebsiteRouter);
