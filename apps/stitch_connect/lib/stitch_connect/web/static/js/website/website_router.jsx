import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";
import withTitle from "../util/with_document_title";

import ScrollToTop from "./components/scrollToTop";

// import Landing from "./landing";
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
import Pricing from "./resources/pricing";
import PrivacyPolicy from "./resources/privacy-policy";
import TermsOfService from "./resources/terms-of-service";
import Industry from "./industries/industry";

class WebsiteRouter extends Component {
  render() {
    return (
      <div className="website-wrapper">
        <ScrollToTop>
          <Switch>
            <Route
              exact
              path="/"
              render={() => <Homepage team={this.props.team} />}
            />
            <Route
              exact
              path="/demo"
              component={withTitle("Request a Demo | Stitch", Demo)}
            />
            <Route
              exact
              path="/connect"
              component={withTitle("Connect | Stitch", Connect)}
            />
            <Route
              exact
              path="/engage"
              component={withTitle("Engage | Stitch", Engage)}
            />
            <Route
              exact
              path="/manage"
              component={withTitle("Manage | Stitch", Manage)}
            />
            <Route
              exact
              path="/pricing"
              component={withTitle("Pricing | Stitch", Pricing)}
            />
            <Route
              exact
              path="/downloads"
              component={withTitle("Downloads | Stitch", Downloads)}
            />
            <Route exact path="/pilot" component={Pilot} />
            <Route
              exact
              path="/jobs"
              component={withTitle("Jobs | Stitch", Jobs)}
            />
            <Route
              exact
              path="/customers"
              component={withTitle("Customers | Stitch", Customers)}
            />
            <Route exact path="/blog" component={Blog} />
            <Route
              exact
              path="/customers/luminance-recovery"
              component={withTitle("Customers | Stitch", CaseLuminance)}
            />
            <Route
              exact
              path="/customers/princeton-brain-spine"
              component={withTitle("Customers | Stitch", CasePBSC)}
            />
            <Route
              exact
              path="/customers/dermatology-skin-surgery-institute"
              component={withTitle("Customers | Stitch", CaseDSSI)}
            />
            <Route
              exact
              path="/customers/UCSF-citywide"
              component={withTitle("Customers | Stitch", CaseUCSF)}
            />
            <Route
              exact
              path="/customers/orchard-medical-associates"
              component={withTitle("Customers | Stitch", CaseOrchardMedical)}
            />
            <Route exact path="/baa" component={Baa} />
            <Route
              exact
              path="/hipaa"
              component={withTitle("HIPAA Compliance | Stitch", Hipaa)}
            />
            <Route exact path="/privacy-policy" component={PrivacyPolicy} />
            <Route exact path="/terms-of-service" component={TermsOfService} />

            <Route exact path="/industries/*" component={Industry} />

            <Route
              path="*"
              component={withTitle("404 | Page Not Found", NotFound)}
            />
          </Switch>
        </ScrollToTop>
      </div>
    );
  }
}

export default withRouter(
  withTitle("Care Coordination | Stitch", WebsiteRouter)
);
