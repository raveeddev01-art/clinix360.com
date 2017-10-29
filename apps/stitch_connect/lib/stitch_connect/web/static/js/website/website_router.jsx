import React, { Component } from "react";
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Header from "./components/header";
import Footer from "./components/footer";

import Landing from "./landing";
import Connect from "./products/connect";
import Pricing from "./resources/pricing";
import Downloads from "./resources/downloads";
import Customers from "./resources/customers";
import PrivacyPolicy from "./resources/privacy-policy";
import TermsOfService from "./resources/terms-of-service";

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
          <Route exact path="/customers" component={Customers} />
          <Route exact path="/privacy-policy" component={PrivacyPolicy} />
          <Route exact path="/terms-of-service" component={TermsOfService} />

          <Route component={() => <Redirect to="/" />} />
        </Switch>

        <Footer />
      </div>
    );
  }
}

export default withRouter(WebsiteRouter);
