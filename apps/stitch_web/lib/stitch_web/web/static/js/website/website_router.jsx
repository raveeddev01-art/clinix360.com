import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";
import withTitle from "../util/with_document_title";

import ScrollToTop from "./components/scrollToTop";

import Homepage from "./homepage";
import Connect from "./products/connect";
import Engage from "./products/engage";
import Manage from "./products/manage";
import CaseDSSI from "./case-studies/dssi";
import CaseLuminance from "./case-studies/luminance";
import CaseOrchardMedical from "./case-studies/orchard-medical";
import CasePBSC from "./case-studies/pbsc";
import CaseUCSF from "./case-studies/ucsf";
import Baa from "./resources/baa";
import Blog from "./resources/blog";
import Customers from "./resources/customers";
import Demo from "./resources/demo";
import Downloads from "./resources/downloads";
import Hipaa from "./resources/hipaa";
import Jobs from "./resources/jobs";
import NotFound from "./resources/not-found";
import Pilot from "./resources/pilot";
// import Pricing from "./resources/pricing";
import Pricing from "./pricing/pricing";
import PrivacyPolicy from "./resources/privacy-policy";
import TermsOfService from "./resources/terms-of-service";
import Industry from "./industries/industry";

// PAGE TITLES
// if changed, sync with backend (home_controller)
const defaultTitle = "Care Coordination | Stitch";
const demoTitle = "Request a Demo | Stitch";
const connectTitle = "Connect | Stitch";
const engageTitle = "Engage | Stitch";
const manageTitle = "Manage | Stitch";
const pricingTitle = "Pricing | Stitch";
const downloadsTitle = "Downloads | Stitch";
const jobsTitle = "Jobs | Stitch";
const customersTitle = "Customers | Stitch";
const hipaaTitle = "HIPAA Compliance | Stitch";
const notFoundTitle = "404 | Page Not Found";

class WebsiteRouter extends Component {
  render() {
    return (
      <div className="website-wrapper">
        <ScrollToTop>
          <Switch>
            <Route exact path="/" component={Homepage} />
            <Route exact path="/demo" component={withTitle(demoTitle, Demo)} />
            <Route
              exact
              path="/connect"
              component={withTitle(connectTitle, Connect)}
            />
            <Route
              exact
              path="/engage"
              component={withTitle(engageTitle, Engage)}
            />
            <Route
              exact
              path="/manage"
              component={withTitle(manageTitle, Manage)}
            />
            <Route
              exact
              path="/pricing"
              component={withTitle(pricingTitle, Pricing)}
            />
            <Route
              exact
              path="/downloads"
              component={withTitle(downloadsTitle, Downloads)}
            />
            <Route exact path="/pilot" component={Pilot} />
            <Route exact path="/jobs" component={withTitle(jobsTitle, Jobs)} />
            <Route
              exact
              path="/customers"
              component={withTitle(customersTitle, Customers)}
            />
            <Route exact path="/blog" component={Blog} />
            <Route
              exact
              path="/customers/luminance-recovery"
              component={withTitle(customersTitle, CaseLuminance)}
            />
            <Route
              exact
              path="/customers/princeton-brain-spine"
              component={withTitle(customersTitle, CasePBSC)}
            />
            <Route
              exact
              path="/customers/dermatology-skin-surgery-institute"
              component={withTitle(customersTitle, CaseDSSI)}
            />
            <Route
              exact
              path="/customers/UCSF-citywide"
              component={withTitle(customersTitle, CaseUCSF)}
            />
            <Route
              exact
              path="/customers/orchard-medical-associates"
              component={withTitle(customersTitle, CaseOrchardMedical)}
            />
            <Route exact path="/baa" component={Baa} />
            <Route
              exact
              path="/hipaa"
              component={withTitle(hipaaTitle, Hipaa)}
            />
            <Route exact path="/privacy-policy" component={PrivacyPolicy} />
            <Route exact path="/terms-of-service" component={TermsOfService} />

            <Route exact path="/industries/*" component={Industry} />

            <Route path="*" component={withTitle(notFoundTitle, NotFound)} />
          </Switch>
        </ScrollToTop>
      </div>
    );
  }
}

export default withRouter(withTitle(defaultTitle, WebsiteRouter));
