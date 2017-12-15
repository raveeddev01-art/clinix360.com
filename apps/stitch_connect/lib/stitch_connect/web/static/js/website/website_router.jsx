import React, { Component } from "react";
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { observer } from "mobx-react";

import Header from "./components/header";
import Footer from "./components/footer";
import ScrollToTop from "./components/scrollToTop";

import Landing from "./landing";
import Homepage from "./homepage";
import Connect from "./products/connect";
import Engage from "./products/engage";
import Manage from "./products/manage";
import Pricing from "./resources/pricing";
import Downloads from "./resources/downloads";
import Demo from "./resources/demo";
import Pilot from "./resources/pilot";
import Jobs from "./resources/jobs";
import Customers from "./resources/customers";
import Blog from "./resources/blog";
import CaseLuminance from "./case-studies/luminance";
import CasePBSC from "./case-studies/pbsc";
import CaseDSSI from "./case-studies/dssi";
import CaseUCSF from "./case-studies/ucsf";
import CaseOrchardMedical from "./case-studies/orchard-medical";
import Baa from "./resources/baa";
import Hipaa from "./resources/hipaa";
import PrivacyPolicy from "./resources/privacy-policy";
import TermsOfService from "./resources/terms-of-service";

@observer
class WebsiteRouter extends Component {
  render() {
    return (
      <div className="website-wrapper">
        <ScrollToTop>
          <Switch>
            {/* <Route exact path="/" component={Landing} /> */}
            <Route exact path="/" component={Homepage} />
            <Route exact path="/demo" component={Demo} />
            <Route exact path="/connect" component={Connect} />
            <Route exact path="/engage" component={Engage} />
            <Route exact path="/manage" component={Manage} />
            <Route exact path="/pricing" component={Pricing} />
            <Route exact path="/downloads" component={Downloads} />
            <Route exact path="/pilot" component={Pilot} />
            <Route exact path="/jobs" component={Jobs} />
            <Route exact path="/customers" component={Customers} />
            <Route exact path="/blog" component={Blog} />
            <Route
              exact
              path="/customers/luminance-recovery"
              component={CaseLuminance}
            />
            <Route
              exact
              path="/customers/princeton-brain-spine"
              component={CasePBSC}
            />
            <Route
              exact
              path="/customers/dermatology-skin-surgery-institute"
              component={CaseDSSI}
            />
            <Route exact path="/customers/UCSF-citywide" component={CaseUCSF} />
            <Route
              exact
              path="/customers/orchard-medical-associates"
              component={CaseOrchardMedical}
            />
            <Route exact path="/baa" component={Baa} />
            <Route exact path="/hipaa" component={Hipaa} />
            <Route exact path="/privacy-policy" component={PrivacyPolicy} />
            <Route exact path="/terms-of-service" component={TermsOfService} />

            <Route component={() => <Redirect to="/" />} />
          </Switch>
        </ScrollToTop>
      </div>
    );
  }
}

export default withRouter(WebsiteRouter);
